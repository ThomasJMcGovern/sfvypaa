#!/usr/bin/env bun
/**
 * SFVYPAA content CLI — create and inspect content in either environment.
 *
 *   bun run content <command> --env dev|prod [options]
 *
 * Commands:
 *   list                       List all events with status
 *   seed                       Seed sample content (dev/emulator only)
 *   create-event               Create an event
 *     --title <t> --date <YYYY-MM-DD> --time <t> --location <l> --summary <s>
 *     [--cohosted] [--rsvp <url>] [--image <url>] [--publish]
 *
 * Environments:
 *   --env dev    Local Firestore emulator (run `bun run emulators` first).
 *                Uses the offline demo-sfvypaa project — cannot touch the cloud.
 *   --env prod   Real Firestore via creds in apps/admin/.env.local.
 *                Writes additionally require --force.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    env: { type: "string" },
    title: { type: "string" },
    date: { type: "string" },
    time: { type: "string" },
    location: { type: "string" },
    summary: { type: "string" },
    rsvp: { type: "string", default: "" },
    image: { type: "string", default: "" },
    cohosted: { type: "boolean", default: false },
    publish: { type: "boolean", default: false },
    force: { type: "boolean", default: false },
  },
});

const command = positionals[0];
const env = args.env;

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

if (!command || !["list", "seed", "create-event"].includes(command)) {
  fail(
    "Usage: bun run content <list|seed|create-event> --env dev|prod [options]",
  );
}

if (env !== "dev" && env !== "prod") {
  fail("Pass --env dev (emulator) or --env prod (live Firestore).");
}

const isWrite = command !== "list";

/* ---- environment wiring (must happen before importing the content pkg) ---- */

