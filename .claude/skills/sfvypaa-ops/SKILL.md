---
name: sfvypaa-ops
description: Use when working on the SFVYPAA monorepo — running dev servers or the Firestore emulator, creating/seeding content via the CLI, deploying web or admin to Vercel, pushing to GitHub, or styling anything (the punk design system rules). Covers environments, guardrails, and known gotchas.
user-invocable: true
---

# SFVYPAA Operations

Monorepo for sfvypaa.org (San Fernando Valley Young People in AA): `apps/web`
(public site), `apps/admin` (publishing console), `packages/content` (shared
Firestore/Storage layer, Zod schemas). Bun workspaces, Next.js 16 App Router,
Tailwind 4. All commands run from the repo root.

## Environments

| | dev | prod |
|---|---|---|
| Database | Firebase emulator, offline project `demo-sfvypaa` | Firebase project `sfvypaa-5a987` |
| Credentials | none needed | `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` (+ `FIREBASE_STORAGE_BUCKET`) in `apps/admin/.env.local` |
| Selected by | `FIRESTORE_EMULATOR_HOST` env var being set | service-account env vars |

Emulator ports are non-default because this machine is busy (Docker holds 8080,
gist-geo holds 4000/4400/4500): **Firestore 8085, Storage 9199, UI
http://localhost:4040**. Emulator data persists in `.firebase/emulator-data/`.
The `demo-*` project ID is fully offline — emulator work cannot touch the cloud.

```bash
bun run emulators        # start emulator suite (JDK 21+ via brew openjdk, wired into the script's PATH)
bun run dev:web:emu      # public site against the emulator
bun run dev:admin:emu    # admin against the emulator
bun run dev:web          # plain dev — uses whatever Firebase env vars exist
```

## Content CLI ("create an event")

`scripts/content-cli.ts` uses the same store functions as the admin app:

```bash
bun run content seed --env dev          # sample punk content (BLOCKED in prod)
bun run content list --env dev|prod
bun run content create-event --env dev --title "..." --date YYYY-MM-DD \
  --time "7:00 pm" --location "..." --summary "..." \
  [--cohosted] [--rsvp <url>] [--image <url>] [--publish]
```

Guardrails — do not bypass:
- `--env prod` **writes require `--force`** and an explicit user request naming prod.
- Never seed prod. Never run prod reads/writes unless the user asked for prod.
- Event date label is derived from `--date`; status is draft unless `--publish`.

## Dev server gotchas

- Ports 3000/3001 are usually held by gist-geo; use `-p 3002` (web) and
  `-p 3003` (admin): `cd apps/<app> && bunx next dev -p <port>` (add the
  emulator + password env vars as needed).
- Admin requires `SFVYPAA_ADMIN_PASSWORD` (no default — unset means every
  login fails). The public site has **no** password gate.
- If pages render unstyled (Times serif, no orange): stale Turbopack cache —
  `rm -rf apps/<app>/.next` and restart.

## Design system (punk zine)

Source of truth is the "SFVYPAA Design System" project on claude.ai/design;
implement from exported handoff bundles, don't restyle from memory. Tokens
live in each app's `src/app/globals.css` (kept identical). Rules:

- Bone paper `#F2EDE1` + warm ink `#14110D` + safety orange `#FF4D14`
  (hot pink `#FF2E7E` secondary). Dark mode = "show poster at night",
  toggled via `.dark` class, persisted as `localStorage["sfv-theme"]`.
- Anton for headlines ONLY (ALL CAPS, leading ~0.92); Public Sans body;
  JetBrains Mono for every date/time/address/slug/hash; Permanent Marker
  (`.stamp`) decorative only — never for information.
- Square corners, chunky ink borders (2/3/5px), hard zero-blur stamp shadows
  (`shadow-stamp`, `shadow-stamp-lg`), press-flat button interactions.
  Textures: `.grain`, `.halftone`, `.torn-*`, `.tape` — sparingly.
- The grit lives in the FRAME: meeting/event details stay sentence-case,
  high-contrast, WCAG AA. No emoji; glyphs are ★ → ✕ ✱.
- Exactly two content statuses: Draft (amber) and Published (green).
- Both apps share the treatment; admin keeps data calm and mono.

## Verify before committing

```bash
bun run lint           # web + admin
bun run build:web
bun run build:admin
```

## Git & deploy

- Default git credentials are the wrong account; push with:
  `git -c credential.helper= -c credential.helper='!f() { echo "username=x-access-token"; echo "password=$(gh auth token -u ThomasJMcGovern)"; }; f' push origin main`
- **Public site** (`sfvypaa` Vercel project): deploys automatically on push
  to `main`.
- **Admin** (`sfvypaa-admin` project): manual CLI deploy from repo root —
  requires the user explicitly authorizing a production deploy:
  ```bash
  vercel link --yes --project sfvypaa-admin --scope tj-mcgoverns-projects
  vercel pull --yes --environment=production --scope tj-mcgoverns-projects
  vercel build --prod --scope tj-mcgoverns-projects --local-config vercel.admin.json
  vercel deploy --prebuilt --prod --scope tj-mcgoverns-projects --local-config vercel.admin.json
  ```
- Commit style: short imperative subject, body explaining what/why, trailer
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never commit
  `.env*`, `.firebase/`, or `apps/*/.claude/`.

## Data model (Firestore collections)

`events` (title, eventDate ISO, date label, time, location, tone=summary,
host: "Hosted by SFVYPAA" | "Co-hosted by SFVYPAA", status, rsvpUrl?,
imageUrl?), `newsletters` (title, slug, excerpt, body plain-text, publishDate,
status), `social-posts` (title, caption, instagramUrl, imageUrl?, postDate,
status), `settings` (showInstagramSocials). All writes go through
`packages/content/src/store.ts` via the Admin SDK; Firestore/Storage rules
deny all client access by design.
