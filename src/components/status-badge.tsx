import { Badge } from '@/components/ui/badge'
import { cn } from 'cn'
import { statusKey, statusLabel, type StatusKey } from '@/lib/tracker'

const STYLE: Record<StatusKey, string> = {
  sent: 'border-sage/35 bg-sage/12 text-sage',
  form_needed: 'border-brass/40 bg-brass/12 text-brass',
  hold: 'border-clay/40 bg-clay/12 text-clay',
  skip: 'border-border bg-muted text-muted-foreground',
  replied: 'border-sky/35 bg-sky/12 text-sky',
  other: 'border-border bg-muted text-foreground',
}

export function StatusBadge({ status }: { status: string | undefined }) {
  const key = statusKey(status)
  return (
    <Badge variant="outline" className={cn('h-6 rounded-full px-2', STYLE[key])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {statusLabel(status)}
    </Badge>
  )
}
