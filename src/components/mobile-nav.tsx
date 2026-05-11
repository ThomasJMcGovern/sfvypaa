"use client"

import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { navItems, site } from "@/lib/site"

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            aria-label="Open navigation"
            className="border-white/20 bg-white/10 text-white hover:bg-white/20 md:hidden"
            size="icon"
            variant="outline"
          />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent
        className="border-white/10 bg-[#14120f] text-white"
        side="right"
      >
        <SheetHeader className="border-b border-white/10 px-5 py-5">
          <SheetTitle className="text-white">{site.name}</SheetTitle>
          <SheetDescription className="text-white/60">
            {site.fullName}
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col px-5 py-3">
          {navItems.map((item) => (
            <SheetClose
              key={item.key}
              className="border-b border-white/10 py-4 text-left text-lg font-semibold text-white transition hover:text-[#ffcf6b]"
              nativeButton={false}
              render={
                <a
                  href={item.href}
                  rel={item.external ? "noreferrer" : undefined}
                  target={item.external ? "_blank" : undefined}
                />
              }
            >
              {item.label}
            </SheetClose>
          ))}
        </nav>
        <div className="mt-auto p-5">
          <SheetClose
            className="inline-flex h-11 w-full items-center justify-center rounded-[8px] bg-[#ffcf6b] px-4 text-sm font-semibold text-[#191109] transition hover:bg-[#f3b83f]"
            nativeButton={false}
            render={<a href={site.links.getInvolved} />}
          >
            Get involved
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
