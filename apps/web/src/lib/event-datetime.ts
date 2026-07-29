const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

// A single time with an explicit meridiem: "7 PM", "4:30 p.m."
const timeTokenPattern = /(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?/i

// A range where the meridiem may appear only on the end time: "4:00 – 7:00 pm".
// The start time's meridiem is optional precisely because that is the case this
// exists to handle — matching only the end token would report the event as
// starting when it actually finishes.
const timeRangePattern =
  /(\d{1,2})(?::(\d{2}))?\s*(?:([ap])\.?m\.?)?\s*(?:-|–|—|to|until|till)\s*(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?/i

function to24Hour(hour: number, meridiem: string) {
  const m = meridiem.toLowerCase()

  if (m === "p") {
    return hour === 12 ? 12 : hour + 12
  }

  return hour === 12 ? 0 : hour
}

export function isIsoDate(value: string | undefined): value is string {
  return typeof value === "string" && isoDatePattern.test(value)
}

/**
 * Offset for America/Los_Angeles *on that specific date*. Hardcoding -07:00
 * would silently mis-stamp every event between early November and mid-March.
 */
function pacificOffset(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number)
  // Noon UTC keeps us clear of the midnight DST boundary in either direction.
  const probe = new Date(Date.UTC(year, month - 1, day, 12))

  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    timeZoneName: "longOffset",
  }).format(probe)

  const match = /GMT([+-]\d{2}:\d{2})/.exec(formatted)

  return match ? match[1] : "-08:00"
}

/**
 * Best-effort schema.org `startDate` from an ISO date plus the free-text time
 * field the admin captures ("7 PM – 10 PM", "2 pm").
 *
 * When the time can't be parsed we return the date alone, which is valid
 * schema.org and which Google accepts. We never guess a time — a wrong start
 * time on a recovery event is worse than no start time.
 */
export function eventStartDate(
  eventDate: string | undefined,
  time: string | undefined,
) {
  if (!isIsoDate(eventDate)) {
    return undefined
  }

  const raw = time ?? ""
  const stamp = (hour: number, minute: string) =>
    `${eventDate}T${String(hour).padStart(2, "0")}:${minute}:00${pacificOffset(eventDate)}`

  // Try a range first. "4:00 – 7:00 pm" must resolve to 16:00, not 19:00.
  const range = timeRangePattern.exec(raw)

  if (range) {
    const [, sh, sm, sMeridiem, eh, , eMeridiem] = range
    const startHour = Number(sh)
    const endHour = Number(eh)

    if (startHour >= 1 && startHour <= 12 && endHour >= 1 && endHour <= 12) {
      // No meridiem on the start time: inherit the end's. If that would put the
      // start after the end ("11 - 1 pm"), the start must be the other half of
      // the day.
      let meridiem = sMeridiem ?? eMeridiem

      if (!sMeridiem) {
        const inherited = to24Hour(startHour, meridiem)

        if (inherited > to24Hour(endHour, eMeridiem)) {
          meridiem = meridiem.toLowerCase() === "p" ? "a" : "p"
        }
      }

      return stamp(to24Hour(startHour, meridiem), sm ?? "00")
    }
  }

  const single = timeTokenPattern.exec(raw)

  if (!single) {
    return eventDate
  }

  const [, rawHour, rawMinute, meridiem] = single
  const hour = Number(rawHour)

  if (hour < 1 || hour > 12) {
    return eventDate
  }

  return stamp(to24Hour(hour, meridiem), rawMinute ?? "00")
}

/** True when the event date is strictly before today (Pacific). */
export function isPastEvent(eventDate: string | undefined) {
  if (!isIsoDate(eventDate)) {
    return false
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
  }).format(new Date())

  return eventDate < today
}
