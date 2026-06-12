import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb, isFirebaseConfigured } from "./firebase";

export const auditLogCollection = "audit_log";

export type AuditSource = "admin-ui" | "cli" | "system";

/**
 * Who performed an action. For the admin UI this is the signed-in person's
 * email; for the CLI/Claude Code it is "cli:<os-user>@<host>" plus the git
 * identity that ran it — so scripted changes are always traceable and visibly
 * distinct from admin-UI changes.
 */
export type Actor = {
  id: string;
  source: AuditSource;
  name?: string;
  gitEmail?: string;
};

export type AuditTargetType =
  | "event"
  | "newsletter"
  | "social"
  | "settings"
  | "admin";

export type AuditEntry = {
  actor: Actor;
  action: string;
  targetType: AuditTargetType;
  targetId?: string;
  targetTitle?: string;
  summary?: string;
};

export const systemActor: Actor = { id: "system", source: "system" };

function actorLabel(actor: Actor) {
  const git = actor.gitEmail ? ` (git ${actor.gitEmail})` : "";
  return `${actor.id}${git}`;
}

async function notifyExternalSink(line: string) {
  const url = process.env.SFVYPAA_AUDIT_WEBHOOK_URL;

  if (!url) {
    return;
  }

  // Append-only, tamper-evident copy (Slack/Discord-compatible incoming
  // webhook). Fire-and-forget — a down webhook must never block a content write.
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: line }),
      signal: AbortSignal.timeout(2500),
    });
  } catch (error) {
    console.error("[audit] external sink failed", {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Record who did what, from where. Writes to the Firestore `audit_log`
 * collection, mirrors to the external sink, and always emits a structured
 * console line (captured by Vercel runtime logs) as the guaranteed fallback.
 * Never throws — auditing must not break the underlying write.
 */
export async function recordAudit(entry: AuditEntry) {
  const line = `[audit] ${entry.action} ${entry.targetType}${
    entry.targetId ? `/${entry.targetId}` : ""
  } by ${actorLabel(entry.actor)} via ${entry.actor.source}${
    entry.summary ? ` — ${entry.summary}` : ""
  }`;

  console.log(line);

  if (isFirebaseConfigured()) {
    try {
      await getAdminDb()
        .collection(auditLogCollection)
        .add({
          at: FieldValue.serverTimestamp(),
          actorId: entry.actor.id,
          actorName: entry.actor.name ?? null,
          actorGitEmail: entry.actor.gitEmail ?? null,
          source: entry.actor.source,
          action: entry.action,
          targetType: entry.targetType,
          targetId: entry.targetId ?? null,
          targetTitle: entry.targetTitle ?? null,
          summary: entry.summary ?? null,
        });
    } catch (error) {
      console.error("[audit] firestore write failed", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await notifyExternalSink(line);
}

export type AuditLogRecord = {
  id: string;
  at?: string;
  actorId: string;
  actorName?: string;
  source: AuditSource;
  action: string;
  targetType: string;
  targetId?: string;
  targetTitle?: string;
  summary?: string;
};

export async function listAuditLog(limit = 100): Promise<AuditLogRecord[]> {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const snapshot = await getAdminDb()
      .collection(auditLogCollection)
      .orderBy("at", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const at = data.at as { toDate?: () => Date } | undefined;

      return {
        id: doc.id,
        at:
          typeof at?.toDate === "function"
            ? at.toDate().toISOString()
            : undefined,
        actorId: String(data.actorId ?? "unknown"),
        actorName:
          typeof data.actorName === "string" ? data.actorName : undefined,
        source: (data.source as AuditSource) ?? "system",
        action: String(data.action ?? ""),
        targetType: String(data.targetType ?? ""),
        targetId: typeof data.targetId === "string" ? data.targetId : undefined,
        targetTitle:
          typeof data.targetTitle === "string" ? data.targetTitle : undefined,
        summary: typeof data.summary === "string" ? data.summary : undefined,
      };
    });
  } catch (error) {
    console.error("[audit] list failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
