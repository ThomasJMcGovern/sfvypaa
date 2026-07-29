import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/seo"

// Named explicitly rather than relying on the `*` group: a crawler that matches
// its own user-agent group ignores `*` entirely. Cloudflare serves a managed
// robots.txt for this domain and may append content-signal directives to `*`,
// so these bots get their own unambiguous allow.
const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: aiCrawlers, allow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
