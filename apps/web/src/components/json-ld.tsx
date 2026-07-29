/**
 * Renders a schema.org JSON-LD block.
 *
 * The `<` escape is load-bearing, not cosmetic: event titles, descriptions, and
 * locations all come from Firestore via the admin console, and JSON.stringify
 * alone does not escape a literal `</script>` inside a string. This is the form
 * the Next.js docs prescribe — there is no metadata.jsonLd API, and next/script
 * is explicitly not recommended for this.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
