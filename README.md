# VALLEYPAA

Premium site and admin portal for Valley Young People in Alcoholics Anonymous.

## Stack

- Next.js 16 App Router
- React 19
- Bun
- Tailwind CSS 4
- shadcn/ui
- Firebase Admin SDK + Cloud Firestore

## Design System

The public site implements the **VALLEYPAA design system** (DIY punk / photocopied zine,
authored in Claude Design): bone paper + near-black ink + safety orange, Anton poster
headlines, Public Sans body, JetBrains Mono for times and details, Permanent Marker for
decorative stamps only. Square corners, chunky ink borders, hard "stamp" shadows, and
grain/halftone/tape texture utilities live in `apps/web/src/app/globals.css`. Dark mode
("show poster at night") is toggled from the header and persisted in `localStorage`.
Punk Bill mascot knockouts live in `apps/web/public/assets/`.

Rules of the brand: headlines are ALL CAPS; meeting/event times, dates, and addresses
stay sentence-cased, high contrast, and often mono — never sacrifice legibility for
style. Both apps share the treatment; the admin keeps data calm and mono.

## Admin access & audit

The admin console is gated by **per-person Google sign-in** (Firebase Auth), not a
shared password. Sign-in flow: Google → verify the account against the `admins`
allowlist in Firestore → mint a session cookie. Two roles: `admin` (full content
CRUD/publish) and `owner` (that, plus managing the allowlist on the **Team** page).
Removing someone revokes their session immediately.

Every content and team change is recorded in the `audit_log` Firestore collection and
mirrored to an append-only external sink (`SFVYPAA_AUDIT_WEBHOOK_URL`, a Slack/Discord
incoming webhook) plus a structured `[audit]` runtime-log line. The **Audit** page shows
the latest 100. CLI/Claude-Code writes are tagged with provenance
(`cli:<os-user>@<host>` + git email) so scripted changes are traceable and visibly
distinct from admin-UI changes.

> **Service-account key is the master key.** Whoever holds `FIREBASE_PRIVATE_KEY` can
> write prod directly via the CLI, bypassing the admin gate. Keep it only in Vercel and
> on trusted machines; never commit it. **Rotate it** in the Firebase console
> (Project settings → Service accounts → generate new key) if it has been exposed, then
> update the Vercel env for both projects and delete the old key.

## Run Locally

```bash
bun install
bun run dev:web
```

Open `http://localhost:3000`.

For the admin portal (needs the Firebase Auth emulator + an owner seeded):

```bash
bun run emulators                                  # includes the Auth emulator
bun run content add-owner --email you@gmail.com --env dev
bun run dev:admin:emu                              # admin against the emulators
```

Open `http://localhost:3001` and sign in with Google (the Auth emulator lets you add a
test account; use the email you seeded). Plain `bun run dev:admin` points at whatever
Firebase env vars are set — i.e. **production** if `apps/admin/.env.local` holds prod
creds — so use `dev:admin:emu` for safe local work.

## Useful Commands

```bash
bun run lint
bun run build
bun run build:web
bun run build:admin
```

## Environments (dev emulator vs prod)

There are two content environments:

- **dev** — the local Firebase emulator suite (Firestore `127.0.0.1:8085`, Storage
  `127.0.0.1:9199`, UI at `http://localhost:4040`). It uses the offline `demo-valleypaa`
  project, needs no credentials, and cannot touch the cloud. Data persists between runs
  in `.firebase/emulator-data/`.
- **prod** — the live `sfvypaa-5a987` Firebase project via service-account env vars.

The emulator suite (Firestore 8085, Storage 9199, Auth 9100, UI 4040) runs on the
offline `demo-valleypaa` project and cannot touch the cloud.

```bash
bun run emulators        # start the emulator suite (needs JDK 21+, e.g. brew install openjdk)
bun run dev:web:emu      # public site against the emulators
bun run dev:admin:emu    # admin against the emulators (incl. the Auth emulator)
```

