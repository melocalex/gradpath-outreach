import { cn } from 'cn'
import type { Filters, StatusFilter, Tallies, TrackerRow } from '@/lib/tracker'
import { formatStamp, latestStamp } from '@/lib/tracker'

function Mark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="text-primary">
      <path d="M9 1.4 16.6 9 9 16.6 1.4 9Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 5.2 12.8 9 9 12.8 5.2 9Z" fill="currentColor" />
    </svg>
  )
}

const NAV = [
  ['Alvos', '#alvos'],
  ['Formulários', '#formularios'],
  ['Espera', '#espera'],
  ['Ignorados', '#ignorados'],
  ['Chance', '#chance'],
  ['Modelos', '#modelos'],
] as const

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:h-14 md:flex-nowrap md:py-0">
        <a href="#topo" className="flex shrink-0 items-center gap-2 text-foreground">
          <Mark />
          <span className="font-serif text-lg tracking-tight">GradPath</span>
        </a>
        <nav className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-muted-foreground md:ml-auto">
          {NAV.map(([label, href]) => (
            <a key={href} href={href} className="shrink-0 rounded-full px-2.5 py-1 hover:bg-muted hover:text-foreground">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

type Stat = {
  key: StatusFilter
  value: number
  label: string
  hint: string
  anchor: string
}

export function Hero({
  rows,
  counts,
  filters,
  onStatus,
}: {
  rows: TrackerRow[]
  counts: Tallies
  filters: Filters
  onStatus: (status: StatusFilter, anchor: string) => void
}) {
  const updated = latestStamp(rows)
  const stats: Stat[] = [
    {
      key: 'sent',
      value: counts.sent,
      label: 'Enviados',
      hint: 'status sent',
      anchor: 'alvos',
    },
    {
      key: 'form_needed',
      value: counts.form_needed,
      label: 'Formulários',
      hint: 'ainda por fazer',
      anchor: 'formularios',
    },
    {
      key: 'hold',
      value: counts.hold,
      label: 'Em espera',
      hint: 'hold, sem envio',
      anchor: 'espera',
    },
    {
      key: 'skip',
      value: counts.skip,
      label: 'Ignorados',
      hint: 'skip, motivo na nota',
      anchor: 'ignorados',
    },
    {
      key: 'replied',
      value: counts.replied,
      label: 'Respostas',
      hint: counts.replied === 0 ? 'nenhuma no tracker' : 'registradas no arquivo',
      anchor: 'alvos',
    },
  ]
  if (counts.other > 0) {
    stats.push({
      key: 'all',
      value: counts.other,
      label: 'Outros',
      hint: 'status fora da lista',
      anchor: 'alvos',
    })
  }

  return (
    <section id="topo" className="mx-auto w-full max-w-6xl px-4 pt-10 pb-6 md:pt-14">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
        Fall 2027 · Canadá · AI / CS / Eng
      </p>
      <h1 className="mt-3 max-w-4xl font-serif text-5xl leading-[1.02] font-medium tracking-tight text-balance md:text-6xl">
        GradPath <span className="text-primary italic">Outreach</span>
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/85 md:text-lg">
        Mestrado no Canadá, trilha AI / CS / Eng. Alberta e Calgary primeiro.
      </p>
      <dl className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:gap-x-8">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Atualizado</dt>
          <dd className="mt-1 font-mono text-[13px]">{updated ? formatStamp(updated) : '—'}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Fonte</dt>
          <dd className="mt-1 font-mono text-[13px]">data/tracker.json · {counts.total} alvos</dd>
        </div>
      </dl>

      <div className="mt-8 grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-border md:grid-cols-5">
        {stats.map((stat, index) => {
          const active = filters.status === stat.key && stat.key !== 'all'
          return (
            <button
              key={stat.label}
              type="button"
              data-count={stat.key}
              aria-pressed={active}
              onClick={() => onStatus(active ? 'all' : stat.key, stat.anchor)}
              className={cn(
                'bg-card px-4 py-4 text-left transition-colors hover:bg-muted/50',
                index === stats.length - 1 && stats.length % 2 === 1 && 'col-span-2 md:col-span-1',
                active && 'bg-primary/10 shadow-[inset_0_2px_0_var(--primary)]',
              )}
            >
              <span className="block font-serif text-4xl tabular-nums tracking-tight">{stat.value}</span>
              <span className="mt-1 block text-sm">{stat.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{stat.hint}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        O que não está no arquivo não aparece. Sem corpo de e-mail inventado, sem resposta presumida, sem chance
        por professor quando o campo não existe. Respostas ficam em zero até o tracker registrar isso.
      </p>
    </section>
  )
}
