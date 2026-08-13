#!/usr/bin/env bun
/**
 * Store the Bing Webmaster Tools API key in a gitignored env file.
 *
 *   bun run scripts/setup-bing-env.ts            # prompts, hidden input
 *   bun run scripts/setup-bing-env.ts --check    # report status, write nothing
 *   bun run scripts/setup-bing-env.ts --print    # show the masked key
 *
 * Writes BING_WEBMASTER_API_KEY to .env.local at the repo root — the same file
 * scripts/content-cli.ts already reads via loadProdEnv(), so any script picks it
 * up without extra wiring. `.gitignore` covers `.env*`, and this refuses to
 * write if that ever stops being true.
 *
 * Get a key: Bing Webmaster Tools → Settings → API access → API key.
 */

import { execSync } from "node:child_process";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    check: { type: "boolean", default: false },
    print: { type: "boolean", default: false },
    key: { type: "string" },
  },
});

const KEY_NAME = "BING_WEBMASTER_API_KEY";
const ROOT = join(import.meta.dir, "..");
const ENV_FILE = join(ROOT, ".env.local");

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function mask(value: string) {
  return value.length <= 8
    ? "*".repeat(value.length)
    : `${value.slice(0, 4)}${"*".repeat(value.length - 8)}${value.slice(-4)}`;
}

/**
 * Confirm git actually ignores the target file. Trusting a .gitignore line by
 * eye is how secrets get committed — ask git itself.
 */
function assertIgnored() {
  try {
    execSync(`git check-ignore -q "${ENV_FILE}"`, { cwd: ROOT, stdio: "ignore" });
  } catch {
    fail(
      `git does NOT ignore ${ENV_FILE}. Refusing to write a secret to a tracked path.\n` +
        `  Add ".env*" to .gitignore, then re-run.`,
    );
  }
}

function readEnvFile(): Map<string, string> {
  const entries = new Map<string, string>();

  if (!existsSync(ENV_FILE)) {
    return entries;
  }

  for (const line of readFileSync(ENV_FILE, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);

    if (match) {
      entries.set(match[1], match[2].replace(/^["']|["']$/g, ""));
    }
  }

  return entries;
}

/** Rewrites the key in place if present, appends otherwise — never reorders or drops other vars. */
function upsertKey(value: string) {
  const line = `${KEY_NAME}=${value}`;

  if (!existsSync(ENV_FILE)) {
    writeFileSync(ENV_FILE, `${line}\n`, { mode: 0o600 });
    return "created";
  }

  const original = readFileSync(ENV_FILE, "utf8");
  const pattern = new RegExp(`^\\s*${KEY_NAME}\\s*=.*$`, "m");
  const next = pattern.test(original)
    ? original.replace(pattern, line)
    : `${original.replace(/\n*$/, "\n")}${line}\n`;

  writeFileSync(ENV_FILE, next);
  chmodSync(ENV_FILE, 0o600);

  return pattern.test(original) ? "updated" : "appended";
}

async function promptHidden(question: string): Promise<string> {
  process.stdout.write(question);

  // Turn off terminal echo so the key never appears on screen or in scrollback.
  const restore = () => {
    try {
      execSync("stty echo", { stdio: "inherit" });
    } catch {
      /* not a TTY — nothing to restore */
    }
  };

  try {
    execSync("stty -echo", { stdio: "inherit" });
  } catch {
    console.log("\n  (terminal echo unavailable — input will be visible)");
  }

  try {
    for await (const chunk of Bun.stdin.stream()) {
      restore();
      process.stdout.write("\n");
      return new TextDecoder().decode(chunk).trim();
    }
  } finally {
    restore();
  }

  return "";
}

/** Cheapest authenticated call in the API — confirms the key works before we trust it. */
async function verifyKey(key: string) {
  const url =
    "https://ssl.bing.com/webmaster/api.svc/json/GetUserSites" +
    `?apikey=${encodeURIComponent(key)}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const body = await response.text();

    if (!response.ok) {
      return { ok: false as const, detail: `HTTP ${response.status}: ${body.slice(0, 160)}` };
    }

    const parsed = JSON.parse(body);
    const sites: string[] = (parsed?.d ?? [])
      .map((site: { Url?: string }) => site?.Url)
      .filter(Boolean);

    return { ok: true as const, sites };
  } catch (error) {
    return {
      ok: false as const,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

/* ---------------------------------------------------------------- */

console.log("\n★ Bing Webmaster API key setup\n");

assertIgnored();

const existing = readEnvFile().get(KEY_NAME);

if (args.check || args.print) {
  if (!existing) {
    console.log(`  ${KEY_NAME}: not set (${ENV_FILE})`);
    process.exit(1);
  }

  console.log(`  file:   ${ENV_FILE}`);
  console.log(`  ${KEY_NAME}: ${args.print ? mask(existing) : "set"}`);

  const result = await verifyKey(existing);

  if (result.ok) {
    console.log(`  status: valid — ${result.sites.length} site(s): ${result.sites.join(", ")}`);
  } else {
    console.log(`  status: REJECTED — ${result.detail}`);
    process.exit(1);
  }

  process.exit(0);
}

if (existing) {
  console.log(`  ${KEY_NAME} is already set (${mask(existing)}). Entering a new one replaces it.\n`);
}

const key = (args.key ?? (await promptHidden("  Paste your Bing Webmaster API key: "))).trim();

if (!key) {
  fail("No key entered — nothing written.");
}

if (!/^[A-Za-z0-9._-]{16,}$/.test(key)) {
  fail(
    "That doesn't look like a Bing API key (expected 16+ chars, alphanumeric with . _ -).\n" +
      "  Copy it from Bing Webmaster Tools → Settings → API access.",
  );
}

console.log("  Verifying against the Bing API…");

const result = await verifyKey(key);

if (!result.ok) {
  fail(`Bing rejected that key — not saving it.\n  ${result.detail}`);
}

const action = upsertKey(key);

console.log(`  ✓ valid — ${result.sites.length} site(s): ${result.sites.join(", ")}`);
console.log(`  ✓ ${action} ${KEY_NAME} in ${ENV_FILE} (chmod 600)`);
console.log(`  ✓ git ignores this file — confirmed with git check-ignore\n`);
console.log("  Use it:  bun run scripts/setup-bing-env.ts --check\n");
