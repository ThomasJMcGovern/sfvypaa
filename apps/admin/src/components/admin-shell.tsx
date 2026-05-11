import Link from "next/link";
import { CalendarDays, Home, Newspaper } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/newsletters", label: "Newsletters", icon: Newspaper },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#171310] text-white">
      <header className="border-b border-white/10 bg-[#171310]/95 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-[8px] border border-white/20 bg-white/10 text-sm font-black">
              SFV
            </span>
            <span>
              <span className="block text-base font-black">SFVYPAA Admin</span>
              <span className="text-xs font-medium text-white/55">
                Events and newsletters
              </span>
            </span>
          </Link>
          <nav className="flex flex-wrap gap-2" aria-label="Admin navigation">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Button
                  key={item.href}
                  nativeButton={false}
                  render={<Link href={item.href} />}
                  variant="outline"
                  className="h-10 rounded-[8px] border-white/20 bg-white/10 px-3 text-white hover:bg-white/20"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">{children}</div>
    </main>
  );
}
