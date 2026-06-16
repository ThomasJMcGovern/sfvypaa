import { listAuditLog } from "@valleypaa/content";
import { Terminal, UserRound } from "lucide-react";

import { AdminPageHead, AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function publicSiteUrl() {
  return (process.env.VALLEYPAA_PUBLIC_SITE_URL || "https://valleypaa.org").replace(
    /\/+$/,
    "",
  );
}

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatAt(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : timeFormatter.format(date);
}

export default async function AuditPage() {
  const admin = await requireAdmin();
  const entries = await listAuditLog(100);

  return (
    <AdminShell active="audit" admin={admin} publicSiteUrl={publicSiteUrl()}>
      <div className="mx-auto max-w-[920px]">
        <AdminPageHead
          eyebrow="History"
          sub="Every content and team change, who made it, and where it came from. The newest 100 actions."
          title="Audit log"
        />

        {entries.length === 0 ? (
          <div className="border-2 border-dashed border-border/35 px-6 py-[72px] text-center">
            <p className="text-base text-text-soft">No changes logged yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {entries.map((entry) => (
              <div
                className="flex flex-wrap items-center gap-3 border-2 border-border bg-card px-4 py-3 text-card-foreground"
                key={entry.id}
              >
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {formatAt(entry.at)}
                </span>
                <Badge variant={entry.source === "cli" ? "accent" : "outline"}>
                  {entry.source === "cli" ? (
                    <Terminal data-icon="inline-start" />
                  ) : (
                    <UserRound data-icon="inline-start" />
                  )}
                  {entry.action}
                </Badge>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                  {entry.targetTitle || entry.targetType}
                  {entry.summary ? (
                    <span className="font-normal text-text-soft">
                      {" "}
                      — {entry.summary}
                    </span>
                  ) : null}
                </span>
                <span className="font-mono text-xs text-text-soft">
                  {entry.actorName || entry.actorId}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
