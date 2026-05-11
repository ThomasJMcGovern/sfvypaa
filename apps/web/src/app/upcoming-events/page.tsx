import type { Metadata } from "next"
import {
  listPublishedEvents,
  type EventHost,
  type EventRecord,
} from "@sfvypaa/content"
import { CalendarDays, Clock, MapPin, Sparkles } from "lucide-react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { events, site } from "@/lib/site"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Upcoming Events | SFVYPAA",
  description:
    "Hosted and co-hosted young people in AA events for the San Fernando Valley.",
}

const fallbackEvents: EventRecord[] = events.map((event) => ({
  ...event,
  id: event.title,
  host: event.host as EventHost,
  status: "published",
  sortDate: "",
  rsvpUrl: "",
  imageUrl: "",
}))

export default async function UpcomingEventsPage() {
  const publishedEvents = await listPublishedEvents()
  const pageEvents = publishedEvents.length > 0 ? publishedEvents : fallbackEvents
  const hosted = pageEvents.filter((event) => event.host === "Hosted by SFVYPAA")
  const cohosted = pageEvents.filter(
    (event) => event.host === "Co-hosted by SFVYPAA",
  )

  return (
    <main className="min-h-screen bg-[#171310] text-white">
      <SiteHeader active="upcoming-events" />
      <section className="px-5 pb-20 pt-16 text-center sm:px-8 lg:px-10" id="top">
        <h1 className="text-5xl font-black tracking-normal sm:text-7xl lg:text-8xl">
          Upcoming Events
        </h1>
        <div className="relative mx-auto mt-16 max-w-7xl overflow-hidden rounded-[8px] border border-white/10 bg-[#1d1b18] py-24">
          <div className="absolute left-[-5%] top-16 h-20 w-[110%] rounded-[50%] border-t-8 border-white" />
          <div className="absolute bottom-16 left-[-5%] h-20 w-[110%] rounded-[50%] border-b-8 border-white" />
          <div className="relative z-10 mx-auto max-w-xl">
            <Badge className="h-7 rounded-[8px] bg-[#ffcf6b] px-3 text-[#191109]">
              Hosted by SFVYPAA
            </Badge>
            <p className="mt-6 text-lg leading-8 text-white/68">
              Event listings are separated from the homepage so SFVYPAA can add
              flyers, RSVP links, and co-hosted announcements as they are
              approved.
            </p>
          </div>
        </div>
      </section>

      <EventGroup events={hosted} title="Hosted by SFVYPAA" />
      <EventGroup events={cohosted} title="Co-hosted by SFVYPAA" />

      <section className="px-5 pb-24 pt-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[8px] border border-white/10 bg-white/[0.06] p-8 text-center">
          <Sparkles className="mx-auto size-8 text-[#ffcf6b]" />
          <h2 className="mt-4 text-3xl font-black">Want to help plan?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-white/64">
            Join service, bring an idea, or help with hospitality, speakers,
            graphics, setup, outreach, and clean up.
          </p>
          <Button
            className="mt-6 h-12 rounded-[8px] bg-[#ffcf6b] px-5 text-[#191109] hover:bg-[#f3b83f]"
            nativeButton={false}
            render={<a href={site.links.getInvolved} />}
          >
            Get involved
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

function EventGroup({
  events,
  title,
}: {
  events: EventRecord[]
  title: string
}) {
  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-black tracking-normal sm:text-4xl">
          {title}
        </h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {events.map((event, index) => (
            <Card
              className="rounded-[8px] border-white/10 bg-white p-0 text-[#171310] ring-white/10"
              key={event.id}
            >
              <CardHeader className="border-b border-[#171310]/10 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <Badge className="h-7 rounded-[8px] bg-[#1c6f70] px-3 text-white">
                    0{index + 1}
                  </Badge>
                  <CalendarDays className="size-5 text-[#d94b2b]" />
                </div>
                <CardTitle className="mt-4 text-2xl font-black leading-tight">
                  {event.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 py-5">
                <EventMeta icon={CalendarDays} text={event.date} />
                <EventMeta icon={Clock} text={event.time} />
                <EventMeta icon={MapPin} text={event.location} />
                <Separator className="bg-[#171310]/10" />
                <p className="text-base leading-7 text-[#5e554c]">
                  {event.tone}
                </p>
                {event.rsvpUrl ? (
                  <Button
                    className="h-10 w-fit rounded-[8px] bg-[#171310] px-4 text-white hover:bg-[#2c241d]"
                    nativeButton={false}
                    render={
                      <a
                        href={event.rsvpUrl}
                        rel="noreferrer"
                        target="_blank"
                      />
                    }
                  >
                    RSVP
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
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
    <div className="flex items-center gap-3 text-sm font-medium text-[#5e554c]">
      <Icon className="size-4 text-[#d94b2b]" />
      <span>{text}</span>
    </div>
  )
}
