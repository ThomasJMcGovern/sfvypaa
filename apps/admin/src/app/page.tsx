import Link from "next/link";
import {
  isFirebaseConfigured,
  isFirebaseStorageConfigured,
  listEvents,
  listNewsletters,
  listSocialPosts,
} from "@sfvypaa/content";
import {
  AtSign,
  CalendarDays,
  CheckCircle2,
  Newspaper,
  Plus,
  ServerCog,
} from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [events, newsletters, socialPosts] = await Promise.all([
    listEvents(),
    listNewsletters(),
    listSocialPosts(),
  ]);
  const publishedEvents = events.filter((event) => event.status === "published");
  const publishedNewsletters = newsletters.filter(
    (newsletter) => newsletter.status === "published",
  );
  const publishedSocialPosts = socialPosts.filter(
    (post) => post.status === "published",
  );
  const checks = [
    { label: "Firebase", ok: isFirebaseConfigured() },
    { label: "Storage", ok: isFirebaseStorageConfigured() },
    { label: "Public revalidation", ok: Boolean(process.env.SFVYPAA_REVALIDATE_SECRET) },
  ];
  const deployedCommit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);

  return (
    <AdminShell active="dashboard">
      <section className="grid gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-normal sm:text-5xl">
            Publishing dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/62">
            Publish approved SFVYPAA events, newsletters, and curated social
            posts to the public site.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Metric label="Events" value={events.length} icon={CalendarDays} />
          <Metric
            label="Published events"
            value={publishedEvents.length}
            icon={CalendarDays}
          />
          <Metric label="Newsletters" value={newsletters.length} icon={Newspaper} />
          <Metric
            label="Published newsletters"
            value={publishedNewsletters.length}
            icon={Newspaper}
          />
          <Metric label="Social posts" value={socialPosts.length} icon={AtSign} />
          <Metric
            label="Published socials"
            value={publishedSocialPosts.length}
            icon={AtSign}
          />
        </div>
        <Card className="rounded-[8px] border-white/10 bg-white/[0.06] text-white ring-white/10">
          <CardHeader className="gap-3">
            <ServerCog className="size-5 text-[#ffcf6b]" />
            <CardTitle className="text-xl font-black">
              Publishing system status
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {checks.map((check) => (
              <StatusCheck key={check.label} label={check.label} ok={check.ok} />
            ))}
            <div className="rounded-[8px] border border-white/10 bg-white/8 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-normal text-white/48">
                Deploy
              </p>
              <p className="mt-1 font-mono text-sm text-white/82">
                {deployedCommit || "local"}
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ActionCard
            title="Events"
            body="Create flyers, speaker nights, committee meetings, and co-hosted events."
            href="/events/new"
            label="New event"
          />
          <ActionCard
            title="Newsletters"
            body="Publish committee updates and announcements to the newsletter archive."
            href="/newsletters/new"
            label="New newsletter"
          />
          <ActionCard
            title="Social Posts"
            body="Feature curated Instagram posts on the public homepage without relying on the Instagram API."
            href="/social-posts/new"
            label="New social post"
          />
        </div>
      </section>
    </AdminShell>
  );
}

function StatusCheck({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/8 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-normal text-white/48">
        {label}
      </p>
      <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
        <CheckCircle2
          className={ok ? "size-4 text-emerald-300" : "size-4 text-red-300"}
        />
        {ok ? "Configured" : "Missing"}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof CalendarDays;
}) {
  return (
    <Card className="rounded-[8px] border-white/10 bg-white/[0.06] text-white ring-white/10">
      <CardHeader>
        <Icon className="size-5 text-[#ffcf6b]" />
        <CardTitle className="text-sm font-semibold uppercase tracking-normal text-white/55">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-4xl font-black">{value}</CardContent>
    </Card>
  );
}

function ActionCard({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <Card className="rounded-[8px] border-white/10 bg-white text-[#171310] ring-white/10">
      <CardHeader>
        <CardTitle className="text-3xl font-black">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <p className="text-base leading-7 text-[#5e554c]">{body}</p>
        <Button
          nativeButton={false}
          render={<Link href={href} />}
          className="h-11 w-fit rounded-[8px] bg-[#171310] px-4 text-white hover:bg-[#2c241d]"
        >
          <Plus className="size-4" />
          {label}
        </Button>
      </CardContent>
    </Card>
  );
}
