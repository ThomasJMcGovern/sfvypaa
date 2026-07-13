import { format } from "date-fns";

// Derive the human "Month D, YYYY" label from an ISO (YYYY-MM-DD) event date.
// Returns "" for anything that isn't a valid ISO date. Shared by the event
// server action (the default label) and the editor form (placeholder + spotting
// a custom/recurring label) so the two stay in sync.
export function formatEventDateLabel(value: string | undefined): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value ?? "").trim());

  if (!match) {
    return "";
  }

  const [, year, month, day] = match;
  return format(
    new Date(Number(year), Number(month) - 1, Number(day)),
    "MMMM d, yyyy",
  );
}
