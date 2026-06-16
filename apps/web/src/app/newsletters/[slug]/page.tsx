import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getPublishedNewsletterBySlug } from "@valleypaa/content"
import { ArrowLeft } from "lucide-react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const revalidate = 60

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const newsletter = await getPublishedNewsletterBySlug(slug)

  return {
    title: newsletter ? `${newsletter.title} | VALLEYPAA` : "Newsletter | VALLEYPAA",
    description: newsletter?.excerpt,
  }
}

export default async function NewsletterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const newsletter = await getPublishedNewsletterBySlug(slug)

  if (!newsletter) {
    notFound()
  }

  const paragraphs = newsletter.body
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader active="newsletters" />

      <div className="border-b-[5px] border-border bg-secondary">
        <article className="mx-auto w-full max-w-[740px] px-5 pt-8 pb-[72px]">
          <Link
            className="mb-7 inline-flex items-center gap-2 text-[13px] font-extrabold tracking-[0.08em] text-orange uppercase transition-colors hover:text-foreground"
            href="/newsletters"
          >
            <ArrowLeft className="size-[15px]" />
            All newsletters
          </Link>

          {/* taped paper sheet — stays white even at night */}
          <div className="tape relative border-[3px] border-border bg-paper p-7 text-ink shadow-stamp-lg sm:p-[clamp(28px,5vw,56px)]">
            <p className="mt-1 mb-4 font-mono text-[13px] font-bold text-orange-deep">
              {formatNewsletterDate(newsletter.publishDate)}
            </p>
            <h1 className="mb-5 text-[clamp(2.2rem,5.5vw,3.4rem)] leading-[0.95] text-ink">
              {newsletter.title}
            </h1>
            <p className="mb-7 text-[19px] leading-relaxed font-semibold text-ink-2">
              {newsletter.excerpt}
            </p>

            {paragraphs.map((paragraph, index) => (
              <p
                className="mb-5 text-[17px] leading-[1.7] text-ink-2"
                key={index}
              >
                {paragraph}
              </p>
            ))}

            <div
              aria-hidden="true"
              className="mt-8 text-center text-sm tracking-[0.4em] text-orange select-none"
            >
              ★ ★ ★ ★ ★
            </div>
          </div>
        </article>
      </div>

      <SiteFooter />
    </main>
  )
}
