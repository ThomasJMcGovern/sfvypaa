import type { Metadata } from "next"

import { DailyReflectionViewer } from "@/components/daily-reflection-viewer"
import { PageHead } from "@/components/page-head"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { todayMonthDay } from "@/lib/reflections"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Daily Reflection | VALLEYPAA",
  description:
    "A daily recovery reflection for young people in Alcoholics Anonymous in the San Fernando Valley.",
}

export default async function DailyReflectionPage() {
  const today = todayMonthDay()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader active="daily-reflection" />
      <PageHead
        eyebrow="One day at a time"
        title="Daily reflection."
        sub="A thought to sit with each morning — browse any day with the calendar."
      />
      <section className="mx-auto w-full max-w-7xl px-5 pt-8 pb-16 sm:px-8 lg:px-10">
        <DailyReflectionViewer initialMonthDay={today} />
      </section>
      <SiteFooter />
    </main>
  )
}
