type PageHeadProps = {
  eyebrow: string
  title: React.ReactNode
  sub?: string
}

export function PageHead({ eyebrow, title, sub }: PageHeadProps) {
  return (
    <section className="border-b-[5px] border-border bg-secondary">
      <div className="mx-auto w-full max-w-7xl px-5 pt-12 pb-10 sm:px-8 lg:px-10">
        <p className="label-stamp mb-3.5 flex items-center gap-2 text-orange">
          <span className="text-[1.1em]">★</span> {eyebrow}
        </p>
        <h1 className="max-w-[14ch] text-[clamp(2.75rem,6vw,4.5rem)] text-foreground">
          {title}
        </h1>
        {sub ? (
          <p className="mt-4.5 max-w-[52ch] text-lg leading-normal font-medium text-text-soft">
            {sub}
          </p>
        ) : null}
      </div>
    </section>
  )
}
