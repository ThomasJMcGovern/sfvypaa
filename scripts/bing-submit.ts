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
  if (args.url.length === 0) {
    fail("Pass --url <path> to inspect.");
  }

  for (const url of args.url.map(normalize)) {
    const result = await call("GetUrlInfo", { siteUrl: SITE_URL, url });
    const info = result.d;

    console.log(`  ${url}`);

    if (!info) {
      console.log("    no data — Bing has nothing on this URL\n");
      continue;
    }

    const stamp = (value: unknown) => {
      const match = /\/Date\((\d+)/.exec(String(value));
      return match ? new Date(Number(match[1])).toISOString().slice(0, 10) : "—";
    };

    console.log(`    discovered:      ${stamp(info.DiscoveryDate)}`);
    console.log(`    last crawled:    ${stamp(info.LastCrawledDate)}`);
    console.log(`    document size:   ${info.DocumentSize ?? "—"}`);
    console.log(`    HTTP status:     ${info.HttpStatus ?? "—"}`);
    console.log(`    total children:  ${info.TotalChildUrlCount ?? "—"}\n`);
  }

  process.exit(0);
}

if (command !== "submit") {
  fail(`Unknown command "${command}". Use: submit | quota | inspect | submitted`);
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
