import Link from "next/link";
import { listEvents, type EventRecord } from "@sfvypaa/content";
import {
  CalendarDays,
  CalendarX,
  Clock,
  EyeOff,
  MapPin,
  Pencil,
  Plus,
  Upload,
} from "lucide-react";

import { toggleEventStatusAction } from "@/app/actions";
import { ListEmpty, ListFilters, ListRow } from "@/components/admin-list";
import { AdminPageHead, AdminShell } from "@/components/admin-shell";
import { ContentStatusBadge } from "@/components/content-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { DeleteEventForm } from "@/components/event-form";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type EventsSearchParams = Promise<{
  q?: string;
  status?: string;
}>;

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function publicSiteUrl() {
  return (process.env.SFVYPAA_PUBLIC_SITE_URL || "https://sfvypaa.org").replace(
    /\/+$/,
    "",
  );
}

function cleanStatus(value: string | undefined) {
  return value === "draft" || value === "published" ? value : "all";
}

function formatDate(value: string | undefined) {
  if (!value) {
    return "not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateTimeFormatter.format(date);
}

function matchesEvent(event: EventRecord, query: string, status: string) {
  const queryText = query.toLowerCase();
  const matchesStatus = status === "all" || event.status === status;
  const matchesQuery =
    !queryText ||
    [event.title, event.date, event.time, event.location, event.tone]
      .join(" ")
      .toLowerCase()
      .includes(queryText);

  return matchesStatus && matchesQuery;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: EventsSearchParams;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = cleanStatus(params.status);
  const events = await listEvents();
  const filteredEvents = events.filter((event) =>
    matchesEvent(event, query, status),
  );

  return (
    <AdminShell active="events" publicSiteUrl={publicSiteUrl()}>
      <div className="mx-auto max-w-[920px]">
        <AdminPageHead
          action={
            <Button nativeButton={false} render={<Link href="/events/new" />}>
              <Plus data-icon="inline-start" />
              New event
            </Button>
          }
          eyebrow="Manage"
          sub="Flyers, speaker jams, committee meetings, and co-hosted events."
          title="Events"
        />

        <ListFilters
          basePath="/events"
          counts={{
            all: events.length,
            published: events.filter((e) => e.status === "published").length,
            draft: events.filter((e) => e.status === "draft").length,
          }}
          query={query}
          searchPlaceholder="Title, location…"
          status={status}
        />

        {filteredEvents.length === 0 ? (
          <ListEmpty
            action={
              <Button
                nativeButton={false}
                render={<Link href="/events/new" />}
              >
                <Plus data-icon="inline-start" />
                New event
              </Button>
            }
            body={
              query || status !== "all"
                ? "No events match these filters. Clear them or create a new event."
                : "Create your first event and publish it to the public site."
            }
            icon={CalendarX}
            title="Nothing here yet"
          />
        ) : (
          <div className="flex flex-col gap-4.5">
            {filteredEvents.map((event) => (
              <ListRow
                actions={
                  <>
                    <form action={toggleEventStatusAction}>
                      <input name="id" type="hidden" value={event.id} />
                      <input
                        name="nextStatus"
                        type="hidden"
                        value={
                          event.status === "published" ? "draft" : "published"
                        }
                      />
                      <Button size="sm" type="submit" variant="outline">
                        {event.status === "published" ? (
                          <EyeOff data-icon="inline-start" />
                        ) : (
                          <Upload data-icon="inline-start" />
                        )}
                        {event.status === "published" ? "Unpublish" : "Publish"}
                      </Button>
                    </form>
                    <Link
                      className={cn(
                        buttonVariants({ size: "sm", variant: "outline" })
                      )}
                      href={`/events/${event.id}`}
                    >
                      <Pencil data-icon="inline-start" />
                      Edit
                    </Link>
                    <DeleteEventForm id={event.id} title={event.title} />
                  </>
                }
                badges={
                  <>
                    <ContentStatusBadge status={event.status} />
                    <Badge variant="outline">
                      {event.host === "Co-hosted by SFVYPAA"
                        ? "Co-hosted"
                        : "Hosted"}
                    </Badge>
                    {event.imageUrl ? (
                      <Badge variant="outline">Flyer</Badge>
                    ) : null}
                  </>
                }
                body={event.tone}
                key={event.id}
                meta={[
                  { icon: CalendarDays, text: event.date || "Date not set" },
                  { icon: Clock, text: event.time || "Time not set" },
                  { icon: MapPin, text: event.location || "Location not set" },
                ]}
                title={event.title}
                updated={formatDate(event.updatedAt)}
              />
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
