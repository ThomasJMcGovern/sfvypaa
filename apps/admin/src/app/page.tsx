import Link from "next/link";
import { listEvents, listNewsletters } from "@sfvypaa/content";
import { CalendarDays, Newspaper, Plus } from "lucide-react";

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
  const [events, newsletters] = await Promise.all([
    listEvents(),
    listNewsletters(),
  ]);
  const publishedEvents = events.filter((event) => event.status === "published");
  const publishedNewsletters = newsletters.filter(
    (newsletter) => newsletter.status === "published",
  );

  return (
    <AdminShell>
      <section className="grid gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-normal sm:text-5xl">
            Publishing dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/62">
            Publish approved SFVYPAA events and newsletter archive posts to the
            public site.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        </div>
        <div className="grid gap-4 md:grid-cols-2">
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
        </div>
      </section>
    </AdminShell>
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