Plain `dev:web` / `dev:admin` use whatever Firebase env vars are set (i.e. prod creds
from `.env.local`, or nothing). Emulator mode is authoritative — it ignores any real
service-account creds that happen to be present and stays on `demo-valleypaa`.

### Content & admin CLI

Create and inspect content, and bootstrap the admin allowlist, from the terminal:

```bash
bun run content seed --env dev          # sample punk content into the emulator
bun run content clear-events --env dev  # delete all emulator events
bun run content list --env dev
bun run content create-event --env dev \
  --title "Newcomer Night" --date 2026-06-25 --time "7:00 pm" \
  --location "Canoga Park Alano Club" --summary "First time? This one's for you." \
  --publish                              # omit --publish to save a draft

bun run content create-social-post --env dev \
  --title "Beach bonfire" --caption "Sundown speaker, s'mores, the one LA beach where fires are legal." \
  --date 2026-06-08 --image "https://images.unsplash.com/photo-..." --publish
  # --image is required to publish; --instagram defaults to the @valleypaa profile

bun run content add-owner --email you@gmail.com --env dev    # seed/restore an owner
bun run content list-admins --env dev
bun run content remove-admin --email old@gmail.com --env dev
```

`--env prod` reads credentials from `apps/admin/.env.local`; **writes additionally
require `--force`**, and `seed`/`clear-events` are blocked in prod entirely. The first
production owner is bootstrapped with
`bun run content add-owner --email you@gmail.com --env prod --force` — this is also the
lockout escape hatch. Every CLI write is tagged with CLI provenance and audited.

## Firebase

The shared content package reads and writes Firestore and Storage through Firebase Admin SDK.
Set these environment variables in Vercel for both apps:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` or `FIREBASE_STORAGE_BUCKET`

The public app also uses:

- `SFVYPAA_REVALIDATE_SECRET`

The admin app also uses:

- `SFVYPAA_REVALIDATE_SECRET`
- `SFVYPAA_PUBLIC_SITE_URL` (optional; defaults to `https://valleypaa.org`)
- `SFVYPAA_AUDIT_WEBHOOK_URL` (optional; Slack/Discord incoming webhook for the
  append-only audit copy)
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
  `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — client config for Google sign-in (public values)

Before the admin can accept sign-ins, enable **Google** as a provider in the Firebase
console (Authentication → Sign-in method) and add `admin.valleypaa.org` + `localhost` to
the Authorized Domains list.

The Storage bucket is used by the admin app for event image uploads.
The shared revalidation secret lets admin refresh public newsletter pages after publishing.

Firestore and Storage rules (`firestore.rules`, `storage.rules`) deny all client
access — the `admins`, `audit_log`, and content collections are written only through the
Admin SDK behind the per-person admin gate.

## Launch Content

Static operational details are centralized in `apps/web/src/lib/site.ts`:

- meeting schedule
- Instagram link
- contact link
- image credits

Events and newsletters are published through the admin portal and loaded from Firestore.
The admin settings page controls whether the public homepage shows the curated Instagram Socials section.

## Routes

Public site (no password gate — publicly accessible):

- `/` homepage hub
- `/get-involved` committee and service page
- `/upcoming-events` hosted and co-hosted events page
- `/newsletters` published newsletters
- `LA YP Meetings` nav item opens the Los Angeles Central Office young people meeting search

Admin portal:

- `/access` password gate
- `/` dashboard
- `/events` event publisher
- `/newsletters` newsletter publisher

## Deploy

The public Vercel project is `valleypaa`. The root `vercel.json` builds `apps/web`.

The admin Vercel project is `valleypaa-admin`. Deploy it from the repo root with the admin config:

```bash
vercel link --yes --project valleypaa-admin --scope tj-mcgoverns-projects
vercel pull --yes --environment=production --scope tj-mcgoverns-projects
vercel build --prod --scope tj-mcgoverns-projects --local-config vercel.admin.json
vercel deploy --prebuilt --prod --scope tj-mcgoverns-projects --local-config vercel.admin.json
```

`admin.valleypaa.org` should point to Vercel with an `A` record for host `admin` and value `76.76.21.21`.
