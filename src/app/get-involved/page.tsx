import type { Metadata } from "next"
import Image from "next/image"
import { Mail, MapPin, Monitor, Sparkles, UsersRound } from "lucide-react"

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
import { businessMeeting, involvement, site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Get Involved | SFVYPAA",
  description:
    "Join SFVYPAA committee service, business meetings, and young people AA event planning.",
}

export default function GetInvolvedPage() {
  return (
    <main className="min-h-screen bg-[#171310] text-white">
      <SiteHeader active="get-involved" />
      <section className="px-5 pb-20 pt-16 text-center sm:px-8 lg:px-10" id="top">
        <h1 className="mx-auto max-w-5xl text-4xl font-black leading-tight tracking-normal sm:text-6xl">
          We are building the next SFVYPAA committee chapter.
        </h1>
        <p className="mx-auto mt-7 max-w-4xl text-xl leading-9 text-white/68">
          Join us and help plan service, outreach, fellowship, and young people
          AA events across the San Fernando Valley.
        </p>
        <a
          className="mt-5 inline-block text-sm font-semibold text-white/72 underline underline-offset-4 transition hover:text-white"
          href="#business-meeting"
        >
          Business meeting details
        </a>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:px-10" id="business-meeting">
        <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-[1fr_0.58fr] lg:items-center">
          <div className="relative min-h-[360px] overflow-hidden rounded-[8px] bg-[#2a241e] lg:min-h-[560px]">
            <Image
              alt="Empty event room with vivid stage lights"
              className="object-cover object-bottom"
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              src="/stage-lights.jpg"
            />
          </div>
          <Card className="relative z-10 mx-4 -mt-12 rounded-[8px] border-none bg-white p-4 text-[#171310] shadow-2xl ring-0 lg:mx-0 lg:-ml-20 lg:mt-0 lg:p-8">
            <CardHeader>
              <Badge className="mb-3 h-7 w-fit rounded-[8px] bg-[#d94b2b] px-3 text-white">
                Committee
              </Badge>
              <CardTitle className="text-4xl font-black leading-tight sm:text-5xl">
                {businessMeeting.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 text-base leading-7 text-[#5e554c]">
              <p>
                {businessMeeting.schedule} The approved meeting link and any
                final in-person address can be added here when SFVYPAA is ready
                to publish.
              </p>
              <Detail icon={MapPin} text={businessMeeting.location} />
              <Detail icon={Monitor} text={businessMeeting.online} />
              <Detail icon={UsersRound} text={businessMeeting.passcode} />
              <Button
                className="mt-2 h-12 w-fit rounded-[8px] bg-[#171310] px-5 text-white hover:bg-[#2c241d]"
                nativeButton={false}
                render={<a href={site.links.contact} />}
              >
                Meeting link coming soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          {involvement.map((item) => (
            <div
              className="flex items-center gap-3 rounded-[8px] border border-white/12 bg-white/10 p-5 backdrop-blur"
              key={item}
            >
              <span className="flex size-9 items-center justify-center rounded-[8px] bg-[#ffcf6b] text-[#191109]">
                <Sparkles className="size-4" />
              </span>
              <span className="font-semibold">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="relative overflow-hidden px-5 py-20 sm:px-8 lg:px-10"
        id="contact"
      >
        <Image
          alt="Anonymous abstract event lights"
          className="object-cover opacity-28"
          fill
          sizes="100vw"
          src="/community-lights.jpg"
        />
        <div className="absolute inset-0 bg-[#171310]/70" />
        <div className="relative mx-auto max-w-3xl rounded-[8px] border border-white/12 bg-white p-8 text-center text-[#171310] shadow-2xl">
          <Mail className="mx-auto size-8 text-[#d94b2b]" />
          <h2 className="mt-4 text-4xl font-black">Contact coming soon</h2>
          <p className="mt-4 text-base leading-7 text-[#5e554c]">
            Add the committee-approved email, form, or Instagram link here once
            SFVYPAA has a confirmed contact flow.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

function Detail({
  icon: Icon,
  text,
}: {
  icon: typeof MapPin
  text: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-1 size-4 shrink-0 text-[#d94b2b]" />
      <span>{text}</span>
    </div>
  )
}
