import Link from "next/link";
import { listEvents, type EventRecord } from "@sfvypaa/content";
import { Edit3, ExternalLink, Plus, Search } from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { ContentStatusBadge } from "@/components/content-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    return "Not set";
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
  const statusLabel =
    status === "all" ? "All statuses" : status === "published" ? "Published" : "Draft";

  return (
    <AdminShell active="events">
      <section className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-normal">Events</h1>
            <p className="mt-2 text-white/62">
              Manage public event cards and RSVP links.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/events/new" />}
            className="h-11 rounded-[8px] bg-[#ffcf6b] px-4 text-[#191109] hover:bg-[#f3b83f]"
          >
            <Plus className="size-4" />
            New event
          </Button>
        </div>

        <form className="grid gap-3 rounded-[8px] border border-white/10 bg-white/[0.06] p-4 lg:grid-cols-[1fr_12rem_auto_auto]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-white/72">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5e554c]" />
              <Input
                className="h-11 rounded-[8px] border-white/15 bg-white pl-9 text-[#171310]"
                defaultValue={query}
                name="q"
                placeholder="Title, location, summary"
              />
            </div>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-white/72">Status</span>
            <select
              className="h-11 rounded-[8px] border border-white/15 bg-white px-3 text-[#171310] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              defaultValue={status}
              name="status"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <Button
            className="h-11 self-end rounded-[8px] bg-white px-4 text-[#171310] hover:bg-[#f5eee5]"
            type="submit"
          >
            Filter
          </Button>
          {query || status !== "all" ? (
            <Button
              className="h-11 self-end rounded-[8px] border-white/20 bg-transparent px-4 text-white hover:bg-white/10"
              nativeButton={false}
              render={<Link href="/events" />}
              variant="outline"
            >
              Clear
            </Button>
          ) : null}
        </form>

        <div className="overflow-hidden rounded-[8px] border border-white/10 bg-white text-[#171310]">
          <div className="flex items-center justify-between border-b border-[#171310]/10 px-4 py-3">
            <p className="text-sm font-semibold text-[#5e554c]">
              {filteredEvents.length} of {events.length} events
            </p>
            <p className="text-sm font-semibold text-[#5e554c]">{statusLabel}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[58rem] text-left text-sm">
              <thead className="bg-[#f5eee5] text-xs uppercase tracking-normal text-[#6f655b]">
                <tr>
                  <th className="px-4 py-3 font-black">Event</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">Date</th>
                  <th className="px-4 py-3 font-black">Location</th>
                  <th className="px-4 py-3 font-black">Updated</th>
                  <th className="px-4 py-3 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171310]/10">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <tr className="align-top transition hover:bg-[#fbfaf8]" key={event.id}>
                      <td className="px-4 py-4">
                        <p className="font-black">{event.title}</p>
                        <p className="mt-1 max-w-sm truncate text-[#6f655b]">
                          {event.time || "Time not set"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <ContentStatusBadge status={event.status} />
                      </td>
                      <td className="px-4 py-4 text-[#5e554c]">
                        {event.date || event.eventDate || "Not set"}
                      </td>
                      <td className="px-4 py-4 text-[#5e554c]">
                        {event.location || "Not set"}
                      </td>
                      <td className="px-4 py-4 text-[#5e554c]">
                        {formatDate(event.updatedAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            className="h-9 rounded-[8px] border-[#171310]/15 px-3 text-[#171310] hover:bg-[#f5eee5]"
                            nativeButton={false}
                            render={<Link href={`/events/${event.id}`} />}
                            variant="outline"
                          >
                            <Edit3 className="size-4" />
                            Edit
                          </Button>
                          {event.status === "published" ? (
                            <Button
                              className="h-9 rounded-[8px] border-[#171310]/15 px-3 text-[#171310] hover:bg-[#f5eee5]"
                              nativeButton={false}
                              render={
                                <a
                                  href={`${publicSiteUrl()}/upcoming-events`}
                                  rel="noreferrer"
                                  target="_blank"
                                />
                              }
                              variant="outline"
                            >
                              <ExternalLink className="size-4" />
                              Public
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-10 text-center text-[#6f655b]" colSpan={6}>
                      No events match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
