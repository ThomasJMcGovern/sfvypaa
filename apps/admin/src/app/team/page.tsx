import { listAdmins } from "@valleypaa/content";
import { Trash2 } from "lucide-react";

import { removeTeamMemberAction } from "@/app/team/actions";
import { AdminPageHead, AdminShell } from "@/components/admin-shell";
import { TeamForm } from "@/components/team-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireOwner } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function publicSiteUrl() {
  return (process.env.SFVYPAA_PUBLIC_SITE_URL || "https://valleypaa.org").replace(
    /\/+$/,
    "",
  );
}

export default async function TeamPage() {
  const owner = await requireOwner();
  const admins = await listAdmins();

  return (
    <AdminShell active="team" admin={owner} publicSiteUrl={publicSiteUrl()}>
      <div className="mx-auto max-w-[840px]">
        <AdminPageHead
          eyebrow="Owners only"
          sub="Who can sign into this console. Access is per-person Google sign-in; removing someone revokes their session immediately."
          title="Team"
        />

        <TeamForm />

        <div className="mt-6 flex flex-col gap-3">
          {admins.map((member) => (
            <div
              className="flex flex-wrap items-center gap-3 border-[3px] border-border bg-card p-4 text-card-foreground shadow-stamp"
              key={member.email}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-extrabold text-foreground">
                    {member.name}
                  </span>
                  {member.role === "owner" ? (
                    <Badge variant="accent">Owner</Badge>
                  ) : (
                    <Badge variant="outline">Admin</Badge>
                  )}
                  {member.email === owner.email ? (
                    <Badge variant="outline">You</Badge>
                  ) : null}
                </div>
                <p className="mt-1 font-mono text-sm text-text-soft">
                  {member.email}
                </p>
              </div>
              {member.email === owner.email ? null : (
                <form action={removeTeamMemberAction}>
                  <input name="email" type="hidden" value={member.email} />
                  <Button size="sm" type="submit" variant="destructive">
                    <Trash2 data-icon="inline-start" />
                    Remove
                  </Button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
