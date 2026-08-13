---
name: bing-indexing
description: Use when checking whether valleypaa.org is indexed or crawled by Bing, running Bing Webmaster API operations (sitemaps, URL submission, fetch orders, diagnostics), managing IndexNow pings, or investigating why pages are not appearing in Bing/ChatGPT. Trigger phrases include "is it indexed", "bing webmaster", "indexnow", "crawl status", "discovered but not crawled", "why isn't this showing up in ChatGPT".
---

# Bing Indexing & IndexNow — valleypaa.org

Adapted from the brewlune `bing-indexing` skill, kept in sync with what this
repo's tooling actually does. Where the two differ, this file wins for
valleypaa. The brewlune skill remains the better general reference for the API
itself; read it when working on that project.

**Why Bing at all:** ChatGPT's search leans on Bing as a primary source (plus
OpenAI's own `OAI-SearchBot`). Google indexing is independent and buys nothing
for ChatGPT — measured directly here: Google ranked an event page #1 while Bing
had never fetched it, and ChatGPT could not find it.

## Credentials

| | Where | Committed? |
|---|---|---|
| `BING_WEBMASTER_API_KEY` | repo-root `.env.local` | **No** — gitignored (`.env*`), chmod 600 |
| IndexNow key | `apps/web/public/<key>.txt` | **Yes** — public by design; engines must fetch it to validate |

