import type { Metadata } from "next"
import Link from "next/link"
import { listPublishedNewsletters } from "@sfvypaa/content"
import { ArrowRight, Newspaper } from "lucide-react"

import { PageHead } from "@/components/page-head"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"

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
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader active="newsletters" />

      <PageHead
        eyebrow="The zine rack"
        sub="Committee updates, event announcements, and service notes from SFVYPAA. Hot off the photocopier."
        title="Newsletters."
      />

      <section className="mx-auto w-full max-w-[820px] px-5 pt-7">
        {newsletters.length > 0 ? (
          <div className="flex flex-col gap-6">
            {newsletters.map((newsletter, index) => (
              <Link
                className={cn(
                  "flex w-full items-center gap-5 border-[3px] border-border bg-card p-6 text-left text-card-foreground shadow-stamp-lg transition-[transform,box-shadow] duration-100 ease-(--ease-snap) active:translate-x-1 active:translate-y-1 active:shadow-none sm:px-[26px]",
                  index % 2 === 0 ? "sm:-rotate-[0.7deg]" : "sm:rotate-[0.7deg]"
                )}
                href={`/newsletters/${newsletter.slug}`}
                key={newsletter.id}
              >
                <div className="flex-1">
                  <p className="mb-2 font-mono text-[13px] font-bold text-orange">
                    {formatNewsletterDate(newsletter.publishDate)}
                  </p>
                  <h2 className="mb-2.5 text-2xl leading-[0.98] text-foreground">
                    {newsletter.title}
                  </h2>
                  <p className="max-w-[62ch] text-[15px] leading-[1.55] text-text-soft">
                    {newsletter.excerpt}
                  </p>
                </div>
                <span className="flex size-12 shrink-0 items-center justify-center border-[3px] border-border text-foreground">
                  <ArrowRight className="size-[22px]" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-border/35 px-6 py-[72px] text-center">
            <Newspaper className="mx-auto mb-4 size-9 text-muted-foreground" />
            <p className="text-base text-text-soft">
              No newsletters have been published yet.
            </p>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  )
}
