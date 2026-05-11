import { imageCredits, site } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="bg-[#171310] px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <div className="text-3xl font-black">{site.name}</div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
            {site.fullName}. This independent landing page is prepared for
            committee launch content and should be updated with approved
            SFVYPAA links before public use.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/48">
            {imageCredits.map((credit) => (
              <a
                className="transition hover:text-white"
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
        <div className="flex flex-col gap-3 md:items-end">
          <a className="text-sm text-white/62 hover:text-white" href={site.links.contact}>
            {site.contactEmail}
          </a>
          <a className="text-sm text-white/62 hover:text-white" href="#top">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  )
}
