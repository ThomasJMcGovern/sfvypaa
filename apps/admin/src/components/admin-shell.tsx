"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";

import { logoutAdminAction } from "@/app/actions";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", key: "dashboard" },
  { href: "/events", label: "Events", key: "events" },
  { href: "/newsletters", label: "Newsletters", key: "newsletters" },
  { href: "/social-posts", label: "Social Posts", key: "social-posts" },
  { href: "/settings", label: "Settings", key: "settings" },
];

type AdminSection =
  | "dashboard"
  | "events"
  | "newsletters"
  | "social-posts"
  | "settings";

export function AdminShell({
  active = "dashboard",
  publicSiteUrl,
  children,
}: {
  active?: AdminSection;
  publicSiteUrl: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b-[3px] border-border bg-background">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-5 py-3 sm:px-8">
          <Link
            aria-label="Admin dashboard"
            className="flex shrink-0 items-center gap-2.5"
            href="/"
          >
            <Image
              alt="Punk Bill"
              className="h-9 w-9 object-contain"
              height={36}
              src="/assets/punk-bill-ink.png"
              width={36}
            />
            <span className="font-display text-2xl leading-[0.9] text-foreground uppercase">
              SFVYPAA
            </span>
            <span className="border-2 border-ink bg-orange px-2 py-0.5 text-xs font-bold tracking-[0.14em] text-ink uppercase">
              Admin
            </span>
          </Link>

          <nav
            aria-label="Admin navigation"
            className="ml-3 hidden items-center gap-5 xl:flex"
          >
            {navItems.map((item) => (
              <Link
                className={cn(
                  "border-b-[3px] border-transparent px-0.5 py-2 text-[13px] font-extrabold tracking-[0.10em] uppercase transition-colors hover:text-foreground",
                  item.key === active
                    ? "border-orange text-foreground"
                    : "text-text-soft"
                )}
                href={item.href}
                key={item.key}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-2 xl:flex">
            <a
              className="inline-flex items-center gap-1.5 border-2 border-border px-2.5 py-1.5 font-mono text-xs font-bold tracking-wider text-foreground uppercase transition-colors hover:bg-foreground/10"
              href={publicSiteUrl}
              rel="noreferrer"
              target="_blank"
            >
              View site <ExternalLink className="size-3.5" />
            </a>
            <form action={logoutAdminAction}>
              <button
                className="inline-flex items-center gap-1.5 border-2 border-border px-2.5 py-1.5 font-mono text-xs font-bold tracking-wider text-foreground uppercase transition-colors hover:bg-foreground/10"
                type="submit"
              >
                <LogOut className="size-3.5" /> Log out
              </button>
            </form>
          </div>

          <button
            aria-expanded={open}
            aria-label="Menu"
            className="ml-auto inline-flex border-2 border-border p-2 text-foreground xl:hidden"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open ? (
          <nav
            aria-label="Admin mobile navigation"
            className="border-t-2 border-border bg-background xl:hidden"
          >
            <div className="mx-auto flex w-full max-w-7xl flex-col px-5 pt-2 pb-4 sm:px-8">
              {navItems.map((item) => (
                <Link
                  className={cn(
                    "border-b border-border/35 py-3.5 text-[15px] font-extrabold tracking-[0.08em] uppercase",
                    item.key === active ? "text-orange" : "text-foreground"
                  )}
                  href={item.href}
                  key={item.key}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <a
                className="inline-flex items-center gap-1.5 border-b border-border/35 py-3.5 text-[15px] font-extrabold tracking-[0.08em] text-foreground uppercase"
                href={publicSiteUrl}
                rel="noreferrer"
                target="_blank"
              >
                View site <ExternalLink className="size-3.5" />
              </a>
              <form action={logoutAdminAction}>
                <button
                  className="inline-flex items-center gap-1.5 py-3.5 text-[15px] font-extrabold tracking-[0.08em] text-foreground uppercase"
                  type="submit"
                >
                  <LogOut className="size-3.5" /> Log out
                </button>
              </form>
            </div>
          </nav>
        ) : null}
      </header>
      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        {children}
      </div>
    </main>
  );
}

export function AdminPageHead({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="label-stamp mb-3 flex items-center gap-2 text-orange">
            <span className="text-[1.1em]">★</span> {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[clamp(2.4rem,4.5vw,3.4rem)] text-foreground">
          {title}
        </h1>
        {sub ? (
          <p className="mt-3.5 max-w-[56ch] text-base leading-normal font-medium text-text-soft">
            {sub}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
