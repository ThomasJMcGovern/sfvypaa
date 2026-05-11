import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPublishedNewsletterBySlug } from "@sfvypaa/content"
import { Newspaper } from "lucide-react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const newsletter = await getPublishedNewsletterBySlug(slug)

  return {
    title: newsletter ? `${newsletter.title} | SFVYPAA` : "Newsletter | SFVYPAA",
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

  return (
    <main className="min-h-screen bg-[#171310] text-white">
      <SiteHeader active="newsletters" />
      <article className="px-5 pb-24 pt-16 sm:px-8 lg:px-10" id="top">
        <div className="mx-auto max-w-3xl">
          <Newspaper className="size-9 text-[#ffcf6b]" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-normal text-white/56">
            {newsletter.publishDate}
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-normal sm:text-6xl">
            {newsletter.title}
          </h1>
          <p className="mt-6 text-xl leading-9 text-white/68">
            {newsletter.excerpt}
          </p>
          <div className="mt-10 rounded-[8px] bg-white p-7 text-[#171310] shadow-2xl sm:p-10">
            <div className="whitespace-pre-wrap text-base leading-8 text-[#4f463d]">
              {newsletter.body}
            </div>
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  )
}
