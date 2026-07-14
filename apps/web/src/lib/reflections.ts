// Daily Reflection dataset — keyed by month-day ("MM-DD").
//
// Pure, web-only data + helpers (safe to import from both server and client
// components — no Firestore/firebase-admin here).
//
// COPYRIGHT: AA's "Daily Reflections" is © Alcoholics Anonymous World Services,
// Inc. — all rights reserved. Do NOT paste reflections copied from aa.org or a
// third-party PDF into this file. Populate the full 366-entry set ONLY from a
// source VALLEYPAA is licensed to reproduce (AAWS reprint permission). The
// entries below are placeholders so the page + calendar render and can be
// styled/tested; swap in the licensed content keyed by MM-DD (include "02-29"
// for leap day). It's a data-only change — no code edits required.

export type DailyReflection = {
  monthDay: string // "MM-DD"
  title: string
  quote: string
  source: string
  reflection: string
}

export const dailyReflections: DailyReflection[] = [
  {
    monthDay: "07-14",
    title: "Placeholder — awaiting licensed content",
    quote:
      "This is placeholder text so the Daily Reflection page renders. It is not from any copyrighted work.",
    source: "Placeholder",
    reflection:
      "Once VALLEYPAA has reprint permission from AAWS (or another licensed source), the real reflection for this day drops in here — same shape, no code changes. Until then, this stand-in keeps the page and calendar working so we can style and test everything.",
  },
  {
    monthDay: "07-15",
    title: "Placeholder — another sample day",
    quote:
      "A second placeholder entry, here only to prove the calendar can browse between days.",
    source: "Placeholder",
    reflection:
      "Pick a different date in the calendar and this text changes. Days without an entry show a friendly 'no reflection yet' message. Replace all of these with the licensed set keyed by MM-DD.",
  },
  {
    monthDay: "02-29",
    title: "Placeholder — leap day",
    quote:
      "Leap day (February 29) has its own entry so it is never skipped in leap years.",
    source: "Placeholder",
    reflection:
      "The calendar is rendered on a leap year so February 29 is always selectable. This placeholder confirms leap day works.",
  },
]

const byMonthDay = new Map(
  dailyReflections.map((entry) => [entry.monthDay, entry]),
)

// Today's month-day ("MM-DD") in the committee's timezone (San Fernando Valley,
// America/Los_Angeles) so the reflection flips at the right local midnight.
export function todayMonthDay(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())
  const month = parts.find((part) => part.type === "month")?.value ?? "01"
  const day = parts.find((part) => part.type === "day")?.value ?? "01"
  return `${month}-${day}`
}

export function reflectionForMonthDay(
  monthDay: string,
): DailyReflection | undefined {
  return byMonthDay.get(monthDay)
}

export function hasReflection(monthDay: string): boolean {
  return byMonthDay.has(monthDay)
}
