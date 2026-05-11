import Link from "next/link"
import { AtSign } from "lucide-react"

import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { navItems, site } from "@/lib/site"
import { cn } from "@/lib/utils"

type SiteHeaderProps = {
  active: "home" | "get-involved" | "upcoming-events"
}

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
      <Link className="flex items-center gap-3" href="/" aria-label="SFVYPAA home">
        <span className="flex size-10 items-center justify-center rounded-[8px] border border-white/20 bg-white/10 text-sm font-black tracking-tight text-white backdrop-blur">
          SFV
        </span>
        <span className="hidden text-sm font-semibold uppercase tracking-[0.22em] text-white/80 sm:block">
          {site.name}
        </span>
      </Link>
      <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a
            className={cn(
              "border-b border-transparent pb-1 text-sm font-medium text-white/75 transition hover:text-white",
              active === item.key && "border-white text-white"
            )}
            href={item.href}
            key={item.key}
            rel={item.external ? "noreferrer" : undefined}
            target={item.external ? "_blank" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        <Button
          className="h-10 rounded-[8px] border-white/20 bg-white/10 px-4 text-white hover:bg-white/20"
          nativeButton={false}
          render={<a href={site.links.instagram} />}
          variant="outline"
        >
          <AtSign />
          Instagram
        </Button>
      </div>
      <MobileNav />
    </header>
  )
}
