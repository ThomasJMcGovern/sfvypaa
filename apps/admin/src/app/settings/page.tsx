import { getSiteSettings } from "@sfvypaa/content";
import { ExternalLink, Settings } from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { SiteSettingsForm } from "@/components/site-settings-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <AdminShell active="settings">
      <section className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-normal">Settings</h1>
            <p className="mt-2 text-white/62">
              Manage homepage visibility and public publishing behavior.
            </p>
          </div>
          <Button
            className="h-11 w-fit rounded-[8px] border-white/20 bg-white/10 px-4 text-white hover:bg-white/20"
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
            <ExternalLink className="size-4" />
          </Button>
        </div>
        <Card className="rounded-[8px] border-white/10 bg-white/[0.06] text-white ring-white/10">
          <CardHeader className="gap-3">
            <Settings className="size-5 text-[#ffcf6b]" />
            <CardTitle className="text-xl font-black">
              Public site settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SiteSettingsForm settings={settings} />
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
