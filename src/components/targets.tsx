import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, ChevronDown, Copy, ExternalLink, Search } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/status-badge'
import { cn } from 'cn'
import {
  DASH,
  channelLabel,
  emptyFilters,
  formatStamp,
  isBatch3,
  linkLabel,
  mailtoHref,
  matches,
  priorityOptions,
  regionOf,
  regionOptions,
  safeHttpUrl,
  sameEmail,
  statusKey,
  type Filters,
  type StatusFilter,
  type TrackerRow,
} from '@/lib/tracker'

const COLS =
  'xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1.05fr)_minmax(0,1.15fr)_auto_minmax(0,0.95fr)_auto]'

const STATUS_CHIPS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'sent', label: 'Enviados' },
  { key: 'form_needed', label: 'Formulário' },
  { key: 'hold', label: 'Espera' },
  { key: 'skip', label: 'Ignorar' },
]

function countStatus(rows: TrackerRow[], key: StatusFilter): number {
  if (key === 'all') return rows.length
  if (key === 'replied') return 0
  return rows.filter((row) => statusKey(row.status) === key).length
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-relaxed">{children}</dd>
    </div>
  )
}

function NotesCell({ row }: { row: TrackerRow }) {
  if (!row.chance && !row.notes && !row.hook) {
    return <span className="text-muted-foreground">{DASH}</span>
  }
  return (
    <span className="grid gap-1 text-xs leading-snug">
      {row.chance ? (
        <span className="w-fit rounded-full border border-primary/35 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-primary">
          {row.chance}
        </span>
      ) : null}
      {row.notes ? (
        <span className="line-clamp-3">{row.notes}</span>
      ) : row.hook ? (
        <span className="line-clamp-3 text-muted-foreground">
          <span className="font-mono text-[10px] uppercase tracking-wide">Gancho · </span>
          {row.hook}
        </span>
      ) : null}
    </span>
  )
}

