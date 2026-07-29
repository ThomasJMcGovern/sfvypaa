import type { MetadataRoute } from "next"
import {
  eventSlug,
  getSiteSettings,
  listPublishedEvents,
  listPublishedNewsletters,
} from "@valleypaa/content"

import { isPastEvent } from "@/lib/event-datetime"
import { siteUrl } from "@/lib/seo"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, events, newsletters] = await Promise.all([
    getSiteSettings(),
    listPublishedEvents(),
    listPublishedNewsletters(),
  ])

  const entries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteUrl}/upcoming-events`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/get-involved`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/newsletters`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]

  // /daily-reflection calls notFound() when this flag is off, and a 404 in the
  // sitemap is a Search Console error.
  if (settings.showDailyReflection) {
    entries.push({
      url: `${siteUrl}/daily-reflection`,
      changeFrequency: "daily",
      priority: 0.5,
    })
  }

  for (const event of events) {
    const past = isPastEvent(event.eventDate)

    // Deliberately no `images`. Next does not XML-escape <image:loc>, and the
    // Firebase Storage flyer URLs contain "?alt=media&token=..." — that bare
    // ampersand makes the whole sitemap unparseable, which would get the entire
    // file rejected. Flyers in Google Images aren't worth that.
    entries.push({
      url: `${siteUrl}/upcoming-events/${eventSlug(event)}`,
      lastModified: event.updatedAt ?? event.publishedAt,
      changeFrequency: past ? "yearly" : "weekly",
      priority: past ? 0.4 : 0.8,
    })
  }

  for (const newsletter of newsletters) {
    entries.push({
      url: `${siteUrl}/newsletters/${newsletter.slug}`,
      lastModified: newsletter.updatedAt ?? newsletter.publishedAt,
      changeFrequency: "yearly",
      priority: 0.5,
    })
  }

  return entries
}
