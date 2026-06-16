import Link from "next/link";
import { notFound } from "next/navigation";
import { emptyEvent, getEvent, listEventLocations } from "@valleypaa/content";
import { ArrowLeft } from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-session";
import { ContentStatusBadge } from "@/components/content-status-badge";
import { DeleteEventForm, EventForm } from "@/components/event-form";

export const dynamic = "force-dynamic";

const defaultLocationSuggestions = [
  "San Fernando Valley",
  "Hole in the Sky, Canoga Park",
  "Location TBD",
];

function publicSiteUrl() {
  return (process.env.SFVYPAA_PUBLIC_SITE_URL || "https://valleypaa.org").replace(
    /\/+$/,
    "",
  );
}

export default async function EventEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await requireAdmin();
  const isNew = id === "new";
  const [event, savedLocations] = await Promise.all([
    isNew ? Promise.resolve(emptyEvent) : getEvent(id),
    listEventLocations(),
  ]);

  if (!event) {
    notFound();
  }

  const locationSuggestions = [
    ...new Set([...defaultLocationSuggestions, ...savedLocations]),
  ];

  return (
    <AdminShell active="events" admin={admin} publicSiteUrl={publicSiteUrl()}>
      <div className="mx-auto max-w-[840px]">
        <Link
          className="mb-5 inline-flex items-center gap-2 text-[13px] font-extrabold tracking-[0.08em] text-orange uppercase transition-colors hover:text-foreground"
          href="/events"
        >
          <ArrowLeft className="size-[15px]" /> Back to events
        </Link>
        <div className="mb-6 flex flex-wrap items-center gap-3.5">
          <h1 className="text-[clamp(2.2rem,4vw,3rem)] text-foreground">
            {isNew ? "New event" : "Edit event"}
          </h1>
          <ContentStatusBadge status={event.status} />
          {!isNew ? (
            <div className="ml-auto">
              <DeleteEventForm id={id} title={event.title} />
            </div>
          ) : null}
        </div>
        <EventForm
          event={event}
          locationSuggestions={locationSuggestions}
          publicSiteUrl={publicSiteUrl()}
        />
      </div>
    </AdminShell>
  );
}
