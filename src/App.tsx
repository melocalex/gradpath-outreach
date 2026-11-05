import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Chance } from '@/components/chance'
import { Hero, SiteHeader } from '@/components/overview'
import { NextSteps } from '@/components/next-steps'
import { SiteFooter } from '@/components/site-footer'
import { Targets } from '@/components/targets'
import { Templates } from '@/components/templates'
import { parseShortlist, parseTemplate, type Shortlist, type TemplateDoc } from '@/lib/content'
import {
  dataUrl,
  parseTracker,
  readFilters,
  tally,
  writeFilters,
  type Filters,
  type StatusFilter,
  type TrackerRow,
} from '@/lib/tracker'

type Load =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | {
      state: 'ready'
      rows: TrackerRow[]
      shortlist: Shortlist | null
      shortlistError: string | null
      template: TemplateDoc | null
      templateError: string | null
    }

async function loadText(file: string): Promise<string> {
  const response = await fetch(dataUrl(file), { cache: 'no-store' })
  if (!response.ok) throw new Error(`${file} · HTTP ${response.status}`)
  return response.text()
}

export default function App() {
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  const [filters, setFilters] = useState<Filters>(() => readFilters())

  const reload = useCallback(async () => {
    setLoad({ state: 'loading' })
    const [trackerResult, shortlistResult, templateResult] = await Promise.allSettled([
      loadText('tracker.json'),
      loadText('shortlist.md'),
      loadText('email_template.md'),
    ])
    if (trackerResult.status === 'rejected') {
      const reason = trackerResult.reason
      setLoad({
        state: 'error',
        message: reason instanceof Error ? reason.message : 'Não consegui ler data/tracker.json.',
      })
      return
    }
    try {
      const rows = parseTracker(trackerResult.value)
      setLoad({
        state: 'ready',
        rows,
        shortlist: shortlistResult.status === 'fulfilled' ? parseShortlist(shortlistResult.value) : null,
        shortlistError: shortlistResult.status === 'rejected' ? 'Não foi possível ler data/shortlist.md.' : null,
        template: templateResult.status === 'fulfilled' ? parseTemplate(templateResult.value) : null,
        templateError: templateResult.status === 'rejected' ? 'Não foi possível ler data/email_template.md.' : null,
      })
    } catch (error) {
      setLoad({
        state: 'error',
        message: error instanceof Error ? error.message : 'Não consegui ler data/tracker.json.',
      })
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [reload])

  useEffect(() => {
    writeFilters(filters)
  }, [filters])

  function onStatus(status: StatusFilter, anchor: string) {
    setFilters((current) => ({ ...current, status }))
    window.setTimeout(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  return (
    <div className="min-h-svh">
      <a
        href="#alvos"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Ir para os alvos
      </a>
      <SiteHeader />
      {load.state === 'loading' ? <Loading /> : null}
      {load.state === 'error' ? (
        <main className="mx-auto w-full max-w-6xl px-4 py-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">GradPath</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight">Não consegui ler o tracker</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            O painel só mostra o que está em data/tracker.json. Confira o arquivo e tente de novo.
          </p>
          <p className="mt-3 font-mono text-xs text-clay">{load.message}</p>
          <Button type="button" className="mt-6" onClick={() => void reload()}>
            Tentar de novo
          </Button>
        </main>
      ) : null}
      {load.state === 'ready' ? (
        <main>
          <Hero rows={load.rows} counts={tally(load.rows)} filters={filters} onStatus={onStatus} />
          <Targets rows={load.rows} filters={filters} onChange={setFilters} />
          <NextSteps rows={load.rows} />
          <Chance doc={load.shortlist} error={load.shortlistError} />
          <Templates doc={load.template} error={load.templateError} />
        </main>
      ) : null}
      <SiteFooter />
    </div>
  )
}

function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16" aria-busy="true" aria-live="polite">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">Lendo data/tracker.json</p>
      <div className="mt-6 h-12 w-72 animate-pulse rounded-md bg-muted" />
      <div className="mt-8 grid grid-cols-2 gap-px md:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse bg-muted/70" />
        ))}
      </div>
    </main>
  )
}
