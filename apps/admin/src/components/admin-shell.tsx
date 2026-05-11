import Link from "next/link";
import {
  AtSign,
  CalendarDays,
  ExternalLink,
  Home,
  LogOut,
  Newspaper,
} from "lucide-react";

import { logoutAdminAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home, key: "dashboard" },
  { href: "/events", label: "Events", icon: CalendarDays, key: "events" },
  {
    href: "/newsletters",
    label: "Newsletters",
    icon: Newspaper,
    key: "newsletters",
  },
  {
    href: "/social-posts",
    label: "Social Posts",
    icon: AtSign,
    key: "social-posts",
  },
];

type AdminSection = "dashboard" | "events" | "newsletters" | "social-posts";

function publicSiteUrl() {
  return (process.env.SFVYPAA_PUBLIC_SITE_URL || "https://sfvypaa.org").replace(
    /\/+$/,
    "",
  );
}

export function AdminShell({
  active = "dashboard",
  children,
}: {
  active?: AdminSection;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#171310] text-white">
      <header className="border-b border-white/10 bg-[#171310]/95 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-[8px] border border-white/20 bg-white/10 text-sm font-black">
              SFV
            </span>
            <span>
              <span className="block text-base font-black">SFVYPAA Admin</span>
              <span className="text-xs font-medium text-white/55">
                Publishing console
              </span>
            </span>
          </Link>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <nav className="flex flex-wrap gap-2" aria-label="Admin navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.key === active;

                return (
                  <Button
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "h-10 rounded-[8px] border-white/20 px-3 text-white hover:bg-white/20",
                      isActive ? "bg-white/20" : "bg-white/10",
                    )}
                    key={item.href}
                    nativeButton={false}
                    render={<Link href={item.href} />}
                    variant="outline"
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
            <div className="flex flex-wrap gap-2">
              <Button
                className="h-10 rounded-[8px] border-white/20 bg-transparent px-3 text-white hover:bg-white/10"
                nativeButton={false}
                render={
                  <a href={publicSiteUrl()} rel="noreferrer" target="_blank" />
                }
                variant="outline"
              >
                Public site
                <ExternalLink className="size-4" />
              </Button>
              <form action={logoutAdminAction}>
                <Button
                  className="h-10 rounded-[8px] border-white/20 bg-transparent px-3 text-white hover:bg-white/10"
                  type="submit"
                  variant="outline"
                >
                  <LogOut className="size-4" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">{children}</div>
    </main>
  );
}
