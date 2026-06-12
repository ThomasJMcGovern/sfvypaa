# SFVYPAA

Premium site and admin portal for San Fernando Valley Young People in Alcoholics Anonymous.

## Stack

- Next.js 16 App Router
- React 19
- Bun
- Tailwind CSS 4
- shadcn/ui
- Firebase Admin SDK + Cloud Firestore

## Design System

The public site implements the **SFVYPAA design system** (DIY punk / photocopied zine,
authored in Claude Design): bone paper + near-black ink + safety orange, Anton poster
headlines, Public Sans body, JetBrains Mono for times and details, Permanent Marker for
decorative stamps only. Square corners, chunky ink borders, hard "stamp" shadows, and
grain/halftone/tape texture utilities live in `apps/web/src/app/globals.css`. Dark mode
("show poster at night") is toggled from the header and persisted in `localStorage`.
Punk Bill mascot knockouts live in `apps/web/public/assets/`.

Rules of the brand: headlines are ALL CAPS; meeting/event times, dates, and addresses
stay sentence-cased, high contrast, and often mono — never sacrifice legibility for
style. The admin portal intentionally stays utilitarian.

## Run Locally

```bash
bun install
bun run dev:web
```

Open `http://localhost:3000`.

For the admin portal:

```bash
export SFVYPAA_ADMIN_PASSWORD="your-password"
bun run dev:admin
```

Open `http://localhost:3001`.

## Useful Commands

```bash
bun run lint
bun run build
bun run build:web
bun run build:admin
```

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

- `SFVYPAA_ADMIN_PASSWORD`
- `SFVYPAA_REVALIDATE_SECRET`
- `SFVYPAA_PUBLIC_SITE_URL` (optional; defaults to `https://sfvypaa.org`)

The Storage bucket is used by the admin app for event image uploads.
The shared revalidation secret lets admin refresh public newsletter pages after publishing.

Firestore rules live in `firestore.rules` and currently deny client reads/writes.
Storage rules can stay locked down because admin uploads use the Admin SDK.

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

The public Vercel project is `sfvypaa`. The root `vercel.json` builds `apps/web`.

The admin Vercel project is `sfvypaa-admin`. Deploy it from the repo root with the admin config:

```bash
vercel link --yes --project sfvypaa-admin --scope tj-mcgoverns-projects
vercel pull --yes --environment=production --scope tj-mcgoverns-projects
vercel build --prod --scope tj-mcgoverns-projects --local-config vercel.admin.json
vercel deploy --prebuilt --prod --scope tj-mcgoverns-projects --local-config vercel.admin.json
```

`admin.sfvypaa.org` should point to Vercel with an `A` record for host `admin` and value `76.76.21.21`.
