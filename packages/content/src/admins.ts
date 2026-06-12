import { FieldValue } from "firebase-admin/firestore";

import { recordAudit, type Actor } from "./audit";
import { getAdminDb, isFirebaseConfigured } from "./firebase";

export const adminsCollection = "admins";

export type AdminRole = "owner" | "admin";

export type AdminRecord = {
  email: string;
  name: string;
  role: AdminRole;
  addedBy?: string;
  addedAt?: string;
};

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function adminFromData(email: string, data: FirebaseFirestore.DocumentData) {
  const at = data.addedAt as { toDate?: () => Date } | undefined;

  return {
    email,
    name: typeof data.name === "string" ? data.name : email,
    role: data.role === "owner" ? "owner" : "admin",
    addedBy: typeof data.addedBy === "string" ? data.addedBy : undefined,
    addedAt:
      typeof at?.toDate === "function" ? at.toDate().toISOString() : undefined,
  } satisfies AdminRecord;
}

/** Look up an admin by email. Returns null if not on the allowlist. */
export async function getAdmin(email: string): Promise<AdminRecord | null> {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const id = normalizeEmail(email);
  const doc = await getAdminDb().collection(adminsCollection).doc(id).get();

  return doc.exists ? adminFromData(id, doc.data()!) : null;
}

export async function listAdmins(): Promise<AdminRecord[]> {
  if (!isFirebaseConfigured()) {
    return [];
  }

  const snapshot = await getAdminDb().collection(adminsCollection).get();

  return snapshot.docs
    .map((doc) => adminFromData(doc.id, doc.data()))
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function countOwners(): Promise<number> {
  const admins = await listAdmins();
  return admins.filter((admin) => admin.role === "owner").length;
}

/** Add an admin or change their role/name. Audited. */
export async function setAdmin(
  input: { email: string; name: string; role: AdminRole },
  actor: Actor,
): Promise<AdminRecord> {
  const email = normalizeEmail(input.email);

  if (!email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  const db = getAdminDb();
  const ref = db.collection(adminsCollection).doc(email);
  const existing = await ref.get();

  await ref.set(
    {
      email,
      name: input.name.trim() || email,
      role: input.role,
      addedBy: existing.exists ? existing.data()?.addedBy : actor.id,
      addedAt: existing.exists
        ? (existing.data()?.addedAt ?? FieldValue.serverTimestamp())
        : FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await recordAudit({
    actor,
    action: existing.exists ? "admin.update" : "admin.add",
    targetType: "admin",
    targetId: email,
    targetTitle: input.name.trim() || email,
    summary: `${input.role} · ${email}`,
  });

  return { email, name: input.name.trim() || email, role: input.role };
}

/** Remove an admin from the allowlist. Refuses to remove the last owner. Audited. */
export async function removeAdmin(
  email: string,
  actor: Actor,
): Promise<void> {
  const id = normalizeEmail(email);
  const target = await getAdmin(id);

  if (!target) {
    return;
  }

  if (target.role === "owner" && (await countOwners()) <= 1) {
    throw new Error("Cannot remove the last owner.");
  }

  await getAdminDb().collection(adminsCollection).doc(id).delete();

  await recordAudit({
    actor,
    action: "admin.remove",
    targetType: "admin",
    targetId: id,
    targetTitle: target.name,
    summary: `removed ${target.role} · ${id}`,
  });
}
