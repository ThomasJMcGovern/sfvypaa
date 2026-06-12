import type { Metadata } from "next"
import Image from "next/image"
import {
  ArrowDown,
  AtSign,
  CalendarDays,
  Clock,
  Map,
  MapPin,
} from "lucide-react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { businessMeeting, involvement, site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Get Involved | SFVYPAA",
  description:
    "Join SFVYPAA committee service, business meetings, and young people AA event planning.",
}

const meetingDetails = [
  { icon: CalendarDays, text: businessMeeting.schedule },
  { icon: Clock, text: businessMeeting.time },
  { icon: MapPin, text: businessMeeting.location },
  { icon: Map, text: businessMeeting.address },
]

const involvementGlyphs = ["★", "→", "✱", "✕"]

export default function GetInvolvedPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader active="get-involved" />

      {/* 1 — hero */}
      <section className="border-b-[5px] border-border bg-secondary" id="top">
        <div className="mx-auto w-full max-w-5xl px-5 pt-14 pb-13 text-center">
          <div className="mb-5 flex justify-center">
            <span className="stamp -rotate-4 border-2 border-orange px-2 py-1 text-sm text-orange">
              no experience necessary
            </span>
          </div>
          <h1 className="text-[clamp(2.75rem,6vw,4.5rem)] text-foreground">
            Get in. Get loud.{" "}
            <span className="text-orange">Get of service.</span>
          </h1>
          <p className="mx-auto mt-5.5 mb-6.5 max-w-[44ch] text-lg leading-[1.55] font-medium text-text-soft">
            Help plan service, outreach, fellowship, and young people AA events
            across the San Fernando Valley.
          </p>
          <a
            className="inline-flex items-center gap-2 border-b-[3px] border-orange px-0.5 py-1 text-[13px] font-extrabold tracking-[0.08em] text-foreground uppercase transition-colors hover:text-orange"
            href="#business-meeting"
          >
            Business meeting details <ArrowDown className="size-[15px]" />
          </a>
        </div>
      </section>

      {/* 2 — business meeting block */}
      <section
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 pt-16 sm:px-8 lg:px-10"
        id="business-meeting"
      >
        <div className="grid items-center justify-stretch lg:grid-cols-[minmax(0,440px)_minmax(0,440px)] lg:justify-center">
          <div className="relative aspect-[3/4] border-[3px] border-border bg-bone-2">
            <Image
              alt="SFVYPAA business meeting flyer"
              className="object-contain"
              fill
              priority
              sizes="(min-width: 1024px) 440px, 100vw"
              src="/business-meeting.png"
            />
          </div>
          <div className="relative z-[2] mx-4 -mt-10 border-[3px] border-border bg-card p-7 text-card-foreground shadow-stamp-lg lg:mx-0 lg:-ml-[90px] lg:mt-0 lg:px-[30px] lg:py-8">
            <div className="mb-3.5">
              <span className="border-2 border-primary bg-primary px-2.5 py-0.5 text-xs font-bold tracking-[0.14em] text-primary-foreground uppercase">
                Committee
              </span>
            </div>
            <h2 className="mb-3.5 text-[clamp(2rem,4vw,3rem)] text-foreground">
              {businessMeeting.title}
            </h2>
            <p className="mb-5.5 text-[15px] leading-relaxed text-text-soft">
              SFVYPAA meets once per month for committee business, service
              planning, and upcoming young people events. Walk in — that&apos;s
              the whole onboarding.
            </p>
            <div className="mb-6 flex flex-col gap-2.5 border-t-2 border-border/35 pt-4.5">
              {meetingDetails.map(({ icon: Icon, text }) => (
                <div className="flex items-center gap-2.5" key={text}>
                  <Icon className="size-4 shrink-0 text-orange" />
                  <span className="font-mono text-[13.5px] font-bold text-foreground">
                    {text}
                  </span>
                </div>
              ))}
            </div>
            <Button
              nativeButton={false}
              render={
                <a
                  href={site.links.instagram}
                  rel="noreferrer"
                  target="_blank"
                />
              }
            >
              <AtSign data-icon="inline-start" />
              Follow @sfvypaa
            </Button>
          </div>
        </div>
      </section>

      {/* 3 — where we need hands */}
      <section className="mx-auto w-full max-w-7xl px-5 pt-[72px] sm:px-8 lg:px-10">
        <h2 className="mb-6 text-[clamp(2rem,4vw,3rem)] text-foreground">
          Where we need hands
        </h2>
        <div className="grid gap-4.5 md:grid-cols-2">
          {involvement.map((item, index) => (
            <div
              className="flex items-center gap-4.5 border-[3px] border-border bg-card px-5.5 py-4.5 text-card-foreground shadow-stamp"
              key={item}
            >
              <span className="font-display flex size-11 shrink-0 items-center justify-center border-[3px] border-border text-[22px] text-orange">
                {involvementGlyphs[index % involvementGlyphs.length]}
              </span>
              <span className="text-base font-extrabold">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4 — contact */}
      <section className="mx-auto w-full max-w-7xl px-5 pt-14 sm:px-8 lg:px-10" id="contact">
        <div className="grain relative border-[3px] border-border bg-ink px-8 py-11 text-center text-bone shadow-stamp-lg">
          <div className="relative z-[2]">
            <div className="mb-3.5 flex justify-center">
              <span className="stamp -rotate-4 border-2 border-pink px-2 py-1 text-sm text-pink">
                coming soon
              </span>
            </div>
            <h2 className="mb-3.5 text-[clamp(2rem,4vw,3rem)] uppercase">
              Contact
            </h2>
            <p className="mx-auto max-w-[48ch] text-base leading-[1.7] text-[#C9C0AC]">
              A committee-approved email and contact form land here soon. Until
              then, the fastest way to reach us is a DM to{" "}
              <a
                className="font-bold text-bone underline decoration-orange decoration-2 underline-offset-2"
                href={site.links.instagram}
                rel="noreferrer"
                target="_blank"
              >
                @sfvypaa
              </a>{" "}
              — or just show up to the business meeting.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
