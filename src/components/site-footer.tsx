export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm">
        <p className="font-serif text-xl tracking-tight">Alexandre Melo</p>
        <a
          href="https://www.linkedin.com/in/alexcmelo"
          className="w-fit font-mono text-xs underline decoration-primary/50 underline-offset-2 hover:decoration-primary"
        >
          linkedin.com/in/alexcmelo
        </a>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Tecnólogo não é bacharelado. No tracker e no shortlist, o Tecnólogo da FMU entra como diploma de cerca
          de 2,5 a 3 anos, não como um bachelor's de 4 anos.
        </p>
        <p className="font-mono text-[11px] text-muted-foreground">GradPath lê data/tracker.json ao carregar.</p>
      </div>
    </footer>
  )
}