export function Targets({
  rows,
  filters,
  onChange,
}: {
  rows: TrackerRow[]
  filters: Filters
  onChange: (filters: Filters) => void
}) {
  const [open, setOpen] = useState<string[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const pendingScroll = useRef<string | null>(null)
  const shown = rows.filter((row) => matches(row, filters))
  const regions = regionOptions(rows)
  const priorities = priorityOptions(rows)
  const explicitRegions = rows.filter((row) => row.region)
  const batch = rows.filter(isBatch3)
  const dirty =
    filters.status !== 'all' || filters.region !== 'all' || filters.priority !== 'all' || filters.query !== ''

  useEffect(() => {
    const id = pendingScroll.current
    if (!id) return
    const node = document.getElementById(`alvo-${id}`)
    if (!node) return
    pendingScroll.current = null
    node.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [filters])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return
      event.preventDefault()
      document.getElementById('busca')?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function toggle(id: string) {
    setOpen((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  async function copyEmail(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(id)
      window.setTimeout(() => setCopied((current) => (current === id ? null : current)), 1500)
    } catch {
      setCopied(`err:${id}`)
    }
  }

  function focusRow(id: string) {
    onChange({ ...emptyFilters(), query: id })
    setOpen((current) => (current.includes(id) ? current : [...current, id]))
    pendingScroll.current = id
  }

  const batchSent = batch.filter((row) => statusKey(row.status) === 'sent').length
  const batchHold = batch.filter((row) => statusKey(row.status) === 'hold').length
  const batchSkip = batch.filter((row) => statusKey(row.status) === 'skip').length

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <header id="alvos" className="scroll-mt-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">02 · Alvos</p>
        <h2 className="mt-2 font-serif text-3xl tracking-tight md:text-4xl">Cada registro do tracker</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Clique a linha para ver destinatário, assunto e o corpo, se existir. Sem corpo salvo, o link abre só
          com endereço e assunto.
        </p>
      </header>

      {batch.length > 0 ? (
        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 px-4 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Lote 3 · nota batch3</p>
          <p className="mt-2 text-sm leading-relaxed">
            {batchSent} enviados · {batchHold} em espera · {batchSkip} ignorados. Os ids abaixo abrem a linha.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {batch.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => focusRow(row.id)}
                className="rounded-full border border-border bg-card px-2 py-1 font-mono text-[11px] hover:border-primary/50"
              >
                {row.id}
                {statusKey(row.status) === 'sent' ? null : (
                  <span className="ml-1 text-muted-foreground">{statusKey(row.status)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-xl border border-border bg-card/40">
        <div className="grid gap-4 p-4">
          <div className="grid gap-2">
            <label htmlFor="busca" className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Busca
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="busca"
                value={filters.query}
                onChange={(event) => onChange({ ...filters, query: event.target.value })}
                placeholder="Nome, universidade, e-mail ou id"
                className="h-10 pl-9"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_CHIPS.map((chip) => (
                <Button
                  key={chip.key}
                  type="button"
                  size="sm"
                  variant={filters.status === chip.key ? 'default' : 'outline'}
                  aria-pressed={filters.status === chip.key}
                  className="rounded-full"
                  onClick={() => onChange({ ...filters, status: chip.key })}
                >
                  {chip.label}
                  <span className="font-mono text-[10px] opacity-70">{countStatus(rows, chip.key)}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Região</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={filters.region === 'all' ? 'default' : 'outline'}
                aria-pressed={filters.region === 'all'}
                className="rounded-full"
                onClick={() => onChange({ ...filters, region: 'all' })}
              >
                Todas
              </Button>
              {regions.map((region) => (
                <Button
                  key={region}
                  type="button"
                  size="sm"
                  variant={filters.region === region ? 'default' : 'outline'}
                  aria-pressed={filters.region === region}
                  className="rounded-full"
                  onClick={() => onChange({ ...filters, region })}
                >
                  {region}
                </Button>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {explicitRegions.length
                ? `Campo region em ${explicitRegions.map((row) => `${row.id} (${row.region})`).join(', ')}. Nos demais, a região sai do nome da universidade.`
                : 'O tracker não traz região. Calgary, Alberta e Outras saem do nome da universidade.'}{' '}
              Calgary tem filtro próprio e não entra em Alberta.
            </p>
          </div>
          {priorities.length > 0 ? (
            <div className="grid gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Prioridade</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={filters.priority === 'all' ? 'default' : 'outline'}
                  className="rounded-full"
                  onClick={() => onChange({ ...filters, priority: 'all' })}
                >
                  Todas
                </Button>
                {priorities.map((priority) => (
                  <Button
                    key={priority}
                    type="button"
                    size="sm"
                    variant={filters.priority === priority ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => onChange({ ...filters, priority })}
                  >
                    {priority}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="font-mono text-xs text-muted-foreground">
              {shown.length} de {rows.length}
            </p>
            {dirty ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(emptyFilters())}>
                Limpar filtros
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <div
          className={cn(
            'hidden bg-card/80 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground xl:grid',
            COLS,
            'xl:gap-x-3',
          )}
        >
          <span>Nome</span>
          <span>Universidade</span>
          <span>E-mail</span>
          <span>Assunto</span>
          <span>Status</span>
          <span>Notas</span>
          <span>Enviado</span>
        </div>
        {shown.length === 0 ? (
          <div className="bg-card/30 px-4 py-10 text-center">
            <p className="text-sm">Nenhum alvo com esses filtros.</p>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => onChange(emptyFilters())}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <ul>
            {shown.map((row) => {
              const expanded = open.includes(row.id)
              const region = regionOf(row)
              const mail = mailtoHref(row.email, row.subject)
              const href = safeHttpUrl(row.channelUrl)
              const twins = sameEmail(row, rows)
              return (
                <li key={row.id} id={`alvo-${row.id}`} data-row-id={row.id} className="scroll-mt-28 border-t border-border first:border-t-0">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`detail-${row.id}`}
                    onClick={() => toggle(row.id)}
                    className={cn(
                      'grid w-full gap-2 px-4 py-4 text-left hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                      COLS,
                      'xl:items-center xl:gap-x-3',
                      expanded && 'bg-muted/30',
                    )}
                  >
                    <span className="min-w-0">
                      <span className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block font-mono text-[10px] tracking-wider text-muted-foreground">{row.id}</span>
                          <span className="block truncate font-medium">{row.name}</span>
                          {row.role ? <span className="block truncate text-xs text-muted-foreground">{row.role}</span> : null}
                        </span>
                        <span className="xl:hidden">
                          <StatusBadge status={row.status} />
                        </span>
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{row.uni}</span>
                      <span
                        title={region.explicit ? 'Campo region' : 'Lida do nome da universidade'}
                        className="mt-1 inline-flex rounded-full border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                      >
                        {region.label}
                      </span>
                    </span>
                    <span className="truncate font-mono text-xs text-muted-foreground" title={row.email}>
                      {row.email ?? DASH}
                    </span>
                    <span className="line-clamp-2 text-sm" title={row.subject}>
                      {row.subject ?? DASH}
                    </span>
                    <span className="hidden xl:block">
                      <StatusBadge status={row.status} />
                    </span>
                    <NotesCell row={row} />
                    <span className="flex items-center justify-between gap-3 xl:justify-end">
                      <span className="font-mono text-[11px] text-muted-foreground">{formatStamp(row.sentAt)}</span>
                      <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
                    </span>
                  </button>
                  {expanded ? (
                    <div id={`detail-${row.id}`} className="border-t border-border bg-background/50 px-4 py-4">
                      <dl className="grid gap-5 md:grid-cols-2">
                        <Field label="Para">
                          <span className="font-mono text-xs break-all">{row.email ?? DASH}</span>
                          {row.email ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => copyEmail(row.id, row.email ?? '')}
                            >
                              {copied === row.id ? <Check /> : <Copy />}
                              {copied === row.id ? 'Copiado' : copied === `err:${row.id}` ? 'Falhou' : 'Copiar'}
                            </Button>
                          ) : null}
                        </Field>
                        <Field label="Assunto">{row.subject ?? DASH}</Field>
                        <Field label="Corpo">
                          {row.body ? (
                            <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap">{row.body}</pre>
                          ) : (
                            <p className="text-muted-foreground">Nenhum corpo salvo no tracker.</p>
                          )}
                        </Field>
                        <Field label="Enviado em">{formatStamp(row.sentAt)}</Field>
                        <Field label="Função">{row.role ?? DASH}</Field>
                        <Field label="Canal">{channelLabel(row.channel)}</Field>
                        <Field label="Gancho">{row.hook ?? DASH}</Field>
                        <Field label="Encaixe">{row.paperOrFit ?? DASH}</Field>
                        <Field label="Notas">{row.notes ?? DASH}</Field>
                        {row.chance ? <Field label="Chance">{row.chance}</Field> : null}
                        {row.priority ? <Field label="Prioridade">{row.priority}</Field> : null}
                        {row.messageId ? (
                          <Field label="ID da mensagem">
                            <span className="font-mono text-xs">{row.messageId}</span>
                          </Field>
                        ) : null}
                        {row.recordedAt ? <Field label="Registrado em">{formatStamp(row.recordedAt)}</Field> : null}
                        {row.reply ? <Field label="Resposta">{row.reply}</Field> : null}
                        {row.repliedAt ? <Field label="Data da resposta">{formatStamp(row.repliedAt)}</Field> : null}
                      </dl>
                      {twins.length > 0 ? (
                        <p className="mt-4 text-xs text-muted-foreground">
                          Mesmo e-mail em{' '}
                          {twins.map((other) => `${other.id} (${statusKey(other.status)})`).join(', ')}.
                        </p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {mail ? (
                          <a href={mail} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                            Abrir no cliente de e-mail
                          </a>
                        ) : null}
                        {href ? (
                          <a href={href} target="_blank" rel="noreferrer" className={buttonVariants({ size: 'sm' })}>
                            {linkLabel(row.channel)}
                            <ExternalLink />
                          </a>
                        ) : null}
                        {!mail && !href && !row.body ? (
                          <p className="text-xs text-muted-foreground">Sem e-mail e sem link no tracker.</p>
                        ) : null}
                      </div>
                      {mail ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          O atalho leva destinatário e assunto. O corpo não vai junto.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
