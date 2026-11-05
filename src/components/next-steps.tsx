import { ExternalLink } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { StatusBadge } from '@/components/status-badge'
import { DASH, channelLabel, linkLabel, mailtoHref, safeHttpUrl, sameLink, statusKey, type TrackerRow } from '@/lib/tracker'

function ActionCard({
  row,
  rows,
  emphasize,
}: {
  row: TrackerRow
  rows: TrackerRow[]
  emphasize?: boolean
}) {
  const href = safeHttpUrl(row.channelUrl)
  const mail = mailtoHref(row.email, row.subject)
  const shared = sameLink(row, rows)
  return (
    <article className={`rounded-xl border px-4 py-4 ${emphasize ? 'border-clay/40 bg-clay/5' : 'border-border bg-card/40'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-muted-foreground">{row.id}</span>
        <StatusBadge status={row.status} />
        <span className="font-mono text-[11px] text-muted-foreground">{channelLabel(row.channel)}</span>
      </div>
      <h3 className="mt-2 font-serif text-2xl tracking-tight">{row.name}</h3>
      <p className="text-sm text-muted-foreground">{row.uni}</p>
      {row.role ? <p className="mt-1 text-xs text-muted-foreground">{row.role}</p> : null}
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
        {statusKey(row.status) === 'skip' ? 'Motivo' : 'Próximo passo'}
      </p>
      <p className="mt-1 text-sm leading-relaxed">{row.notes ?? 'O tracker não descreve o próximo passo.'}</p>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Assunto</p>
      <p className="mt-1 text-sm">{row.subject ?? DASH}</p>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">E-mail</p>
      <p className="mt-1 font-mono text-xs break-all">{row.email ?? DASH}</p>
      {shared.length > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Mesmo link em {shared.map((other) => `${other.name} (${other.id})`).join(', ')}.
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className={buttonVariants({ size: 'sm' })}>
            {linkLabel(row.channel)}
            <ExternalLink />
          </a>
        ) : null}
        {statusKey(row.status) !== 'skip' && mail ? (
          <a href={mail} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Abrir no cliente de e-mail
          </a>
        ) : null}
      </div>
      {!href && statusKey(row.status) === 'form_needed' ? (
        <p className="mt-3 text-xs text-muted-foreground">Sem link no tracker.</p>
      ) : null}
    </article>
  )
}

export function NextSteps({ rows }: { rows: TrackerRow[] }) {
  const forms = rows.filter((row) => statusKey(row.status) === 'form_needed')
  const holds = rows.filter((row) => statusKey(row.status) === 'hold')
  const skips = rows.filter((row) => statusKey(row.status) === 'skip')

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-14 px-4 py-8">
      <section>
        <SectionHeading
          id="formularios"
          index="03 · Formulários"
          title="Formulários pendentes"
          lede="Estes registros estão em form_needed. Ainda não contam como enviados. A fila ignora o filtro da tabela."
        />
        {forms.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Nenhum formulário pendente.</p>
        ) : (
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {forms.map((row) => (
              <ActionCard key={row.id} row={row} rows={rows} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading
          id="espera"
          index="04 · Espera"
          title="Em espera"
          lede="Marcados como hold. A nota diz quando mandar. Nada aqui foi contado como enviado."
        />
        {holds.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Nenhum envio em espera.</p>
        ) : (
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {holds.map((row) => (
              <ActionCard key={row.id} row={row} rows={rows} emphasize />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading
          id="ignorados"
          index="05 · Ignorados"
          title="Motivos de skip"
          lede="Fora desta rodada. O motivo é a nota do tracker, sem leitura extra."
        />
        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {skips.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted-foreground">Nenhum ignorado.</li>
          ) : (
            skips.map((row) => (
              <li key={row.id} className="grid gap-1 px-4 py-4 md:grid-cols-[8rem_1fr_1.4fr] md:gap-4">
                <span className="font-mono text-xs text-muted-foreground">{row.id}</span>
                <span>
                  <span className="block font-medium">{row.name}</span>
                  <span className="block text-sm text-muted-foreground">{row.uni}</span>
                </span>
                <span className="text-sm leading-relaxed">{row.notes ?? DASH}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}
