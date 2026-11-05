import { SectionHeading } from '@/components/section-heading'
import { Blocks, Inline } from '@/components/rich-text'
import { mdBlocks, splitSubject, type TemplateDoc } from '@/lib/content'

export function Templates({ doc, error }: { doc: TemplateDoc | null; error: string | null }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <SectionHeading
        id="modelos"
        index="07 · Modelos"
        title="Modelos de e-mail"
        lede="Referência em inglês para escrever. Não é o texto que saiu: o tracker não arquiva corpo."
      />
      {error ? <p className="mt-4 text-sm text-muted-foreground">{error}</p> : null}
      {doc ? (
        <div className="mt-6 grid max-w-3xl gap-5">
          <Blocks blocks={mdBlocks(doc.intro)} />
          {doc.sections.map((section) => {
            const { subject, rest } = splitSubject(section.body)
            return (
              <article key={section.title} className="rounded-xl border border-border bg-card/30">
                <header className="border-b border-border px-5 py-4">
                  <h3 className={section.level === 2 ? 'font-serif text-2xl tracking-tight' : 'font-serif text-xl tracking-tight'}>
                    {section.title}
                  </h3>
                </header>
                {subject ? (
                  <p className="border-b border-border px-5 py-3 font-mono text-xs leading-relaxed text-primary">
                    {subject}
                  </p>
                ) : null}
                <div className="px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap">
                  <Inline text={rest} />
                </div>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
