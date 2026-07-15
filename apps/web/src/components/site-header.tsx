import { getSiteSettings } from "@valleypaa/content"

import { SiteHeaderNav } from "@/components/site-header-nav"
import { navItems } from "@/lib/site"

type SiteHeaderProps = {
  active:
    | "home"
    | "get-involved"
    | "upcoming-events"
    | "newsletters"
    | "daily-reflection"
}

// Server wrapper: resolves the Daily Reflection toggle and drops that nav item
// when it's off, then hands the visible items to the interactive client nav.
export async function SiteHeader({ active }: SiteHeaderProps) {
  const settings = await getSiteSettings()
  const items = settings.showDailyReflection
    ? navItems
    : navItems.filter((item) => item.key !== "daily-reflection")

  return <SiteHeaderNav active={active} navItems={items} />
}
