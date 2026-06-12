---
name: sfvypaa-ops
description: Use when working on the SFVYPAA monorepo — running dev servers or the Firestore/Auth emulator, creating/seeding content via the CLI, managing admin access/audit, deploying web or admin to Vercel, pushing to GitHub, or styling anything (the punk design system rules). Covers environments, security model, guardrails, and known gotchas.
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
gist-geo holds 4000/4400/4500/9099): **Firestore 8085, Storage 9199, Auth 9100, UI
http://localhost:4040**. Emulator data persists in `.firebase/emulator-data/`.
The `demo-sfvypaa` project ID is fully offline — emulator work cannot touch the
cloud. Emulator mode is **authoritative**: `getAdminApp()`/`getFirebaseProjectId()`
force `demo-sfvypaa` and ignore any real service-account creds present in the env
(needed so emulator-issued auth token audiences match).

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
bun run content clear-events --env dev  # delete all events (BLOCKED in prod)
bun run content list --env dev|prod
bun run content create-event --env dev --title "..." --date YYYY-MM-DD \
  --time "7:00 pm" --location "..." --summary "..." \
  [--cohosted] [--rsvp <url>] [--image <url>] [--publish]
bun run content list-admins --env dev|prod
bun run content add-owner --email you@gmail.com [--name "..."] --env dev|prod
bun run content remove-admin --email old@gmail.com --env dev|prod
```

Guardrails — do not bypass:
- `--env prod` **writes require `--force`** and an explicit user request naming prod.
- Never seed/clear-events in prod (blocked). Never run prod reads/writes unless asked.
- Event date label is derived from `--date`; status is draft unless `--publish`.
- Every write is auto-tagged with CLI provenance + audited — don't try to suppress it.

## Admin access, roles & audit (security model)

- **Per-person Google sign-in** (Firebase Auth) — NOT a shared password. Flow:
  Google → verify ID token (Admin SDK) → check email against the `admins`
  Firestore allowlist → mint a Firebase **session cookie**. Helpers live in
  `apps/admin/src/lib/admin-session.ts` (`requireAdmin`, `requireOwner`,
  `getCurrentAdmin`, `createAdminSession`, `clearAdminSession`). Every page and
  server action calls `requireAdmin()` — `proxy.ts` is only a lightweight cookie-
  presence redirect, not the authoritative gate (CVE-29927-proof).
- **Two roles:** `admin` (content CRUD/publish), `owner` (+ manage the allowlist
  on `/team`). `removeAdmin` revokes the user's refresh tokens immediately — the
  disgruntled-admin kill switch. Can't remove the last owner.
- **Audit:** every content + team mutation calls `recordAudit()` in
  `packages/content/src/audit.ts` → Firestore `audit_log` + an append-only sink
  (`SFVYPAA_AUDIT_WEBHOOK_URL`, Slack/Discord webhook) + a `[audit]` log line.
  Store writes also stamp `createdBy`/`updatedBy`/`updatedFrom`. Viewable at
  `/audit`. CLI writes carry `source: "cli"` + `cli:<user>@<host>` + git email.
- **Service-account key = the master key.** Whoever holds `FIREBASE_PRIVATE_KEY`
  can write prod directly (CLI), bypassing the gate. Key hygiene: keep it only in
  Vercel + trusted machines, never commit. **Rotate** in Firebase console →
  Project settings → Service accounts → generate new key, update Vercel env for
  both projects, delete the old key. `apps/admin/.env.local` (prod creds, pulled
  via `vercel env pull`) is gitignored — delete it from dev machines when idle.
- **Bootstrap / lockout escape hatch:** seed the first owner with
  `bun run content add-owner --email you@gmail.com --env prod --force`. Firebase
  console manual steps before first deploy: enable Google provider; add
  `admin.sfvypaa.org` + `localhost` to Authorized Domains; set
  `NEXT_PUBLIC_FIREBASE_*` envs.

## Dev server gotchas

- Ports 3000/3001 are usually held by gist-geo; use `-p 3002` (web) and
  `-p 3003` (admin): `cd apps/<app> && bunx next dev -p <port>` (add the
  emulator + auth env vars as needed). For the admin against emulators, the
  `dev:admin:emu` script sets `FIREBASE_AUTH_EMULATOR_HOST` +
  `NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST` + `NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-sfvypaa`.
- The public site has **no** password gate.
- If pages render unstyled (Times serif, no orange): stale Turbopack cache —
  `rm -rf apps/<app>/.next` and restart. The Admin SDK app is a singleton, so
  changes to `firebase.ts` need a full dev-server restart, not just HMR.

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
status), `socialPosts` (title, caption, instagramUrl, imageUrl?, postDate,
status), `settings/site` (showInstagramSocials). All content writes also stamp
`createdBy`/`updatedBy`/`updatedFrom`. Plus `admins` (allowlist: email doc-id,
name, role, addedBy/addedAt — via `admins.ts`) and `audit_log` (append-only
change history — via `audit.ts`). All writes go through `packages/content/src`
via the Admin SDK; Firestore/Storage rules deny all client access by design.
