export const siteUrl = "https://valleypaa.org"

/**
 * Next merges metadata shallowly: a page that declares `openGraph` replaces the
 * root's object entirely rather than merging into it. Spread this into any
 * page-level `openGraph` so the shared fields survive.
 */
export const baseOpenGraph = {
  siteName: "VALLEYPAA",
  locale: "en_US",
  type: "website",
} as const
