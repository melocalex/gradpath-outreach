import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { cn } from 'cn'
import {
  PROVINCE_NAME,
  plain,
  plausibilityLabel,
  type Program,
  type Shortlist,
} from '@/lib/content'
import { Inline } from '@/components/rich-text'
import { DASH } from '@/lib/tracker'

const FALLBACK = [
  { code: 'A', text: 'there is an explicit written route (equivalency, exception or professional experience)' },
  { code: 'B', text: 'a qualifying year, a bridge, or "3-year may apply"' },
  { code: 'C', text: "needs a 4-year bachelor's. Listed because of Calgary/Alberta location or strong AI; it's a reach or a target for after you finish a degree." },
]

function definition(doc: Shortlist, code: string): string {
  return doc.definitions.find((item) => item.code === code)?.text ?? FALLBACK.find((item) => item.code === code)?.text ?? DASH
}

function programsFor(doc: Shortlist, code: string): string[] {
  return doc.programs.filter((program) => program.plausibility === code).map((program) => plain(program.name))
}

export function Chance({ doc, error }: { doc: Shortlist | null; error: string | null }) {
  const [open, setOpen] = useState<string | null>(null)
  if (!doc && error) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <SectionHeading id="chance" index="06 · Chance" title="Leitura de chance" />
        <p className="mt-4 text-sm text-muted-foreground">{error}</p>
      </section>
    )
  }
  if (!doc) return null

  const dated = doc.programs.filter((program) => program.deadline && !/not confirmed/i.test(program.deadline))
  const cards = [
    {
      code: 'A',
      title: 'Caminho escrito',
      examples: programsFor(doc, 'A'),
      note: programsFor(doc, 'A/B').length ? 'A/B fica na tabela: experiência pode contar, e a admissão condicional é rara.' : null,
    },
    {
      code: 'B',
      title: 'Possível com exceção',
      examples: programsFor(doc, 'B'),
      note: null,
    },
    {
      code: 'C',
      title: 'Tiro longo',
      examples: programsFor(doc, 'C'),
      note: 'Calgary entra aqui no MSc e no MEng. O encaixe de pesquisa pode ser forte. A regra do diploma, não.',
    },
  ]

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <SectionHeading
        id="chance"
        index="06 · Chance"
        title="Leitura de chance"
        lede="Régua do shortlist para um Tecnólogo brasileiro, não uma nota por professor. O tracker só mostra chance quando o campo existe."
      />
      {doc.researched ? (
        <p className="mt-3 font-mono text-xs text-muted-foreground">Pesquisa de {doc.researched}</p>
      ) : null}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.code} className="rounded-xl border border-border bg-card/40 p-4">
            <p className="font-mono text-[11px] text-primary">{card.code}</p>
            <h3 className="mt-2 font-serif text-2xl tracking-tight">{card.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <Inline text={definition(doc, card.code)} />
            </p>
            {card.examples.length > 0 ? (
              <ul className="mt-3 grid gap-1 text-xs">
                {card.examples.slice(0, 3).map((name) => (
                  <li key={name} className="line-clamp-2">
                    {name}
                  </li>
                ))}
              </ul>
            ) : null}
            {card.note ? <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{card.note}</p> : null}
          </article>
        ))}
        <article className="rounded-xl border border-primary/35 bg-primary/5 p-4">
          <p className="font-mono text-[11px] text-primary">Ponte</p>
          <h3 className="mt-2 font-serif text-2xl tracking-tight">SAIT / Athabasca</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Não é mestrado. São caminhos para um diploma aceito, um bachelor's ou um emprego em Calgary.
          </p>
          <ul className="mt-3 grid gap-1 text-xs">
            {doc.pathways.map((pathway) => (
              <li key={pathway.name} className="line-clamp-2">
                {plain(pathway.name)}
              </li>
            ))}
          </ul>
        </article>
      </div>

      {dated.length > 0 ? (
        <div className="mt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Prazos como estão no shortlist
          </p>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-2">
            {dated.map((program) => (
              <article key={`${program.rank}-${program.name}`} className="w-64 shrink-0 rounded-xl border border-border bg-card/30 p-3">
                <p className="font-mono text-[10px] text-muted-foreground" title={PROVINCE_NAME[program.province] ?? program.province}>
                  {program.province || DASH} · {plausibilityLabel(program.plausibility)}
                </p>
                <p className="mt-2 line-clamp-3 text-sm">{plain(program.name)}</p>
                <p className="mt-2 text-xs leading-relaxed text-primary">{plain(program.deadline)}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {doc.top.length > 0 ? (
        <div className="mt-8">
          <h3 className="font-serif text-2xl tracking-tight">Oito primeiros do shortlist</h3>
          <ol className="mt-4 grid gap-2">
            {doc.top.map((item, index) => (
              <li key={item} className="grid grid-cols-[2rem_1fr] gap-3 text-sm leading-relaxed">
                <span className="font-serif text-lg text-primary">{index + 1}</span>
                <span>
                  <Inline text={item} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="mt-8">
        <h3 className="font-serif text-2xl tracking-tight">Programas do shortlist</h3>
        <ul className="mt-4 overflow-hidden rounded-xl border border-border">
          {doc.programs.map((program) => (
            <ProgramRow
              key={`${program.rank}-${program.name}`}
              program={program}
              open={open === program.rank}
              onToggle={() => setOpen((current) => (current === program.rank ? null : program.rank))}
            />
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="font-serif text-2xl tracking-tight">Pontes, não mestrado</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {doc.pathways.map((pathway) => (
            <article key={pathway.name} className="rounded-xl border border-border bg-card/30 p-4">
              <h4 className="font-medium">
                <Inline text={pathway.name} />
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">{plain(pathway.where)}</p>
              <p className="mt-3 text-sm leading-relaxed">
                <Inline text={pathway.fit} />
              </p>
              <p className="mt-3 text-xs text-muted-foreground">{plain(pathway.contact) || DASH}</p>
              <p className="mt-2 text-xs leading-relaxed">{plain(pathway.deadline) || DASH}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                {pathway.links.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="underline decoration-primary/50 underline-offset-2">
                    {link.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      {doc.reference ? (
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          <Inline text={doc.reference} />
        </p>
      ) : null}
    </section>
  )
}

function ProgramRow({ program, open, onToggle }: { program: Program; open: boolean; onToggle: () => void }) {
  return (
    <li className="border-t border-border first:border-t-0">
      <button type="button" onClick={onToggle} aria-expanded={open} className="grid w-full gap-2 px-4 py-3 text-left hover:bg-muted/30 md:grid-cols-[2.5rem_1fr_4rem_9rem_auto] md:items-center">
        <span className="font-mono text-xs text-muted-foreground">{program.rank || DASH}</span>
        <span className="text-sm">{plain(program.name) || DASH}</span>
        <span className="font-mono text-xs" title={PROVINCE_NAME[program.province] ?? undefined}>
          {program.province || DASH}
        </span>
        <span className="text-xs text-primary">{program.plausibility ? `${program.plausibility} · ${plausibilityLabel(program.plausibility)}` : DASH}</span>
        <span className="flex items-center justify-between gap-3 text-xs text-muted-foreground md:justify-end">
          <span className="line-clamp-2 md:max-w-48">{plain(program.deadline) || DASH}</span>
          <ChevronDown className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')} />
        </span>
      </button>
      {open ? (
        <div className="grid gap-3 border-t border-border px-4 py-4 text-sm leading-relaxed md:grid-cols-2">
          <p>
            <Inline text={program.why || DASH} />
          </p>
          <div className="grid gap-2 text-xs">
            <p>
              <span className="font-mono uppercase tracking-[0.14em] text-muted-foreground">Contato · </span>
              {plain(program.contact) || DASH}
            </p>
            <p>
              <span className="font-mono uppercase tracking-[0.14em] text-muted-foreground">Custo · </span>
              <Inline text={program.tuition || DASH} />
            </p>
            <div className="flex flex-wrap gap-3">
              {program.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="underline decoration-primary/50 underline-offset-2">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </li>
  )
}
