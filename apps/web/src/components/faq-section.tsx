import { JsonLd } from "@/components/json-ld"
import { faqPageJsonLd } from "@/lib/structured-data"

type Faq = { question: string; answer: string }

/**
 * Native <details>/<summary> rather than the @base-ui accordion: this puts
 * every answer in the initial server HTML with no JS. A client-side accordion
 * that mounts panels on expand would hide the answers from HTML-only crawlers,
 * which is the entire audience for this section. It also keeps the visible copy
 * and the FAQPage schema in sync — Google requires FAQPage content to be
 * visible on the page.
 */
export function FaqSection({
  faqs,
  eyebrow = "Common questions",
  title = "Questions people actually ask.",
  schema = false,
}: {
  faqs: Faq[]
  eyebrow?: string
  title?: string
  /**
   * Emit FAQPage JSON-LD. Only one page should set this — Google discourages
   * identical FAQPage markup across multiple URLs. The visible copy is still
   * worth rendering on every page that needs it, since LLM retrievers work off
   * rendered text rather than the schema.
   */
  schema?: boolean
}) {
  if (faqs.length === 0) {
    return null
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-5 pt-[72px] sm:px-8">
      {schema ? <JsonLd data={faqPageJsonLd(faqs)} /> : null}

      <p className="label-stamp mb-3 text-orange">{eyebrow}</p>
      <h2 className="mb-7 text-[clamp(2rem,4vw,3rem)] text-foreground">
        {title}
      </h2>

      <div className="flex flex-col gap-3">
        {faqs.map((faq) => (
          <details
            className="group border-[3px] border-border bg-card text-card-foreground shadow-stamp"
            key={faq.question}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-lg leading-snug font-bold text-foreground transition-colors hover:text-orange [&::-webkit-details-marker]:hidden">
              {faq.question}
              <span
                aria-hidden
                className="font-display shrink-0 text-2xl text-orange transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="border-t-2 border-border/35 px-5 py-4 text-[15px] leading-relaxed text-text-soft">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
