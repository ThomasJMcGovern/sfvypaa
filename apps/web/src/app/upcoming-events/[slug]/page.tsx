import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import {
  eventSlug,
  listPublishedEvents,
  resolveEventSlug,
} from "@valleypaa/content"
import { ArrowLeft, ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { isIsoDate, isPastEvent } from "@/lib/event-datetime"
import { baseOpenGraph } from "@/lib/seo"
import { site } from "@/lib/site"
import { breadcrumbJsonLd, eventJsonLd } from "@/lib/structured-data"

export const revalidate = 300

export async function generateStaticParams() {
  const events = await listPublishedEvents()

  return events.map((event) => ({ slug: eventSlug(event) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const resolved = await resolveEventSlug(slug)

  if (!resolved) {
    return { title: "Event" }
  }

  const { event, canonicalSlug } = resolved

  const description = [
    event.tone,
    `${event.date}${event.time ? `, ${event.time}` : ""} — ${event.location}.`,
    "A sober event in the San Fernando Valley, Los Angeles. Free to attend.",
  ]
    .filter(Boolean)
    .join(" ")

  return {
    title: `${event.title} — ${event.date}`,
    description,
    alternates: { canonical: `/upcoming-events/${canonicalSlug}` },
    openGraph: {
      ...baseOpenGraph,
      type: "article",
      title: `${event.title} — ${event.date}`,
      description,
      url: `/upcoming-events/${canonicalSlug}`,
      ...(event.imageUrl ? { images: [event.imageUrl] } : {}),
    },
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const resolved = await resolveEventSlug(slug)

  if (!resolved) {
    notFound()
  }

  const { event, canonicalSlug, isCanonical } = resolved

  // An older URL form (or a pre-rename title) still identifies this event.
  // Redirect permanently so previously indexed links keep their value and
  // there is only ever one indexable URL per event.
  if (!isCanonical) {
    permanentRedirect(`/upcoming-events/${canonicalSlug}`)
  }

  const past = isPastEvent(event.eventDate)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader active="upcoming-events" />

      <JsonLd
        data={[
          eventJsonLd(event, canonicalSlug),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Sober events", path: "/upcoming-events" },
            { name: event.title, path: `/upcoming-events/${canonicalSlug}` },
          ]),
        ]}
      />

      <article className="mx-auto w-full max-w-3xl px-5 pt-12 pb-16 sm:px-8">
        <Link
          className="inline-flex items-center gap-2 border-b-[3px] border-orange px-0.5 py-1 text-[13px] font-extrabold tracking-[0.08em] text-foreground uppercase transition-colors hover:text-orange"
          href={site.links.events}
        >
          <ArrowLeft className="size-[15px]" /> All sober events
        </Link>

        {past ? (
          <p className="mt-6 border-[3px] border-border bg-secondary px-4 py-3 font-mono text-[13px] font-bold text-foreground">
            This event has already happened — see{" "}
            <Link className="text-orange underline" href={site.links.events}>
              upcoming events
            </Link>
            .
          </p>
        ) : null}

        <div className="mt-6 mb-3.5">
          <span className="border-2 border-primary bg-primary px-2.5 py-0.5 text-xs font-bold tracking-[0.14em] text-primary-foreground uppercase">
            {event.host}
          </span>
        </div>

        <h1 className="text-[clamp(2.5rem,6vw,4rem)] leading-[0.95] text-foreground">
          {event.title}
        </h1>

        <div className="mt-6 flex flex-col gap-2.5 border-y-2 border-border/35 py-5">
          <DetailRow icon={CalendarDays} isoDate={event.eventDate} text={event.date} />
          <DetailRow icon={Clock} text={event.time} />
          <DetailRow icon={MapPin} text={event.location} />
        </div>

        {event.imageUrl ? (
          <div className="halftone mt-7 border-[3px] border-border bg-bone-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${event.title} flyer`}
              className="block h-auto w-full"
              src={event.imageUrl}
            />
          </div>
        ) : null}

        <p className="mt-7 text-base leading-relaxed text-text-soft">
          {event.tone}
        </p>

        <p className="mt-4 text-base leading-relaxed text-text-soft">
          A sober event in the San Fernando Valley, Los Angeles — no alcohol, no
          drugs, free to walk into. Hosted by VALLEYPAA, a young people in
          Alcoholics Anonymous committee. You don&apos;t have to be in AA, and
          you don&apos;t have to be sober, to come.
        </p>

        {event.rsvpUrl && !past ? (
          <Button
            className="mt-7"
            nativeButton={false}
            render={<a href={event.rsvpUrl} rel="noreferrer" target="_blank" />}
          >
            RSVP — it&apos;s free
            <ArrowRight data-icon="inline-end" />
          </Button>
        ) : null}
      </article>

      <SiteFooter />
    </main>
  )
}

function DetailRow({
  icon: Icon,
  isoDate,
  text,
}: {
  icon: typeof CalendarDays
  isoDate?: string
  text: string
}) {
  if (!text) {
    return null
  }

  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0 text-orange" />
      <span className="font-mono text-sm font-bold text-foreground">
        {isIsoDate(isoDate) ? <time dateTime={isoDate}>{text}</time> : text}
      </span>
    </div>
  )
}
