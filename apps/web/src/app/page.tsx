import Image from "next/image"
import { getSiteSettings, listPublishedSocialPosts } from "@valleypaa/content"
import { ArrowRight } from "lucide-react"

import { LinkRow } from "@/components/link-row"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SocialCarousel } from "@/components/social-carousel"
import { Button } from "@/components/ui/button"
import { businessMeeting, site } from "@/lib/site"

const principles = [
  {
    glyph: "★",
    title: "Anonymous by design",
    text: "Loud visuals, zero identifiable member photography. We lean on Valley landscapes, light, and atmosphere instead of faces.",
  },
  {
    glyph: "→",
    title: "Service-led events",
    text: "Every gathering points back to AA service — speakers, steps, meetings, and carrying the message.",
  },
  {
    glyph: "✱",
    title: "Young people energy",
    text: "Rooms and events that feel alive, current, and genuinely welcoming to anyone who walks in.",
  },
]

export const revalidate = 60

const socialDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function formatSocialDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return value
  }

  const [, year, month, day] = match
  return socialDateFormatter.format(
    new Date(Number(year), Number(month) - 1, Number(day)),
  )
}

export default async function Home() {
  const settings = await getSiteSettings()
  const socialPosts = settings.showInstagramSocials
    ? (await listPublishedSocialPosts()).slice(0, 12).map((post) => ({
        id: post.id,
        title: post.title,
        caption: post.caption,
        instagramUrl: post.instagramUrl,
        imageUrl: post.imageUrl ?? "",
        dateLabel: formatSocialDate(post.postDate),
      }))
    : []

  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader active="home" />

      {/* 1 — flyer hero */}
      <section
        className="grain relative overflow-hidden border-b-[5px] border-border"
        id="top"
      >
        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 px-5 pt-13 pb-15 sm:px-8 lg:grid-cols-[1.25fr_0.9fr] lg:px-10">
          <div className="relative z-[2]">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="border-2 border-primary bg-primary px-2.5 py-0.5 text-xs font-bold tracking-[0.14em] text-primary-foreground uppercase">
                San Fernando Valley
              </span>
              <span className="stamp -rotate-[5deg] border-2 border-orange px-2 py-0.5 text-sm text-orange">
                since 1935 · still loud
              </span>
            </div>
            <h1 className="text-[clamp(3rem,7.5vw,6rem)] text-foreground">
              You&apos;re not too <span className="text-orange">young.</span>{" "}
              And it&apos;s not too late.
            </h1>
            <p className="mt-5.5 mb-7 max-w-[42ch] text-[19px] leading-normal font-medium text-text-soft">
              VALLEYPAA is young people in AA across the Valley. Show up as you
              are — nothing&apos;s required of you but to walk in.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                nativeButton={false}
                render={
                  <a
                    href={site.links.meetings}
                    rel="noreferrer"
                    target="_blank"
                  />
                }
                size="lg"
              >
                Find a meeting
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button
                nativeButton={false}
                render={<a href={site.links.events} />}
                size="lg"
                variant="outline"
              >
                See what&apos;s on
              </Button>
            </div>
          </div>
          <div className="relative hidden justify-center sm:flex">
            <div className="absolute inset-[6%_10%] -rotate-4 border-[3px] border-ink bg-orange" />
            <Image
              alt="Punk Bill — Bill W. with a mohawk"
              className="relative w-full max-w-[360px] rotate-2 dark:invert"
              height={1254}
              priority
              src="/assets/punk-bill-ink.png"
              width={1254}
            />
          </div>
        </div>
      </section>

      {/* 2 — next committee meeting ink strip */}
      <section className="mx-auto w-full max-w-7xl px-5 pt-11 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center gap-5 border-[3px] border-border bg-ink px-6 py-5 text-bone shadow-stamp-lg">
          <div className="min-w-[min(100%,280px)] flex-1">
            <p className="label-stamp text-orange">Next committee meeting</p>
            <p className="font-display mt-1.5 text-3xl uppercase">
              {businessMeeting.title}
            </p>
            <p className="mt-2 font-mono text-sm text-[#C9C0AC]">
              {businessMeeting.schedule} · {businessMeeting.time} ·{" "}
              {businessMeeting.location}
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<a href={`${site.links.getInvolved}#business-meeting`} />}
          >
            Details
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </section>

      {/* 3 — what is VALLEYPAA: duotone valley + overlapping card */}
      <section className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8 lg:px-10">
        <div className="grid items-center lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <div className="relative aspect-video border-[3px] border-border bg-bone-3">
            <Image
              alt="San Fernando Valley at sunset"
              className="duotone object-cover"
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              src="/sfv-sunset.jpg"
            />
          </div>
          <div className="relative z-[2] mx-4 -mt-10 border-[3px] border-border bg-card p-6 text-card-foreground shadow-stamp-lg lg:mx-0 lg:-ml-[72px] lg:mt-0 lg:p-7">
            <p className="label-stamp mb-3 text-orange">Who we are</p>
            <h2 className="mb-3 text-[clamp(2rem,4vw,3rem)] text-foreground">
              What is VALLEYPAA?
            </h2>
            <p className="text-base leading-relaxed text-text-soft">
              VALLEYPAA is a young people in Alcoholics Anonymous committee
              serving the San Fernando Valley. We create opportunities for
              service, fellowship, and events that help carry the AA message to
              anybody who still suffers.
            </p>
          </div>
        </div>
      </section>

      {settings.showInstagramSocials ? (
        <SocialCarousel instagramUrl={site.links.instagram} posts={socialPosts} />
      ) : null}

      {/* 5 — alternating link rows */}
      <section className="mx-auto w-full max-w-7xl px-5 pt-[72px] sm:px-8 lg:px-10">
        <div className="flex flex-col gap-7">
          <LinkRow
            body="Meeting details live on the get-involved page, with the current time and place kept in one easy spot."
            cta="Get involved"
            eyebrow="When does VALLEYPAA meet?"
            href={site.links.getInvolved}
            imageAlt="VALLEYPAA business meeting flyer"
            imageMode="contain"
            imageSrc="/business-meeting.png"
            title="Get involved"
          />
          <LinkRow
            body="Events are separated from the homepage so flyers, hosted events, and RSVP times have room to breathe."
            cta="Upcoming events"
            eyebrow="What's on"
            flip
            href={site.links.events}
            imageAlt="Anonymous abstract stage lights"
            imageSrc="/stage-lights.jpg"
            title="Events"
          />
          <LinkRow
            body="Published committee updates, service notes, and event announcements live in the VALLEYPAA newsletter archive."
            cta="Read newsletters"
            eyebrow="The zine rack"
            href={site.links.newsletters}
            imageAlt="Anonymous abstract event lights"
            imageSrc="/community-lights.jpg"
            title="Newsletters"
          />
          <LinkRow
            body="Use the Los Angeles Central Office young people meeting search for current local young people meetings."
            cta="Find meetings here"
            external
            eyebrow="Looking for a meeting?"
            flip
            href={site.links.meetings}
            imageAlt="San Fernando Valley at dusk"
            imageSrc="/sfv-sunset.jpg"
            title="Find a meeting"
          />
        </div>
      </section>

      {/* 6 — principles */}
      <section className="mx-auto w-full max-w-7xl px-5 pt-[72px] sm:px-8 lg:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          {principles.map((principle) => (
            <div
              className="border-[3px] border-border bg-card p-6 text-card-foreground shadow-stamp"
              key={principle.title}
            >
              <div className="font-display mb-4 flex size-[46px] items-center justify-center border-[3px] border-border text-2xl text-orange">
                {principle.glyph}
              </div>
              <h3 className="mb-2 text-[22px] leading-[0.95] text-foreground">
                {principle.title}
              </h3>
              <p className="text-sm leading-[1.55] text-text-soft">
                {principle.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7 — new here? reassurance */}
      <section className="mx-auto w-full max-w-3xl px-5 pt-[72px] text-center sm:px-8">
        <div
          aria-hidden="true"
          className="mb-6 text-sm tracking-[0.4em] text-orange select-none"
        >
          ★ ★ ★ ★ ★
        </div>
        <h2 className="mb-4 text-[clamp(2.2rem,5vw,3.4rem)] text-foreground">
          New here? Read this.
        </h2>
        <p className="mx-auto mb-6 max-w-[46ch] text-lg leading-relaxed text-text-soft">
          You don&apos;t have to have hit a bottom. You don&apos;t have to call
          yourself anything. You don&apos;t have to talk. Come early, get a
          coffee, sit in the back if you want. We&apos;ll be glad you came.
        </p>
        <div className="border-2 border-border border-l-8 border-l-orange bg-card p-4 text-left shadow-stamp">
          <p className="text-sm font-extrabold tracking-[0.06em] uppercase">
            It&apos;s free. It&apos;s anonymous.
          </p>
          <p className="mt-1 text-sm leading-6 text-text-soft">
            No dues, no fees, no sign-up. Whatever you say in the room stays in
            the room. If you&apos;re not sure where to start, come to a meeting
            or DM{" "}
            <a
              className="font-bold underline decoration-2 underline-offset-2 hover:text-orange"
              href={site.links.instagram}
              rel="noreferrer"
              target="_blank"
            >
              @sfvypaa
            </a>{" "}
            — a real person answers.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
