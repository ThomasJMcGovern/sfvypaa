import { getSiteSettings } from "@sfvypaa/content";
import { ExternalLink } from "lucide-react";

import { AdminPageHead, AdminShell } from "@/components/admin-shell";
import { SiteSettingsForm } from "@/components/site-settings-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function publicSiteUrl() {
  return (process.env.SFVYPAA_PUBLIC_SITE_URL || "https://sfvypaa.org").replace(
    /\/+$/,
    "",
  );
}

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell active="settings" publicSiteUrl={publicSiteUrl()}>
      <div className="mx-auto max-w-[840px]">
        <AdminPageHead
          action={
            <Button
              nativeButton={false}
              render={
                <a
                  href={`${publicSiteUrl()}/#socials`}
                  rel="noreferrer"
                  target="_blank"
                />
              }
              variant="outline"
            >
              Public homepage
              <ExternalLink data-icon="inline-end" />
            </Button>
          }
          eyebrow="Configure"
          sub="Control what the public site shows. Changes go live on the next publish."
          title="Settings"
        />
        <SiteSettingsForm settings={settings} />
      </div>
    </AdminShell>
  );
}
