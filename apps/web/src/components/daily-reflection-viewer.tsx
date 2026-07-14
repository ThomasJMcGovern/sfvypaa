"use client"

import { useMemo, useState } from "react"
import { CalendarDays } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { reflectionForMonthDay, type DailyReflection } from "@/lib/reflections"

// Reflections are keyed by month-day; render the picker on a leap year so
// Feb 29 is always selectable. The calendar year itself is irrelevant.
const CALENDAR_YEAR = 2024

function monthDayOf(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${month}-${day}`
}

function dateFromMonthDay(monthDay: string): Date {
  const [month, day] = monthDay.split("-").map(Number)
  return new Date(CALENDAR_YEAR, (month || 1) - 1, day || 1)
}

const dateLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
})

export function DailyReflectionViewer({
  initialMonthDay,
}: {
  initialMonthDay: string
}) {
  const [selected, setSelected] = useState<Date>(() =>
    dateFromMonthDay(initialMonthDay),
  )
  const monthDay = monthDayOf(selected)
  const reflection = useMemo<DailyReflection | undefined>(
    () => reflectionForMonthDay(monthDay),
    [monthDay],
  )
  const dateLabel = dateLabelFormatter.format(selected)

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* the reflection — taped paper zine sheet */}
      <div className="tape relative border-[3px] border-border bg-paper p-7 text-ink shadow-stamp-lg sm:p-[clamp(28px,5vw,56px)]">
        <p className="mt-1 mb-4 font-mono text-[13px] font-bold text-orange-deep">
          {dateLabel}
        </p>
        {reflection ? (
          <>
            <h2 className="mb-5 text-[clamp(2rem,5vw,3rem)] leading-[0.95] text-ink">
              {reflection.title}
            </h2>
            <p className="mb-5 border-l-4 border-orange pl-4 text-[19px] leading-relaxed font-semibold text-ink-2">
              {reflection.quote}
            </p>
            <p className="mb-7 font-mono text-[13px] font-bold tracking-[0.04em] text-ink-3 uppercase">
              {reflection.source}
            </p>
            {reflection.reflection.split(/\n+/).map((paragraph, index) => (
              <p
                className="mb-5 text-[17px] leading-[1.7] text-ink-2"
                key={index}
              >
                {paragraph}
              </p>
            ))}
          </>
        ) : (
          <div className="py-8">
            <h2 className="mb-3 text-2xl text-ink">No reflection yet</h2>
            <p className="text-[17px] leading-[1.7] text-ink-2">
              There isn&apos;t a reflection loaded for {dateLabel} yet. Pick
              another day on the calendar, or check back once the full set is in.
            </p>
          </div>
        )}
        <div
          aria-hidden="true"
          className="mt-8 text-center text-sm tracking-[0.4em] text-orange select-none"
        >
          ★ ★ ★ ★ ★
        </div>
      </div>

      {/* calendar — browse any day of the year */}
      <aside className="lg:pt-1">
        <div className="border-[3px] border-border bg-card p-2.5 shadow-stamp">
          <p className="mb-1 flex items-center gap-2 px-1.5 pt-1.5 font-mono text-[12px] font-bold tracking-[0.08em] text-foreground uppercase">
            <CalendarDays className="size-4 text-orange" />
            Browse by day
          </p>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) {
                setSelected(date)
              }
            }}
            defaultMonth={selected}
          />
        </div>
      </aside>
    </div>
  )
}
