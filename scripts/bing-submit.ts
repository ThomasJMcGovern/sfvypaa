#!/usr/bin/env bun
/**
 * Bing Webmaster URL Submission — a stronger signal than IndexNow.
 *
 *   bun run bing submit --all           # every URL in the live sitemap
 *   bun run bing submit --events        # event permalinks + the events index
 *   bun run bing submit --url /path     # specific paths (repeatable)
 *   bun run bing quota                  # remaining daily/monthly allowance
 *   bun run bing inspect --url /path    # index status for one URL
 *   bun run bing submitted              # what's been submitted recently
 *
 * Why this exists alongside scripts/indexnow.ts: IndexNow announces that a URL
 * exists or changed. This asks Bing to fetch it, and is quota-limited precisely
 * because it costs them something. On this site IndexNow reported every URL
 * discovered within a day and most still weren't crawled a week later, so the
 * two are not interchangeable — use IndexNow on every publish, and spend this
 * quota on pages you actually need crawled.
 *
 * Needs BING_WEBMASTER_API_KEY: bun run scripts/setup-bing-env.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    all: { type: "boolean", default: false },
    events: { type: "boolean", default: false },
    url: { type: "string", multiple: true, default: [] },
    "dry-run": { type: "boolean", default: false },
    host: { type: "string", default: "valleypaa.org" },
  },
});

const command = positionals[0] ?? "quota";
const HOST = args.host;
const ORIGIN = `https://${HOST}`;
const SITE_URL = `${ORIGIN}/`;
const API = "https://ssl.bing.com/webmaster/api.svc/json";

// Below this, "last read == submitted" just means the feed is new.
const STALE_FEED_DAYS = 3;

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function loadKey(): string {
  const fromEnv = process.env.BING_WEBMASTER_API_KEY;

  if (fromEnv) {
    return fromEnv;
  }

  for (const file of [
    join(import.meta.dir, "..", ".env.local"),
    join(import.meta.dir, "..", "apps", "admin", ".env.local"),
  ]) {
    if (!existsSync(file)) {
      continue;
    }

    for (const line of readFileSync(file, "utf8").split("\n")) {
      const match = /^\s*BING_WEBMASTER_API_KEY\s*=\s*(.*)\s*$/.exec(line);

      if (match) {
        return match[1].replace(/^["']|["']$/g, "");
      }
    }
  }

  fail(
    "BING_WEBMASTER_API_KEY not found.\n  Set it with: bun run scripts/setup-bing-env.ts",
  );
}

const KEY = loadKey();

async function call(method: string, params: Record<string, string> = {}, body?: unknown) {
  const query = new URLSearchParams({ apikey: KEY, ...params });
  const url = `${API}/${method}?${query}`;

  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json; charset=utf-8" } : {},
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });

  const text = await response.text();

  if (!response.ok) {
    // Bing returns its real complaint in the body; the status alone is useless.
    fail(`${method} failed — HTTP ${response.status}\n  ${text.slice(0, 300)}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function urlsFromSitemap(): Promise<string[]> {
  const response = await fetch(`${ORIGIN}/sitemap.xml`, {
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    fail(`Could not read ${ORIGIN}/sitemap.xml (HTTP ${response.status}).`);
  }

  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

function normalize(value: string): string {
  const url = value.startsWith("http")
    ? value
    : `${ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;

  if (!url.startsWith(ORIGIN)) {
    fail(`${url} is not on ${HOST} — Bing only accepts URLs for the verified site.`);
  }

  return url;
}

async function resolveUrls(): Promise<string[]> {
  if (args.all) {
    return urlsFromSitemap();
  }

  if (args.events) {
    return (await urlsFromSitemap()).filter((url) => url.includes("/upcoming-events"));
  }

  if (args.url.length > 0) {
    return args.url.map(normalize);
  }

  fail("Nothing to submit. Pass --all, --events, or --url <path>.");
}

/* ---------------------------------------------------------------- */

console.log("\n★ Bing Webmaster URL Submission\n");

if (command === "quota") {
  const result = await call("GetUrlSubmissionQuota", { siteUrl: SITE_URL });
  const { DailyQuota, MonthlyQuota } = result.d ?? {};

  console.log(`  site:    ${SITE_URL}`);
  console.log(`  daily:   ${DailyQuota} remaining`);
  console.log(`  monthly: ${MonthlyQuota} remaining\n`);
  process.exit(0);
}

