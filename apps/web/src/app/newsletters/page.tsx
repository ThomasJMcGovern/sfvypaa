import type { Metadata } from "next"
import Link from "next/link"
import { listPublishedNewsletters } from "@sfvypaa/content"
import { ArrowRight, Newspaper } from "lucide-react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Newsletters | SFVYPAA",
  description:
    "Published SFVYPAA newsletter archive for San Fernando Valley young people in AA.",
}

const newsletterDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
})

function formatNewsletterDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return value
  }

  const [, year, month, day] = match
  return newsletterDateFormatter.format(
    new Date(Number(year), Number(month) - 1, Number(day)),
  )
}

export default async function NewslettersPage() {
  const newsletters = await listPublishedNewsletters()

  return (
    <main className="min-h-screen bg-[#171310] text-white">
      <SiteHeader active="newsletters" />
      <section className="px-5 pb-16 pt-16 text-center sm:px-8 lg:px-10" id="top">
        <Newspaper className="mx-auto size-10 text-[#ffcf6b]" />
        <h1 className="mt-5 text-5xl font-black tracking-normal sm:text-7xl lg:text-8xl">
          Newsletters
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/68">
          Committee updates, event announcements, and service notes from
          SFVYPAA.
        </p>
      </section>

      <section className="px-5 pb-24 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-5xl gap-4">
          {newsletters.length > 0 ? (
            newsletters.map((newsletter) => (
              <Link
                className="group block"
                href={`/newsletters/${newsletter.slug}`}
                key={newsletter.id}
              >
                <Card className="rounded-[8px] border-white/10 bg-white text-[#171310] ring-white/10 transition group-hover:-translate-y-0.5 group-hover:shadow-2xl">
                  <CardHeader className="gap-3">
                    <p className="text-sm font-semibold uppercase tracking-normal text-[#d94b2b]">
                      {formatNewsletterDate(newsletter.publishDate)}
                    </p>
                    <CardTitle className="flex items-center justify-between gap-4 text-3xl font-black">
                      <span>{newsletter.title}</span>
                      <ArrowRight className="size-5 shrink-0" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-base leading-7 text-[#5e554c]">
                    {newsletter.excerpt}
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="rounded-[8px] border border-white/12 bg-white/10 p-8 text-center text-white/68">
              No newsletters have been published yet.
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
