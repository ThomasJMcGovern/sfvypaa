import Image from "next/image"
import {
  getSiteSettings,
  listPublishedSocialPosts,
  type SocialPostRecord,
} from "@sfvypaa/content"
import {
  ArrowRight,
  AtSign,
  ExternalLink,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { LinkCard } from "@/components/link-card"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { site, stats } from "@/lib/site"

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
    ? (await listPublishedSocialPosts()).slice(0, 3)
    : []

  return (
    <main className="min-h-screen overflow-hidden bg-[#171310] text-white">
      <section className="relative overflow-hidden pb-20" id="top">
        <Image
          alt="Sunset over the San Fernando Valley"
          className="object-cover opacity-42"
          fill
          priority
          sizes="100vw"
          src="/sfv-sunset.jpg"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#171310]/55 via-[#171310]/78 to-[#171310]" />
        <SiteHeader active="home" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 lg:px-10">
          <div className="max-w-5xl">
            <h1 className="text-[clamp(4rem,13vw,10rem)] font-black leading-[0.8] tracking-normal">
              {site.name}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72">
              {site.fullName}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 rounded-[8px] bg-[#ffcf6b] px-5 text-base font-semibold text-[#191109] hover:bg-[#f3b83f]"
                nativeButton={false}
                render={<a href={site.links.getInvolved} />}
              >
                Get involved
                <ArrowRight />
              </Button>
              <Button
                className="h-12 rounded-[8px] border-white/25 bg-white/10 px-5 text-base text-white hover:bg-white/20"
                nativeButton={false}
                render={<a href={site.links.events} />}
                variant="outline"
              >
                Upcoming events
              </Button>
            </div>
          </div>
          <div className="mt-14 grid gap-3 sm:grid-cols-3">
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

      <section className="px-5 pb-16 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-[1fr_0.58fr] lg:items-center">
          <div className="relative min-h-[320px] overflow-hidden rounded-[8px] bg-[#2a241e] lg:min-h-[520px]">
            <Image
              alt="San Fernando Valley at sunset"
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              src="/sfv-sunset.jpg"
            />
          </div>
          <div className="relative z-10 mx-4 -mt-12 rounded-[8px] bg-white p-8 text-[#171310] shadow-2xl lg:mx-0 lg:-ml-20 lg:mt-0 lg:p-14">
            <h2 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">
              What is SFVYPAA?
            </h2>
            <p className="mt-5 text-base leading-7 text-[#5e554c]">
              SFVYPAA is a young people in Alcoholics Anonymous committee
              serving the San Fernando Valley. The committee creates
              opportunities for service, fellowship, and events that help carry
              the AA message to alcoholics who still suffer.
            </p>
          </div>
        </div>
      </section>

      {settings.showInstagramSocials ? (
        <SocialSection posts={socialPosts} />
      ) : null}

      <LinkCard
        body="SFVYPAA business meeting details live on the get involved page, with the current flyer and meeting information in one place."
        buttonLabel="Get involved"
        href={site.links.getInvolved}
        imageAlt="SFVYPAA business meeting flyer"
        imageMode="contain"
        imageSrc="/business-meeting.png"
        title="When does SFVYPAA meet?"
        reverse
      />

      <LinkCard
        body="Events are separated from the homepage so flyers, hosted events, co-hosted events, and RSVP links have room to breathe."
        buttonLabel="Upcoming events"
        href={site.links.events}
        imageAlt="Anonymous abstract event lights"
        imageSrc="/community-lights.jpg"
        title="Events"
      />

      <LinkCard
        body="Published committee updates, service notes, and event announcements live in the SFVYPAA newsletter archive."
        buttonLabel="Read newsletters"
        href={site.links.newsletters}
        imageAlt="Anonymous abstract event lights"
        imageSrc="/stage-lights.jpg"
        title="Newsletters"
        reverse
      />

      <LinkCard
        body="Use the Los Angeles Central Office young people meeting search for current local young people meetings."
        buttonLabel="Find meetings here"
        external
        href={site.links.meetings}
        imageAlt="San Fernando Valley sunset"
        imageSrc="/sfv-sunset.jpg"
        title="Looking for a meeting?"
        reverse
      />

      <section className="px-5 pb-20 pt-4 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
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

      <SiteFooter />
    </main>
  )
}

function SocialSection({ posts }: { posts: SocialPostRecord[] }) {
  return (
    <section className="bg-[#1d1b18] px-5 py-16 sm:px-8 lg:px-10" id="socials">
      <div className="mx-auto grid max-w-7xl gap-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ffcf6b]">
              Instagram
            </p>
            <h2 className="mt-3 text-5xl font-black tracking-normal text-white sm:text-7xl">
              SOCIALS
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/64">
              Follow current committee posts, event reminders, and service
              announcements from SFVYPAA.
            </p>
          </div>
          <Button
            className="h-11 w-fit rounded-[8px] border-white/20 bg-white/10 px-4 text-white hover:bg-white/20"
            nativeButton={false}
            render={
              <a href={site.links.instagram} rel="noreferrer" target="_blank" />
            }
            variant="outline"
          >
            <AtSign />
            @sfvypaa
          </Button>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((post) => (
              <article
                className="overflow-hidden rounded-[8px] border border-white/10 bg-white text-[#171310] shadow-2xl shadow-black/20"
                key={post.id}
              >
                <a
                  className="group block"
                  href={post.instagramUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <div className="relative aspect-square bg-[#f5eee5]">
                    <Image
                      alt={post.title}
                      className="object-cover transition group-hover:scale-[1.02]"
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      src={post.imageUrl}
                      unoptimized
                    />
                  </div>
                </a>
                <div className="grid gap-3 p-5">
                  <p className="text-xs font-semibold uppercase tracking-normal text-[#d94b2b]">
                    {formatSocialDate(post.postDate)}
                  </p>
                  <h3 className="text-xl font-black leading-tight">
                    {post.title}
                  </h3>
                  <p className="line-clamp-4 text-sm leading-6 text-[#5e554c]">
                    {post.caption}
                  </p>
                  <Button
                    className="h-10 w-fit rounded-[8px] bg-[#171310] px-4 text-white hover:bg-[#2c241d]"
                    nativeButton={false}
                    render={
                      <a
                        href={post.instagramUrl}
                        rel="noreferrer"
                        target="_blank"
                      />
                    }
                  >
                    View on Instagram
                    <ExternalLink className="size-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-white/12 bg-white/8 p-8 text-center text-white/64">
            <p className="text-base leading-7">
              New Instagram highlights will appear here once they are published.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