if (command === "feeds") {
  const result = await call("GetFeeds", { siteUrl: SITE_URL });
  const feeds: Array<Record<string, unknown>> = result.d ?? [];

  if (feeds.length === 0) {
    console.log("  No sitemaps on file with Bing.\n");
    process.exit(0);
  }

  const stamp = (value: unknown) => {
    const match = /\/Date\((-?\d+)/.exec(String(value));

    if (!match) {
      return "—";
    }

    const ms = Number(match[1]);
    return ms < 0 ? "never" : new Date(ms).toISOString().slice(0, 16).replace("T", " ");
  };

  for (const feed of feeds) {
    const submitted = stamp(feed.Submitted);
    const crawled = stamp(feed.LastCrawled);

    const ageDays = (() => {
      const match = /\/Date\((-?\d+)/.exec(String(feed.LastCrawled));
      const ms = match ? Number(match[1]) : NaN;
      return Number.isFinite(ms) && ms > 0 ? (Date.now() - ms) / 86_400_000 : NaN;
    })();

    console.log(`  ${feed.Url}`);
    console.log(`    status:     ${feed.Status}`);
    console.log(`    submitted:  ${submitted} UTC`);
    console.log(`    last read:  ${crawled} UTC`);
    console.log(`    URLs found: ${feed.UrlsTotal ?? "—"}`);

    // A feed Bing fetched once at submission and never revisited hides behind
    // Status: Success. But "never revisited" only means something once enough
    // time has passed — otherwise this cries wolf on a fresh resubmission.
    if (submitted === crawled && submitted !== "—") {
      if (ageDays >= STALE_FEED_DAYS) {
        console.log(
          `    ⚠ read only at submission, ${Math.floor(ageDays)}d ago — Bing has not revisited this feed`,
        );
      } else {
        console.log(
          `    ↻ submitted ${ageDays < 1 ? "today" : `${Math.floor(ageDays)}d ago`}; too soon to judge (staleness flagged after ${STALE_FEED_DAYS}d)`,
        );
      }
    }

    console.log();
  }

  process.exit(0);
}

if (command === "fetch") {
  if (args.url.length === 0) {
    fail("Pass --url <path> to order a fetch.");
  }

  for (const url of args.url.map(normalize)) {
    // Write methods answer {"d":null} on success — there is no confirmation
    // object, so absence of an error is the only signal.
    await call("FetchUrl", {}, { siteUrl: SITE_URL, url });
    console.log(`  ✓ fetch ordered: ${url}`);
  }

  console.log("\n  Re-check with: bun run bing inspect --url <path>\n");
  process.exit(0);
}

if (command === "submitted") {
  const result = await call("GetUrlSubmissionQuota", { siteUrl: SITE_URL });
  console.log(`  daily remaining: ${result.d?.DailyQuota}`);

  const fetched = await call("GetFetchedUrls", { siteUrl: SITE_URL });
  const rows: unknown[] = fetched.d ?? [];

  console.log(`  recently fetched by Bing: ${rows.length}\n`);

  for (const row of rows.slice(0, 20) as Array<{ Url?: string }>) {
    console.log(`    ${row.Url ?? JSON.stringify(row).slice(0, 90)}`);
  }

  console.log();
  process.exit(0);
}

if (command === "inspect") {
  if (args.url.length === 0 && !args.all && !args.events) {
    fail("Pass --url <path>, or --all / --events to walk the sitemap.");
  }

  // Depth matters: Bing can crawl the hubs daily and never descend to detail
  // pages, so inspecting one URL at a time hides the pattern.
  const targets =
    args.url.length > 0 ? args.url.map(normalize) : await resolveUrls();

  for (const url of targets) {
    const result = await call("GetUrlInfo", { siteUrl: SITE_URL, url });
    const info = result.d;

    console.log(`  ${url}`);

    if (!info) {
      console.log("    no data — Bing has nothing on this URL\n");
      continue;
    }

    // Bing encodes "never" as DateTime.MinValue — /Date(-62135568000000-0800)/.
    // The epoch is negative, so a \d+ regex silently misses it and the field
    // reads as merely absent rather than as the never-crawled fingerprint.
    const stamp = (value: unknown) => {
      const match = /\/Date\((-?\d+)/.exec(String(value));

      if (!match) {
        return "—";
      }

      const ms = Number(match[1]);
      return ms < 0 ? "never" : new Date(ms).toISOString().slice(0, 10);
    };

    const size = Number(info.DocumentSize ?? 0);
    const crawled = stamp(info.LastCrawledDate);

    // Three states, not two. A crawl date with zero bytes is its own failure —
    // Bing visited and retained nothing — and calling that "crawled" hides the
    // problem behind a reassuring word. HttpStatus is 0 on healthy pages too,
    // so it plays no part here.
    const verdict =
      crawled === "never"
        ? "NEVER CRAWLED — Bing has zero bytes"
        : size === 0
          ? "FETCHED BUT EMPTY — Bing has a crawl date but retained zero bytes"
          : "crawled";

    console.log(`    verdict:         ${verdict}`);
    console.log(`    discovered:      ${stamp(info.DiscoveryDate)}`);
    console.log(`    last crawled:    ${crawled}`);
    console.log(`    document size:   ${size}`);
    console.log(`    anchors:         ${info.AnchorCount ?? 0}\n`);
  }

  process.exit(0);
}

if (command !== "submit") {
  fail(`Unknown command "${command}". Use: submit | quota | inspect | feeds | fetch | submitted`);
}

const urls = [...new Set(await resolveUrls())];

if (urls.length === 0) {
  fail("No URLs matched.");
}

const quota = await call("GetUrlSubmissionQuota", { siteUrl: SITE_URL });
const daily: number = quota.d?.DailyQuota ?? 0;

console.log(`  quota:  ${daily} daily remaining`);
console.log(`  submit: ${urls.length} URL(s)\n`);

for (const url of urls) {
  console.log(`    ${url}`);
}

console.log();

if (urls.length > daily) {
  fail(
    `Submitting ${urls.length} URLs would exceed the ${daily} remaining today.\n` +
      `  Narrow it with --events or --url, or wait for the daily reset.`,
  );
}

if (args["dry-run"]) {
  console.log("  (dry run — nothing submitted)\n");
  process.exit(0);
}

// SubmitUrlBatch takes the whole list in one call, so partial failure isn't a
// concern the way it would be with a per-URL loop.
await call("SubmitUrlBatch", {}, { siteUrl: SITE_URL, urlList: urls });

const after = await call("GetUrlSubmissionQuota", { siteUrl: SITE_URL });
const remaining: number = after.d?.DailyQuota ?? daily;

console.log(`  ✓ submitted ${urls.length} URL(s)`);
console.log(`  quota: ${daily} → ${remaining} daily remaining\n`);
console.log("  Bing fetches on its own schedule. Check in a day:");
console.log("    bun run bing inspect --url /upcoming-events\n");
