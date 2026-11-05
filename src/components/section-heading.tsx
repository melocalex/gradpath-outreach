export function SectionHeading({
  index,
  title,
  id,
  lede,
}: {
  index: string
  title: string
  id?: string
  lede?: string
}) {
  return (
    <header id={id} className="scroll-mt-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">{index}</p>
      <h2 className="mt-2 font-serif text-3xl tracking-tight text-balance md:text-4xl">{title}</h2>
      {lede ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{lede}</p> : null}
    </header>
  )
}
