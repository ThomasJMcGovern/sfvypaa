const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/
const timeTokenPattern = /(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?/gi

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

  const match = timeTokenPattern.exec(time ?? "")
  timeTokenPattern.lastIndex = 0

  if (!match) {
    return eventDate
  }

  const [, rawHour, rawMinute, meridiem] = match
  let hour = Number(rawHour)

  if (hour < 1 || hour > 12) {
    return eventDate
  }

  if (meridiem.toLowerCase() === "p" && hour !== 12) {
    hour += 12
  }

  if (meridiem.toLowerCase() === "a" && hour === 12) {
    hour = 0
  }

  const minute = rawMinute ?? "00"

  return `${eventDate}T${String(hour).padStart(2, "0")}:${minute}:00${pacificOffset(eventDate)}`
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
