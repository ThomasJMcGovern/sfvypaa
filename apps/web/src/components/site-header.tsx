"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Menu, X } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { navItems } from "@/lib/site"
import { cn } from "@/lib/utils"

type SiteHeaderProps = {
  active: "home" | "get-involved" | "upcoming-events" | "newsletters"
}

export function SiteHeader({ active }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-border bg-background">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-5 py-3 sm:px-8 lg:px-10">
        <Link
          aria-label="SFVYPAA home"
          className="flex shrink-0 items-center gap-2.5"
          href="/"
        >
          <Image
            alt="Punk Bill"
            className="h-9 w-9 object-contain dark:invert"
            height={38}
            src="/assets/punk-bill-ink.png"
            width={38}
          />
          <span className="font-display text-2xl leading-[0.9] tracking-[0.01em] text-foreground uppercase">
            SFVYPAA
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="ml-auto hidden items-center gap-5 lg:flex"
        >
          {navItems.map((item) => (
            <a
              className={cn(
                "inline-flex items-center gap-1 border-b-[3px] border-transparent px-0.5 py-2 text-[13px] font-extrabold tracking-[0.10em] text-foreground uppercase transition-colors hover:text-orange",
                active === item.key && "border-orange"
              )}
              href={item.href}
              key={item.key}
              rel={item.external ? "noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              {item.label}
              {item.external ? <ArrowUpRight className="size-3.5" /> : null}
            </a>
          ))}
        </nav>

        <div className="ml-auto lg:ml-1.5">
          <ThemeToggle />
        </div>

        <button
          aria-expanded={open}
          aria-label="Menu"
          className="inline-flex border-2 border-border p-2 text-foreground lg:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <nav
          aria-label="Mobile navigation"
          className="border-t-2 border-border bg-background lg:hidden"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col px-5 pt-2 pb-4 sm:px-8">
            {navItems.map((item) => (
              <a
                className={cn(
                  "inline-flex items-center gap-1.5 border-b border-border/35 py-3.5 text-[15px] font-extrabold tracking-[0.08em] uppercase",
                  active === item.key ? "text-orange" : "text-foreground"
                )}
                href={item.href}
                key={item.key}
                onClick={() => setOpen(false)}
                rel={item.external ? "noreferrer" : undefined}
                target={item.external ? "_blank" : undefined}
              >
                {item.label}
                {item.external ? <ArrowUpRight className="size-3.5" /> : null}
              </a>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  )
}