if (env === "dev") {
  // offline demo project — physically cannot reach the cloud
  delete process.env.FIREBASE_PROJECT_ID;
  delete process.env.FIREBASE_CLIENT_EMAIL;
  delete process.env.FIREBASE_PRIVATE_KEY;
  delete process.env.FIREBASE_STORAGE_BUCKET;
  process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8085";
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= "127.0.0.1:9199";

  try {
    await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/`);
  } catch {
    fail(
      `Firestore emulator is not running at ${process.env.FIRESTORE_EMULATOR_HOST}. Start it with: bun run emulators`,
    );
  }
} else {
  delete process.env.FIRESTORE_EMULATOR_HOST;
  delete process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  loadProdEnv();

  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    fail(
      "Production credentials not found. Put FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in apps/admin/.env.local.",
    );
  }

  if (command === "seed") {
    fail("Seeding sample data into production is blocked.");
  }

  if (isWrite && !args.force) {
    fail(
      `This would WRITE to the production database (${process.env.FIREBASE_PROJECT_ID}). Re-run with --force if you mean it.`,
    );
  }
}

function loadProdEnv() {
  const candidates = [
    join(import.meta.dir, "..", "apps", "admin", ".env.local"),
    join(import.meta.dir, "..", "apps", "web", ".env.local"),
    join(import.meta.dir, "..", ".env.local"),
  ];

  for (const file of candidates) {
    if (!existsSync(file)) {
      continue;
    }

    for (const line of readFileSync(file, "utf8").split("\n")) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);

      if (!match) {
        continue;
      }

      const [, key, raw] = match;
      const value = raw.replace(/^["']|["']$/g, "");

      process.env[key] ||= value;
    }
  }
}

/* ---- content package loads only after the env is locked in ---- */

const content = await import("../packages/content/src/index.ts");

const banner =
  env === "dev"
    ? "env: dev (emulator · demo-sfvypaa)"
    : `env: PROD (${process.env.FIREBASE_PROJECT_ID})`;
console.log(`★ SFVYPAA content CLI — ${banner}`);

function dateLabel(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);

  if (!match) {
    fail(`--date must be YYYY-MM-DD (got "${iso}")`);
  }

  const [, year, month, day] = match;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, Number(day)));
}

async function createEvent(input: {
  title: string;
  date: string;
  time: string;
  location: string;
  summary: string;
  rsvp?: string;
  image?: string;
  cohosted?: boolean;
  publish?: boolean;
}) {
  const id = await content.saveEvent({
    title: input.title,
    eventDate: input.date,
    date: dateLabel(input.date),
    time: input.time,
    location: input.location,
    tone: input.summary,
    host: input.cohosted ? "Co-hosted by SFVYPAA" : "Hosted by SFVYPAA",
    status: input.publish ? "published" : "draft",
    sortDate: "",
    rsvpUrl: input.rsvp ?? "",
    imageUrl: input.image ?? "",
  });

  console.log(
    `✓ ${input.publish ? "Published" : "Drafted"} event "${input.title}" (${id})`,
  );
  return id;
}

if (command === "list") {
  const events = await content.listEvents();

  if (events.length === 0) {
    console.log("No events.");
  }

  for (const event of events) {
    console.log(
      `${event.status === "published" ? "●" : "○"} [${event.status}] ${event.date || event.eventDate} · ${event.title} · ${event.location} (${event.id})`,
    );
  }
} else if (command === "create-event") {
  for (const key of ["title", "date", "time", "location", "summary"] as const) {
    if (!args[key]) {
      fail(`--${key} is required for create-event`);
    }
  }

  await createEvent({
    title: args.title!,
    date: args.date!,
    time: args.time!,
    location: args.location!,
    summary: args.summary!,
    rsvp: args.rsvp,
    image: args.image,
    cohosted: args.cohosted,
    publish: args.publish,
  });
} else if (command === "seed") {
  console.log("Seeding sample content into the emulator…");

  await createEvent({
    title: "Backyard BBQ + Speaker Jam",
    date: "2026-06-21",
    time: "4:00 – 9:00 pm",
    location: "Tujunga backyard · address on RSVP",
    summary:
      "Burgers, dogs, a flatbed-truck speaker stage, and a raffle for a year of bad gas-station coffee. Bring a lawn chair.",
    rsvp: "https://example.com/rsvp",
    publish: true,
  });
  await createEvent({
    title: "Newcomer Night",
    date: "2026-06-25",
    time: "7:00 pm",
    location: "Canoga Park Alano Club",
    summary:
      "First time? This one's for you. No talking required — we'll save you a seat and a bad cup of coffee.",
    rsvp: "https://example.com/rsvp",
    publish: true,
  });
  await createEvent({
    title: "Valley-Wide Unity Dance",
    date: "2026-07-11",
    time: "8:00 pm – midnight",
    location: "Reseda Community Hall · 18255 Victory Blvd",
    summary:
      "Four committees, one floor, a DJ who only plays requests. Sober dance, raffle, and a midnight cake-cut for July sobriety birthdays.",
    cohosted: true,
    publish: true,
  });
  await createEvent({
    title: "Sunrise Sober Hike",
    date: "2026-07-19",
    time: "6:30 am",
    location: "Stough Canyon trailhead · Burbank",
    summary:
      "Easy three-miler, coffee at the top, a short speaker on the rocks. We carpool from the Canoga Park lot at 5:45.",
    cohosted: true,
  });

  const newsletterId = await content.saveNewsletter({
    title: "Summer Is For Service",
    slug: "summer-is-for-service",
    excerpt:
      "BBQ logistics, two new service positions open, and why the back row is the most important seat in the house.",
    body: "We pulled the permit. The Backyard BBQ + Speaker Jam is on for Saturday, June 21st, and it is going to be loud in the best possible way.\n\nService is how this thing stays free, stays anonymous, and stays here. If you've got thirty days and a willingness, we have a job with your name on it.\n\nIf you're new, or coming back after a rough stretch, the back row is the most important seat in the house. Come early, get a coffee, sit wherever you want. We'll be glad you came.",
    publishDate: "2026-06-05",
    status: "published",
  });
  console.log(`✓ Published newsletter "Summer Is For Service" (${newsletterId})`);

  const socialId = await content.saveSocialPost({
    title: "New here? Start here.",
    caption:
      "You don't have to talk. You don't have to call yourself anything. Come early, grab a coffee, sit in the back. We saved you a seat.",
    instagramUrl: "https://www.instagram.com/sfvypaa/",
    imageUrl: "",
    postDate: "2026-05-28",
    status: "published",
  });
  console.log(`✓ Published social post "New here? Start here." (${socialId})`);

  await content.saveSiteSettings({ showInstagramSocials: true });
  console.log("✓ Site settings: Instagram socials shown");
  console.log("\nDone. Browse it at http://localhost:4040 (Emulator UI).");
}

process.exit(0);
