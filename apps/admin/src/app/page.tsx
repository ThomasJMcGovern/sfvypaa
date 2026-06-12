import Link from "next/link";
import {
  isFirebaseConfigured,
  isFirebaseStorageConfigured,
  getSiteSettings,
  listEvents,
  listNewsletters,
  listSocialPosts,
} from "@sfvypaa/content";
import {
  AtSign,
  CalendarDays,
  Database,
  Eye,
  EyeOff,
  GitCommitHorizontal,
  HardDrive,
  Newspaper,
  Plus,
  RefreshCw,
  Server,
  Settings2,
} from "lucide-react";

import { AdminPageHead, AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-session";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function publicSiteUrl() {
  return (process.env.SFVYPAA_PUBLIC_SITE_URL || "https://sfvypaa.org").replace(
    /\/+$/,
    "",
  );
}

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  const [events, newsletters, socialPosts, siteSettings] = await Promise.all([
    listEvents(),
    listNewsletters(),
    listSocialPosts(),
    getSiteSettings(),
  ]);
  const published = (items: Array<{ status: string }>) =>
    items.filter((item) => item.status === "published").length;
  const deployedCommit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);

  const metrics = [
    { icon: CalendarDays, label: "Events", value: events.length, live: published(events) },
    { icon: Newspaper, label: "Newsletters", value: newsletters.length, live: published(newsletters) },
    { icon: AtSign, label: "Social posts", value: socialPosts.length, live: published(socialPosts) },
  ];

  const actions = [
    {
      icon: CalendarDays,
      title: "Events",
      body: "Create flyers, speaker nights, committee meetings, and co-hosted events.",
      cta: "New event",
      href: "/events/new",
    },
    {
      icon: Newspaper,
      title: "Newsletters",
      body: "Publish committee updates and announcements to the newsletter archive.",
      cta: "New newsletter",
      href: "/newsletters/new",
    },
    {
      icon: AtSign,
      title: "Social Posts",
      body: "Feature curated Instagram posts on the homepage — no Instagram API needed.",
      cta: "New social post",
      href: "/social-posts/new",
    },
    {
      icon: Settings2,
      title: "Settings",
      body: "Show or hide the homepage Socials section, and manage publishing.",
      cta: "Open settings",
      href: "/settings",
    },
  ];

  return (
    <AdminShell active="dashboard" admin={admin} publicSiteUrl={publicSiteUrl()}>
      <AdminPageHead
        action={
          <span className="stamp -rotate-4 border-2 border-orange px-2 py-1 text-sm text-orange">
            committee only
          </span>
        }
        eyebrow="Publishing console"
        sub="Publish approved SFVYPAA events, newsletters, and curated social posts to the public site. The grit lives in the frame — the data stays loud and clear."
        title="Dashboard"
      />

      {/* metric tiles */}
      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        {metrics.map(({ icon: Icon, label, value, live }) => (
          <div
            className="border-[3px] border-border bg-card p-5 shadow-stamp"
            key={label}
          >
            <div className="flex items-center justify-between">
              <Icon className="size-5 text-orange" />
              <span className="font-mono text-xs font-bold text-go">
                {live} live
              </span>
            </div>
            <div className="label-stamp mt-3.5 mb-1 text-muted-foreground">
              {label}
            </div>
            <div className="font-display text-[52px] leading-[0.85] text-foreground">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* system status */}
      <div className="mb-8 border-[3px] border-border bg-secondary p-6 shadow-stamp">
        <div className="mb-4.5 flex items-center gap-2.5">
          <Server className="size-[18px] text-orange" />
          <h2 className="text-[1.6rem] text-foreground">
            Publishing system status
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatusTile
            icon={Database}
            label="Firebase"
            ok={isFirebaseConfigured()}
          />
          <StatusTile
            icon={HardDrive}
            label="Storage"
            ok={isFirebaseStorageConfigured()}
          />
          <StatusTile
            icon={RefreshCw}
            label="Public revalidation"
            ok={Boolean(process.env.SFVYPAA_REVALIDATE_SECRET)}
            okLabel="On"
            missingLabel="Off"
          />
          <StatusTile
            icon={siteSettings.showInstagramSocials ? Eye : EyeOff}
            label="Instagram socials"
            ok={siteSettings.showInstagramSocials}
            okLabel="Showing"
            missingLabel="Hidden"
            missingIsMuted
          />
          <div className="border-2 border-border/35 bg-background px-4 py-3.5">
            <div className="label-stamp mb-2 flex items-center gap-1.5 text-muted-foreground">
              <GitCommitHorizontal className="size-3.5" /> Deploy
            </div>
            <span className="font-mono text-[15px] font-bold text-foreground">
              {deployedCommit || "local"}
            </span>
          </div>
        </div>
      </div>

      {/* action cards */}
      <div className="grid gap-4.5 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ icon: Icon, title, body, cta, href }) => (
          <div
            className="tape relative flex flex-col border-[3px] border-ink bg-paper p-6 text-ink shadow-stamp-lg"
            key={title}
          >
            <div className="mb-4 flex size-[46px] items-center justify-center border-[3px] border-ink text-orange-deep">
              <Icon className="size-[22px]" />
            </div>
            <h3 className="mb-2.5 text-[1.9rem] leading-[0.92] text-ink">
              {title}
            </h3>
            <p className="mb-5 grow text-sm leading-normal text-ink-2">
              {body}
            </p>
            <Button
              className="w-fit"
              nativeButton={false}
              render={<Link href={href} />}
              size="sm"
            >
              <Plus data-icon="inline-start" />
              {cta}
            </Button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

function StatusTile({
  icon: Icon,
  label,
  ok,
  okLabel = "Configured",
  missingLabel = "Missing",
  missingIsMuted = false,
}: {
  icon: typeof Database;
  label: string;
  ok: boolean;
  okLabel?: string;
  missingLabel?: string;
  missingIsMuted?: boolean;
}) {
  return (
    <div className="border-2 border-border/35 bg-background px-4 py-3.5">
      <div className="label-stamp mb-2 flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
        <span
          className={`size-[9px] shrink-0 rounded-full ${
            ok ? "bg-go" : missingIsMuted ? "bg-muted-foreground" : "bg-stop"
          }`}
        />
        {ok ? okLabel : missingLabel}
      </span>
    </div>
  );
}
