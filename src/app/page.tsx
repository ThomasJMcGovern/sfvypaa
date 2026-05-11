import Image from "next/image"
import {
  ArrowRight,
  AtSign,
  CalendarDays,
  ChevronRight,
  Clock,
  ExternalLink,
  HeartHandshake,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react"

import { MobileNav } from "@/components/mobile-nav"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  events,
  faqs,
  imageCredits,
  involvement,
  navItems,
  site,
  stats,
} from "@/lib/site"

const principles = [
  {
    title: "Anonymous by design",
    text: "Launch visuals use Valley landscapes, light, and atmosphere instead of identifiable member photography.",
    icon: ShieldCheck,
  },
  {
    title: "Service-led events",
    text: "Every gathering points back to AA service, sponsorship, meetings, and carrying the message.",
    icon: HeartHandshake,
  },
  {
    title: "Young people energy",
    text: "Premium, sober spaces that feel alive, current, and welcoming to newcomers.",
    icon: Sparkles,
  },
]

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f3ea] text-[#171310]">
      <HeroSection />
      <AboutSection />
      <MeetingsSection />
      <EventsSection />
      <GetInvolvedSection />
      <SocialSection />
      <Footer />
    </main>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-[#171310] text-white">
      <Image
        alt="Sunset over the San Fernando Valley"
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src="/sfv-sunset.jpg"
      />
      <div className="absolute inset-0 bg-[#171310]/40" />
      <div className="absolute inset-0 bg-linear-to-b from-[#171310]/30 via-[#171310]/25 to-[#171310]" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a className="flex items-center gap-3" href="#top" aria-label="SFVYPAA home">
          <span className="flex size-10 items-center justify-center rounded-[8px] border border-white/20 bg-white/10 text-sm font-black tracking-tight backdrop-blur">
            SFV
          </span>
          <span className="hidden text-sm font-semibold uppercase tracking-[0.22em] text-white/80 sm:block">
            {site.name}
          </span>
        </a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              className="text-sm font-medium text-white/75 transition hover:text-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button
            className="h-10 rounded-[8px] border-white/20 bg-white/10 px-4 text-white hover:bg-white/20"
            nativeButton={false}
            render={<a href={site.links.instagram} />}
            variant="outline"
          >
            <AtSign />
            Instagram
          </Button>
          <Button
            className="h-10 rounded-[8px] bg-[#ffcf6b] px-4 text-[#191109] hover:bg-[#f3b83f]"
            nativeButton={false}
            render={<a href={site.links.getInvolved} />}
          >
            Get involved
          </Button>
        </div>
        <MobileNav />
      </header>

      <div
        className="relative z-10 mx-auto flex min-h-[calc(92vh-84px)] w-full max-w-7xl flex-col justify-end px-5 pb-10 pt-16 sm:px-8 lg:px-10"
        id="top"
      >
        <div className="max-w-5xl">
          <Badge className="mb-5 h-7 rounded-[8px] border border-white/20 bg-white/10 px-3 text-white backdrop-blur">
            San Fernando Valley Young People in AA
          </Badge>
          <h1 className="max-w-5xl text-[clamp(4rem,16vw,12rem)] font-black leading-[0.78] tracking-normal">
            SFVYPAA
          </h1>
          <p className="mt-7 max-w-2xl text-xl leading-8 text-white/82 sm:text-2xl sm:leading-9">
            Sober fellowship, service, and premium young people events across the
            Valley.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-12 rounded-[8px] bg-[#ffcf6b] px-5 text-base font-semibold text-[#191109] hover:bg-[#f3b83f]"
              nativeButton={false}
              render={<a href={site.links.events} />}
            >
              Upcoming events
              <ArrowRight />
            </Button>
            <Button
              className="h-12 rounded-[8px] border-white/25 bg-white/10 px-5 text-base text-white hover:bg-white/20"
              nativeButton={false}
              render={<a href={site.links.meetings} />}
              variant="outline"
            >
              Meeting info
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-3 pb-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              className="rounded-[8px] border border-white/12 bg-white/10 p-4 backdrop-blur-md"
              key={stat.label}
            >
              <div className="text-3xl font-black text-[#ffcf6b]">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-white/65">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section className="bg-[#171310] px-5 py-20 text-white sm:px-8 lg:px-10" id="about">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ffcf6b]">
            What is SFVYPAA?
          </p>
          <h2 className="mt-4 max-w-2xl text-5xl font-black leading-[0.95] tracking-normal sm:text-7xl">
            A Valley home base for young people in recovery.
          </h2>
        </div>
        <div className="grid gap-5 text-white/72">
          <p className="text-lg leading-8">
            SFVYPAA is a young people in Alcoholics Anonymous committee serving
            the San Fernando Valley. The committee creates opportunities for
            service, fellowship, and events that help carry the AA message to
            alcoholics who still suffer.
          </p>
          <p className="text-lg leading-8">
            Inspired by the wider YPAA tradition, this page is built as a launch
            home for meeting information, upcoming events, committee service,
            and social connection once the final SFVYPAA details are approved.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-14 grid max-w-7xl gap-4 md:grid-cols-3">
        {principles.map((principle) => {
          const Icon = principle.icon

          return (
            <Card
              className="rounded-[8px] border-white/10 bg-white/[0.06] text-white ring-white/10"
              key={principle.title}
            >
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-[8px] bg-[#ffcf6b] text-[#191109]">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-xl font-black">
                  {principle.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-base leading-7 text-white/68">
                {principle.text}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

function MeetingsSection() {
  return (
    <section className="bg-[#f7f3ea] px-5 py-20 sm:px-8 lg:px-10" id="meetings">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="relative min-h-[420px] overflow-hidden rounded-[8px] bg-[#171310]">
          <Image
            alt="Empty event room with vivid stage lights"
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            src="/stage-lights.jpg"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#171310]/75 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 rounded-[8px] border border-white/12 bg-[#171310]/76 p-5 text-white backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ffcf6b]">
              Meeting rhythm
            </p>
            <p className="mt-2 text-2xl font-black">Schedule coming soon</p>
          </div>
        </div>

        <div>
          <Badge className="h-7 rounded-[8px] bg-[#d94b2b] px-3 text-white">
            Meetings
          </Badge>
          <h2 className="mt-5 text-5xl font-black leading-none tracking-normal sm:text-7xl">
            Show up, plug in, stay after.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5e554c]">
            SFVYPAA meeting and committee details are ready to be connected when
            the current schedule is confirmed. Until then, this section is set
            up to support a simple in-person, online, or hybrid meeting flow.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <InfoTile
              icon={CalendarDays}
              label="Committee"
              value="Monthly details pending"
            />
            <InfoTile
              icon={MapPin}
              label="Location"
              value="San Fernando Valley"
            />
            <InfoTile
              icon={Clock}
              label="Format"
              value="In person and online ready"
            />
            <InfoTile icon={UsersRound} label="Welcome" value="All ages" />
          </div>
        </div>
      </div>
    </section>
  )
}

function EventsSection() {
  return (
    <section className="bg-[#f7f3ea] px-5 pb-20 sm:px-8 lg:px-10" id="events">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 border-y border-[#171310]/15 py-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d94b2b]">
              Upcoming events
            </p>
            <h2 className="mt-3 max-w-4xl text-5xl font-black leading-none tracking-normal sm:text-7xl">
              Sober events with a Valley pulse.
            </h2>
          </div>
          <Button
            className="h-11 w-fit rounded-[8px] bg-[#171310] px-4 text-white hover:bg-[#2c241d]"
            nativeButton={false}
            render={<a href={site.links.getInvolved} />}
          >
            Help plan one
            <ChevronRight />
          </Button>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {events.map((event, index) => (
            <Card
              className="rounded-[8px] border-[#171310]/10 bg-white py-0 shadow-sm ring-[#171310]/10"
              key={event.title}
            >
              <CardHeader className="border-b border-[#171310]/10 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <Badge
                    className="h-7 rounded-[8px] bg-[#1c6f70] px-3 text-white"
                    variant="secondary"
                  >
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function GetInvolvedSection() {
  return (
    <section
      className="relative overflow-hidden bg-[#171310] px-5 py-20 text-white sm:px-8 lg:px-10"
      id="get-involved"
    >
      <Image
        alt="Abstract anonymous event lights"
        className="object-cover opacity-35"
        fill
        sizes="100vw"
        src="/community-lights.jpg"
      />
      <div className="absolute inset-0 bg-[#171310]/65" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div>
          <Badge className="h-7 rounded-[8px] border border-white/20 bg-white/10 px-3 text-white">
            Get involved
          </Badge>
          <h2 className="mt-5 max-w-4xl text-5xl font-black leading-none tracking-normal sm:text-7xl">
            Build the room you wish existed.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
            SFVYPAA needs people who can greet, plan, design, make coffee, set
            up chairs, share experience, and help newcomers find a place to land.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {involvement.map((item) => (
              <div
                className="flex items-center gap-3 rounded-[8px] border border-white/12 bg-white/10 p-4 backdrop-blur"
                key={item}
              >
                <span className="flex size-8 items-center justify-center rounded-[8px] bg-[#ffcf6b] text-[#191109]">
                  <Sparkles className="size-4" />
                </span>
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="rounded-[8px] border-white/12 bg-white p-2 text-[#171310] ring-white/10">
          <CardContent className="px-4 py-4 sm:px-5 sm:py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d94b2b]">
              Interest form
            </p>
            <h3 className="mt-3 text-3xl font-black leading-tight">
              Ready for the launch list.
            </h3>
            <p className="mt-3 text-base leading-7 text-[#5e554c]">
              This static form is a visual placeholder. Connect it to your
              preferred form provider when SFVYPAA has an approved contact flow.
            </p>
            <div className="mt-6 grid gap-3">
              <div className="flex h-12 w-full items-center rounded-[8px] border border-[#171310]/15 bg-[#f7f3ea] px-3 text-sm text-[#85786a]">
                Email address
              </div>
              <Button
                className="h-12 rounded-[8px] bg-[#d94b2b] text-white hover:bg-[#bc3f23]"
                nativeButton={false}
                render={<a href={site.links.contact} />}
              >
                Contact coming soon
                <Mail />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function SocialSection() {
  return (
    <section className="bg-[#f7f3ea] px-5 py-20 sm:px-8 lg:px-10" id="socials">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1c6f70]">
            Socials
          </p>
          <h2 className="mt-4 text-5xl font-black leading-none tracking-normal sm:text-7xl">
            Follow the next announcement.
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#5e554c]">
            Add the verified SFVYPAA Instagram, event RSVP, and contact links in
            one place inside <code className="font-mono">src/lib/site.ts</code>.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-11 rounded-[8px] bg-[#171310] px-4 text-white hover:bg-[#2c241d]"
              nativeButton={false}
              render={<a href={site.links.instagram} />}
            >
              <AtSign />
              Instagram link coming soon
            </Button>
            <Button
              className="h-11 rounded-[8px] border-[#171310]/20 bg-transparent px-4 hover:bg-[#171310]/5"
              nativeButton={false}
              render={<a href={site.links.contact} />}
              variant="outline"
            >
              Contact
              <ExternalLink />
            </Button>
          </div>
        </div>

        <div className="rounded-[8px] border border-[#171310]/10 bg-white p-2 shadow-sm">
          <Accordion className="px-3 py-2" defaultValue={["item-0"]}>
            {faqs.map((faq, index) => (
              <AccordionItem
                className="border-[#171310]/10"
                key={faq.question}
                value={`item-${index}`}
              >
                <AccordionTrigger className="py-5 text-base font-black hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-7 text-[#5e554c]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer
      className="bg-[#171310] px-5 py-10 text-white sm:px-8 lg:px-10"
      id="contact"
    >
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <div className="text-3xl font-black">{site.name}</div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
            {site.fullName}. This independent landing page is prepared for
            committee launch content and should be updated with approved
            SFVYPAA links before public use.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/48">
            {imageCredits.map((credit) => (
              <a
                className="transition hover:text-white"
                href={credit.href}
                key={credit.href}
                rel="noreferrer"
                target="_blank"
              >
                {credit.label}: {credit.credit}
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <a className="text-sm text-white/62 hover:text-white" href={site.links.contact}>
            {site.contactEmail}
          </a>
          <a className="text-sm text-white/62 hover:text-white" href="#top">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div className="rounded-[8px] border border-[#171310]/10 bg-white p-4 shadow-sm">
      <Icon className="size-5 text-[#d94b2b]" />
      <div className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#85786a]">
        {label}
      </div>
      <div className="mt-1 text-lg font-black">{value}</div>
    </div>
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
