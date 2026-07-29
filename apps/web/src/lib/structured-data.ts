import type { EventRecord } from "@valleypaa/content"

import { eventStartDate } from "@/lib/event-datetime"
import { siteUrl } from "@/lib/seo"
import { businessMeeting, serviceArea, site } from "@/lib/site"

const organizationId = `${siteUrl}/#organization`
const websiteId = `${siteUrl}/#website`

/**
 * The committee's business-meeting venue — the only real, verified postal
 * address on the site. Split out of businessMeeting.address so it can be
 * emitted as a proper PostalAddress instead of an unstructured string.
 */
const businessMeetingAddress = {
  "@type": "PostalAddress",
  streetAddress: "21520 Sherman Way",
  addressLocality: "Canoga Park",
  addressRegion: serviceArea.state,
  postalCode: "91303",
  addressCountry: "US",
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "NGO"],
    "@id": organizationId,
    name: site.name,
    alternateName: [site.fullName, "Valley PAA", "SFVYPAA"],
    url: siteUrl,
    description: site.description,
    sameAs: [site.links.instagram],
    areaServed: [
      { "@type": "AdministrativeArea", name: serviceArea.region },
      { "@type": "City", name: serviceArea.city },
      { "@type": "AdministrativeArea", name: serviceArea.county },
    ],
    location: {
      "@type": "Place",
      name: businessMeeting.location,
      address: businessMeetingAddress,
    },
  }
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: site.name,
    description: site.description,
    publisher: { "@id": organizationId },
  }
}

export function eventUrl(slug: string) {
  return `${siteUrl}/upcoming-events/${slug}`
}

export function eventJsonLd(event: EventRecord, slug: string) {
  const url = eventUrl(slug)
  const startDate = eventStartDate(event.eventDate, event.time)

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": url,
    name: event.title,
    url,
    description: event.tone,
    ...(startDate ? { startDate } : {}),
    ...(event.imageUrl ? { image: [event.imageUrl] } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@id": organizationId },
    // event.location is a single free-text field ("Reseda backyard pool ·
    // address on RSVP"). Emitting it as Place.name is the honest best effort —
    // deriving a locality or postal code from it would be fabrication.
    location: {
      "@type": "Place",
      name: event.location,
    },
    isAccessibleForFree: true,
  }
}

export function eventListJsonLd(
  events: Array<{ event: EventRecord; slug: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: events.map(({ event, slug }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: eventUrl(slug),
      name: event.title,
    })),
  }
}

export function faqPageJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  }
}
