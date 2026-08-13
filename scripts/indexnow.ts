#!/usr/bin/env bun
/**
 * Submit valleypaa.org URLs to IndexNow (Bing, Yandex, Seznam, Naver).
 *
 *   bun run indexnow --all              # everything in the live sitemap
 *   bun run indexnow --events           # event permalinks + the events index
 *   bun run indexnow --url /path        # one or more paths/URLs (repeatable)
 *   bun run indexnow --all --dry-run    # show what would be sent
 *   bun run indexnow --verify-key       # check the hosted key file only
 *
 * Discovery only. IndexNow tells a search engine a URL exists or changed; it
 * does not make it crawl. On this site every URL was "discovered" the same day
 * and most still weren't crawled a week later — crawl budget follows inbound
 * links, not submissions. Re-submitting an unchanged URL achieves nothing.
 *
 * The key lives in apps/web/public/<key>.txt and is discovered from there, so
 * there is no secret to configure — the key file is public by design.
 */

import { readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    all: { type: "boolean", default: false },
    events: { type: "boolean", default: false },
    url: { type: "string", multiple: true, default: [] },
    "dry-run": { type: "boolean", default: false },
    "verify-key": { type: "boolean", default: false },
    host: { type: "string", default: "valleypaa.org" },
  },
});

const HOST = args.host;
const ORIGIN = `https://${HOST}`;
const PUBLIC_DIR = join(import.meta.dir, "..", "apps", "web", "public");

// api.indexnow.org fans out to every participating engine, so one POST is
// enough. bing.com/indexnow is kept as a fallback for when the shared
// endpoint is unreachable.
const ENDPOINTS = [
  "https://api.indexnow.org/IndexNow",
  "https://www.bing.com/indexnow",
];

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

/** The key file is committed to public/, so the repo is the source of truth. */
function findKey(): string {
  const candidates = readdirSync(PUBLIC_DIR)
    .filter((name) => /^[A-Za-z0-9-]{8,128}\.txt$/.test(name))
    .map((name) => basename(name, ".txt"));

  if (candidates.length === 0) {
    fail(
      `No IndexNow key file in apps/web/public/.\n` +
        `  Create one: openssl rand -hex 16 | tee apps/web/public/$(openssl rand -hex 16).txt`,
    );
  }

  if (candidates.length > 1) {
    fail(`Multiple key files found: ${candidates.join(", ")}. Leave exactly one.`);
  }

  return candidates[0];
}

/**
 * Engines fetch the key file to prove ownership. If it 404s or the contents
 * drift from the filename, every submission comes back 403 — so check first
 * rather than reading failures off the wire.
 */
async function verifyKeyFile(key: string) {
  const url = `${ORIGIN}/${key}.txt`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

    if (!response.ok) {
      return { ok: false as const, url, detail: `HTTP ${response.status}` };
    }

    const body = (await response.text()).trim();

    if (body !== key) {
      return {
        ok: false as const,
        url,
        detail: `file contains ${JSON.stringify(body.slice(0, 40))}, expected the key itself`,
      };
    }

    return { ok: true as const, url };
  } catch (error) {
    return {
      ok: false as const,
      url,
      detail: error instanceof Error ? error.message : String(error),
    };
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
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

  if (urls.length === 0) {
    fail("Sitemap parsed but contained no <loc> entries.");
  }

  return urls;
}

function normalize(value: string): string {
  const url = value.startsWith("http") ? value : `${ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;

  // A 422 means a URL didn't match the host, so catch that here with a clearer message.
  if (!url.startsWith(`${ORIGIN}/`) && url !== ORIGIN) {
    fail(`${url} is not on ${HOST} — IndexNow rejects cross-host URLs (422).`);
  }

  return url;
}

async function submit(key: string, urlList: string[]) {
  const payload = {
    host: HOST,
    key,
    keyLocation: `${ORIGIN}/${key}.txt`,
    urlList,
  };

  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });

      const detail = (await response.text()).trim();
      const name = new URL(endpoint).host;

      // 200 = accepted and key validated. 202 = accepted, validation pending.
      if (response.status === 200 || response.status === 202) {
        console.log(`  ✓ ${name} → HTTP ${response.status}${detail ? ` ${detail}` : ""}`);
        return true;
      }

      const explanations: Record<number, string> = {
        400: "bad request — malformed JSON body",
        403: "key not valid — the hosted key file is missing or doesn't match",
        422: "URLs don't belong to this host, or the key doesn't match the schema",
        429: "rate limited — too many requests, back off before retrying",
      };

      console.error(
        `  ✗ ${name} → HTTP ${response.status}: ${explanations[response.status] ?? "unexpected"}` +
          `${detail ? `\n     ${detail.slice(0, 200)}` : ""}`,
      );
    } catch (error) {
      console.error(
        `  ✗ ${new URL(endpoint).host} unreachable: ` +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }

  return false;
}

/* ---------------------------------------------------------------- */

console.log("\n★ IndexNow submission\n");

const key = findKey();
console.log(`  key file: ${ORIGIN}/${key}.txt`);

const keyCheck = await verifyKeyFile(key);

if (!keyCheck.ok) {
  fail(
    `Hosted key file is not serving correctly — every submission would 403.\n` +
      `  ${keyCheck.url}: ${keyCheck.detail}`,
  );
}

console.log("  key file: ✓ serving and matches\n");

if (args["verify-key"]) {
  process.exit(0);
}

let urls: string[] = [];

if (args.all) {
  urls = await urlsFromSitemap();
} else if (args.events) {
  urls = (await urlsFromSitemap()).filter((url) => url.includes("/upcoming-events"));
} else if (args.url.length > 0) {
  urls = args.url.map(normalize);
} else {
  fail("Nothing to submit. Pass --all, --events, or --url <path>.");
}

urls = [...new Set(urls)];

console.log(`  ${urls.length} URL(s):`);
for (const url of urls) {
  console.log(`    ${url}`);
}
console.log();

if (args["dry-run"]) {
  console.log("  (dry run — nothing submitted)\n");
  process.exit(0);
}

const ok = await submit(key, urls);

console.log();

if (!ok) {
  fail("Submission failed at every endpoint.");
}

console.log("  Submitted. This is discovery, not crawl — check status in a day:");
console.log("    Bing Webmaster Tools → URL Inspection\n");