Set/rotate the API key with `bun run scripts/setup-bing-env.ts` (hidden prompt,
validates against `GetUserSites` before writing, refuses to write if
`git check-ignore` says the target isn't ignored). `--check` re-validates.

Never echo the API key — interpolate it into URLs only. It is per-**user**, not
per-site.

## Tooling in this repo

| Command | Does |
|---|---|
| `bun run indexnow --all` | IndexNow ping of every URL in the live sitemap. Verifies the hosted key file serves and matches first. Free, unlimited. |
| `bun run indexnow --events` | Event permalinks + the events index |
| `bun run indexnow --url /path` | Specific paths (repeatable) |
| `bun run bing quota` | Daily / monthly URL-submission allowance |
| `bun run bing submit --all` | Ask Bing to fetch. Quota-limited. Refuses to exceed remaining quota; prints before/after. |
| `bun run bing inspect --all` | Every sitemap URL — **run this first**, the depth pattern only shows in aggregate |
| `bun run bing inspect --url /path` | One or more URLs (repeatable) |
| `bun run indexnow --all --dry-run` | Show the payload without sending |
| `bun run indexnow --verify-key` | Check the hosted key file only |
| `bun run bing feeds` | Sitemaps on file + stale-feed warning |
| `bun run bing fetch --url /path` | Order a single fetch (`FetchUrl`) |
| `bun run bing submitted` | Recent fetch activity |

Both scripts read URLs from the **live sitemap**, not a hardcoded list — event
slugs on this site have moved twice, and both times a pasted list was silently
wrong.

## IndexNow vs URL Submission — not interchangeable

Proven on this site, not assumed:

- IndexNow reported **every** URL discovered by Bing within a day of the first
  ping (Jul 29).
- Two weeks and five pings later, `bizarre-bazaar-okxxczfm` still had
  `DiscoveryDate: never`, `DocumentSize: 0` — Bing had zero bytes of it, while
  `/upcoming-events` had been crawled.

IndexNow announces *"this changed"*: fire on every publish. URL Submission asks
Bing to *fetch*: quota-limited (100/day, 1900/month) because it costs them
something. Spend it on pages that actually need crawling.

## Response quirks that will burn you

1. **`/Date(-62135568000000-0800)/` is `DateTime.MinValue` = NEVER.** The epoch
   is **negative**, so a `\d+` regex misses it and the field reads as merely
   absent. This repo's `inspect` had exactly that bug. Combined with
   `DocumentSize: 0` it is the never-crawled fingerprint.
2. **`HttpStatus: 0` proves nothing** — it appears on successfully crawled
   pages here too. Only the date + size combination is diagnostic.
3. **`{"d":null}` is success** for every write method (`SubmitFeed`,
   `SubmitUrlBatch`, `FetchUrl`). No confirmation object exists. Verify by
   re-reading (`GetFeeds` after `SubmitFeed`) or by the quota receipt —
   `SubmitUrlBatch` of N URLs drops `DailyQuota` by exactly N.
4. **A feed whose `LastCrawled == Submitted` and never advances** was fetched
   once at submission and abandoned — while still showing `Status: Success`.
   Found here on 2026-08-13: the sitemap submitted Jul 29 22:16 had last-read
   Jul 29 22:16, fourteen days stale, looking healthy the whole time.
   `bun run bing feeds` flags this **only after 3 days** — a fresh
   resubmission always shows `LastCrawled == Submitted` and means nothing.
   Feed timestamps print in **UTC**.
5. **Sitemap fetch ≠ page crawl.** Feed activity is not indexing progress.

## Check crawl depth before blaming authority

**Run `bun run bing inspect --all` first.** Comparing depth-1 pages against
depth-2 pages is the single most informative diagnostic here, and it is invisible
if you inspect URLs one at a time. Observed 2026-08-13:

| Depth | Pages | Verdict |
|---|---|---|
| 1 | `/`, `/upcoming-events` | crawled, refreshed same day |
| 1 | `/get-involved`, `/newsletters` | **fetched but empty** |
| 2 | all 3 event permalinks, newsletter detail | **never crawled** |

That reframes the problem from "Bing ignores this site" — which it demonstrably
does not — to "Bing crawls the hubs and won't descend." Which yields a fix
inside our control: surface specific events at depth 1 so they sit on a page
Bing already crawls daily. Confirm the child links are real `<a href>` in
server HTML (`curl` the hub) before concluding anything about depth.

## Three verdicts, not two

`inspect` distinguishes:

- **crawled** — a crawl date and non-zero `DocumentSize`.
- **FETCHED BUT EMPTY** — a real crawl date but zero bytes retained. A distinct
  failure that reads as success if you only check the date. Found on
  `/get-involved` (Bing: 0 bytes, live page: 76 KB).
- **NEVER CRAWLED** — MinValue date and zero bytes.

## The ladder

```
discovered → crawled → indexed → served
```

Each gate is separate. Confirm with `GetUrlInfo`, not with `site:` searches — a
Bing bot-challenge page once got read here as an empty index and reported twice
as fact. **Verify that the measurement instrument worked before trusting its
reading.**

**New-domain probation is real:** weeks of "discovered but not crawled" for a
domain with no inbound links, every submission accepted, nothing fetched.
Submissions cannot end it. Time and a followable inbound link can.

## Escalation, in order

1. **All submission channels** — sitemap (`SubmitFeed`), `SubmitUrlBatch`,
   `FetchUrl`, IndexNow. Table stakes; fire them, then stop pressing.
   Re-submitting does not improve queue position — Bing's own dialog says so.
2. **One real inbound link** from a Bing-indexed page. This is the lever.
   Confirmed root cause here: Backlinks report reads **"No data available"**
   after every technical cause was eliminated with evidence. Must be a real
   `<a href>` in server HTML and **visible** — hidden or UA-cloaked links are
   spam signals that would endanger the domain. Check the linking page is in
   Bing's index (`site:` on Bing, not Google).
3. **Bing support** — BWT → Help & feedback, or bwtsupport@microsoft.com.
   Include property URL, verified status, sitemap status, URLs submitted,
   IndexNow validated, zero fetches since date, and that Google indexes it.
4. **Cloudflare Crawler Hints** — this site fronts Cloudflare; free toggle that
   pushes IndexNow-style hints from the edge.

## Site-specific facts

- Property: `https://valleypaa.org/` — apex, verified via the `msvalidate.01`
  meta tag in `apps/web/src/app/layout.tsx`. **Removing that tag un-verifies
  the property.**
- Cloudflare fronts the site but is **not** blocking crawlers — verified:
  0 mitigated, 0 suspicious, and Bingbot gets clean 200s.
- Cloudflare also serves a managed `robots.txt` when the origin 404s. Our
  `app/robots.ts` overrides it; re-check after any deploy that touches it.
- Slugs derive from event titles, so **renaming an event moves its URL** and
  costs whatever index position it had. Happened here to the one page Bing had
  indexed. Pinning slugs at first publish is an open fix.
- Site health is not the problem: pages serve 60–740 ms, prerendered, valid
  `Event`/`Organization`/`FAQPage` JSON-LD, self-canonicalised, sitemap valid.

## Rules of engagement

- **Every state description in this file has an expiry date.** Run
  `bun run bing inspect --all` before reporting status to anyone. A cold reader
  of an earlier draft nearly reported the site as frozen when both hubs had
  been re-crawled that morning. Prose here is a starting hypothesis, not data.
- **Quota counters are per-user and shared.** If `DailyQuota` is below 100,
  someone (or an earlier session) already spent it today. Check `bing quota`
  before assuming you have the full allowance.
- **Do not re-run diagnostics by hand daily.** State changes on Bing's clock.
- **Do not read `site:` results as data.** Use `bun run bing inspect`. If a
  scrape must be used, DuckDuckGo's HTML endpoint proxies Bing without
  CAPTCHAs — `html.duckduckgo.com/html/?q=site:valleypaa.org`.
- Prefer `--dry-run` before spending quota.
- Make timeline claims falsifiable: "crawl by <date> supports X; silence past
  <date> refutes it." Refuted is a result.
