import type { Metadata } from "next"
import { listPublishedEvents, type EventRecord } from "@valleypaa/content"
import {
  ArrowRight,
  CalendarDays,
  CalendarX,
  Clock,
  MapPin,
} from "lucide-react"

import { PageHead } from "@/components/page-head"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Upcoming Events | VALLEYPAA",
  description:
    "Hosted and co-hosted young people in AA events for the San Fernando Valley.",
}

export default async function UpcomingEventsPage() {
  const events = await listPublishedEvents()
  const hosted = events.filter((event) => event.host === "Hosted by VALLEYPAA")
  const cohosted = events.filter(
    (event) => event.host === "Co-hosted by VALLEYPAA",
  )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader active="upcoming-events" />

      <PageHead
        eyebrow="What's on"
        sub="Backyard shows, speaker jams, service, and fellowship — hosted and co-hosted by VALLEYPAA. All ages. All sober. Just show up."
        title="Upcoming events."
      />

      <section className="mx-auto w-full max-w-7xl px-5 pt-6 sm:px-8 lg:px-10">
        {events.length > 0 ? (
          <>
            <EventGroup
              events={hosted}
              skew={-1}
              title="Hosted by VALLEYPAA"
            />
            <EventGroup
              events={cohosted}
              skew={1}
              title="Co-hosted by VALLEYPAA"
            />
          </>
        ) : (
          <EmptyEvents />
        )}
      </section>

      {/* want to help plan? */}
      <section className="mx-auto w-full max-w-7xl px-5 pt-2 sm:px-8 lg:px-10">
        <div className="grain relative border-[3px] border-border bg-ink px-8 py-10 text-center text-bone shadow-stamp-lg">
          <div className="relative z-[2]">
            <span className="stamp inline-block -rotate-4 border-2 border-pink px-2 py-1 text-sm text-pink">
              your committee needs you
            </span>
            <h2 className="mt-3.5 mb-3 text-[clamp(2rem,4vw,3rem)] uppercase">
              Want to help plan?
            </h2>
            <p className="mx-auto mb-6 max-w-[48ch] text-base leading-relaxed text-[#C9C0AC]">
              Join service, bring an idea, or help with hospitality, speakers,
              graphics, setup, outreach, and clean-up.
            </p>
            <Button
              nativeButton={false}
              render={<a href={site.links.getInvolved} />}
            >
              Get involved
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

function EmptyEvents() {
  return (
    <div className="border-2 border-dashed border-border/35 px-6 py-[72px] text-center">
      <CalendarX className="mx-auto mb-4 size-9 text-muted-foreground" />
      <h3 className="mb-2.5 text-2xl text-foreground">
        No published events yet
      </h3>
      <p className="mx-auto max-w-[42ch] text-[15px] leading-relaxed text-text-soft">
        New VALLEYPAA events will appear here once they&apos;re announced. Check
        back soon — or better, come help us plan one.
      </p>
    </div>
  )
}

function EventGroup({
  events,
  skew,
  title,
}: {
  events: EventRecord[]
  skew: number
  title: string
}) {
  if (events.length === 0) {
    return null
  }

  return (
    <div className="mb-14">
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-2xl whitespace-nowrap text-foreground">{title}</h2>
        <span className="flex-1 border-t-[3px] border-border" />
      </div>
      <div className="grid items-start gap-7 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event, index) => (
          <EventCard
            event={event}
            key={event.id}
            skew={index === 0 ? skew : 0}
            tape={index === 0 && Boolean(event.imageUrl)}
          />
        ))}
      </div>
    </div>
  )
}

function EventCard({
  event,
  skew,
  tape,
}: {
  event: EventRecord
  skew: number
  tape: boolean
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden border-[3px] border-border bg-card text-card-foreground shadow-stamp-lg",
        tape && "tape",
        skew === -1 && "md:-rotate-1",
        skew === 1 && "md:rotate-1"
      )}
    >
      {event.imageUrl ? (
        <div className="halftone border-b-[3px] border-border bg-bone-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${event.title} flyer`}
            className="aspect-[4/3] w-full object-cover"
            src={event.imageUrl}
          />
        </div>
      ) : null}
      <div className="flex grow flex-col p-6">
        <div className="mb-3.5">
          <span className="border-2 border-primary bg-primary px-2.5 py-0.5 text-xs font-bold tracking-[0.14em] text-primary-foreground uppercase">
            {event.host}
          </span>
        </div>
        <h3 className="mb-4 text-2xl leading-[0.95] text-foreground">
          {event.title}
        </h3>
        <div className="mb-4 flex flex-col gap-2 border-b-2 border-border/35 pb-4">
          <EventMeta icon={CalendarDays} text={event.date} />
          <EventMeta icon={Clock} text={event.time} />
          <EventMeta icon={MapPin} text={event.location} />
        </div>
        <p className="mb-4.5 grow text-sm leading-[1.55] text-text-soft">
          {event.tone}
        </p>
        {event.rsvpUrl ? (
          <Button
            className="w-full"
            nativeButton={false}
            render={
              <a href={event.rsvpUrl} rel="noreferrer" target="_blank" />
            }
          >
            RSVP — it&apos;s free
            <ArrowRight data-icon="inline-end" />
          </Button>
        ) : null}
      </div>
    </article>
  )
}

function EventMeta({
  icon: Icon,
  text,
}: {
  icon: typeof CalendarDays
  text: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0 text-orange" />
      <span className="font-mono text-[13px] font-bold text-foreground">
        {text}
      </span>
    </div>
  )
}
