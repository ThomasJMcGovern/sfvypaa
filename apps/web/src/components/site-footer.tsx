import { imageCredits, navItems, site } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="grain mt-[72px] bg-ink text-bone">
      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-9 px-5 pt-12 pb-8 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] sm:px-8 lg:px-10">
        <div>
          <div className="font-display text-[32px] leading-[0.9] uppercase">
            SFVYPAA
          </div>
          <p className="mt-3 mb-4 max-w-[28ch] text-sm leading-[1.55] text-[#C9C0AC]">
            Young people in AA across the San Fernando Valley. Since 1935.
            Still loud.
          </p>
          <span className="stamp -rotate-4 border-2 border-orange px-2 py-1 text-sm text-orange">
            you belong here
          </span>
        </div>
        <div>
          <p className="label-stamp mb-2.5 text-[#8A8472]">Get around</p>
          <div className="flex flex-col items-start gap-0.5">
            {navItems.map((item) => (
              <a
                className="py-1 text-sm font-semibold text-bone transition-colors hover:text-orange"
                href={item.href}
                key={item.key}
                rel={item.external ? "noreferrer" : undefined}
                target={item.external ? "_blank" : undefined}
              >
                → {item.label}
              </a>
            ))}
            <a
              className="py-1 text-sm font-semibold text-bone transition-colors hover:text-orange"
              href={site.links.instagram}
              rel="noreferrer"
              target="_blank"
            >
              → Instagram @sfvypaa
            </a>
          </div>
        </div>
        <div>
          <p className="label-stamp mb-2.5 text-[#8A8472]">Image credits</p>
          <div className="flex flex-col items-start">
            {imageCredits.map((credit) => (
              <a
                className="mb-1.5 font-mono text-xs leading-normal text-[#8A8472] transition-colors hover:text-bone"
                href={credit.href}
                key={credit.href}
                rel="noreferrer"
                target="_blank"
              >
                {credit.label}: {credit.credit}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t-2 border-ink-2 px-5 py-4 text-center">
        <span className="font-mono text-xs text-[#8A8472]">
          Not affiliated with AA World Services. A newcomer is the most
          important person in the room.
        </span>
      </div>
    </footer>
  )
}
