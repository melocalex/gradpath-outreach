export const DASH = '—'

export type TrackerRow = {
  id: string
  name: string
  role?: string
  uni: string
  email?: string
  channel?: string
  channelUrl?: string
  subject?: string
  status: string
  hook?: string
  paperOrFit?: string
  sentAt?: string
  recordedAt?: string
  notes?: string
  body?: string
  chance?: string
  priority?: string
  region?: string
  messageId?: string
  reply?: string
  repliedAt?: string
}

export type StatusKey = 'sent' | 'form_needed' | 'hold' | 'skip' | 'replied' | 'other'

export type StatusFilter = 'all' | 'sent' | 'form_needed' | 'hold' | 'skip' | 'replied'

export type Filters = {
  status: StatusFilter
  query: string
  region: string
  priority: string
}

export type Tallies = {
  sent: number
  form_needed: number
  hold: number
  skip: number
  replied: number
  other: number
  total: number
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function str(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

export function dataUrl(file: string): string {
  const base = import.meta.env.BASE_URL || './'
  return `${base}data/${file}`
}

export function parseTracker(raw: string): TrackerRow[] {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error('data/tracker.json não é JSON válido.')
  }
  if (!Array.isArray(data)) throw new Error('data/tracker.json precisa ser uma lista.')
  return data.map((item, index) => normalize(item, index))
}

function normalize(item: unknown, index: number): TrackerRow {
  if (!item || typeof item !== 'object') {
    return { id: `row-${index + 1}`, name: DASH, uni: DASH, status: '' }
  }
  const row = item as Record<string, unknown>
  return {
    id: str(row.id) ?? `row-${index + 1}`,
    name: str(row.name) ?? DASH,
    role: str(row.role),
    uni: str(row.uni) ?? str(row.university) ?? DASH,
    email: str(row.email),
    channel: str(row.channel),
    channelUrl: str(row.channelUrl),
    subject: str(row.subject),
    status: str(row.status) ?? '',
    hook: str(row.hook),
    paperOrFit: str(row.paperOrFit),
    sentAt: str(row.sentAt) ?? str(row.sent_at),
    recordedAt: str(row.recorded_at) ?? str(row.recordedAt),
    notes: str(row.notes),
    body: str(row.body),
    chance: str(row.chance),
    priority: str(row.priority),
    region: str(row.region),
    messageId: str(row.messageId) ?? str(row.message_id),
    reply: str(row.reply),
    repliedAt: str(row.repliedAt) ?? str(row.replied_at),
  }
}

export function statusKey(status: string | undefined): StatusKey {
  const value = (status ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (value === 'sent') return 'sent'
  if (value === 'form_needed' || value === 'form') return 'form_needed'
  if (value === 'hold' || value === 'espera' || value === 'waiting') return 'hold'
  if (value === 'skip' || value === 'skipped') return 'skip'
  if (value === 'replied' || value === 'reply' || value === 'resposta') return 'replied'
  return 'other'
}

export const STATUS_LABEL: Record<StatusKey, string> = {
  sent: 'Enviado',
  form_needed: 'Formulário',
  hold: 'Em espera',
  skip: 'Ignorar',
  replied: 'Resposta',
  other: 'Outro',
}

export function statusLabel(status: string | undefined): string {
  const key = statusKey(status)
  if (key === 'other') return status?.trim() || DASH
  return STATUS_LABEL[key]
}

export function hasReply(row: TrackerRow): boolean {
  return statusKey(row.status) === 'replied' || Boolean(row.reply) || Boolean(row.repliedAt)
}

export function tally(rows: TrackerRow[]): Tallies {
  const counts: Tallies = {
    sent: 0,
    form_needed: 0,
    hold: 0,
    skip: 0,
    replied: 0,
    other: 0,
    total: rows.length,
  }
  for (const row of rows) {
    const key = statusKey(row.status)
    if (key === 'other') counts.other += 1
    else counts[key] += 1
    if (key !== 'replied' && (row.reply || row.repliedAt)) counts.replied += 1
  }
  return counts
}

export function isBatch3(row: TrackerRow): boolean {
  return (row.notes ?? '').toLowerCase().includes('batch3')
}

export function regionOf(row: Pick<TrackerRow, 'region' | 'uni'>): { label: string; explicit: boolean } {
  if (row.region) return { label: row.region, explicit: true }
  const uni = row.uni.toLowerCase()
  if (uni.includes('calgary') || uni.includes('sait')) return { label: 'Calgary', explicit: false }
  if (uni.includes('alberta') || uni.includes('athabasca') || uni.includes('lethbridge')) {
    return { label: 'Alberta', explicit: false }
  }
  return { label: 'Outras', explicit: false }
}

const REGION_ORDER = ['Calgary', 'Alberta', 'Outras']

export function regionOptions(rows: TrackerRow[]): string[] {
  const present = new Set(rows.map((row) => regionOf(row).label))
  const known = REGION_ORDER.filter((label) => present.has(label))
  const extra = [...present].filter((label) => !REGION_ORDER.includes(label)).sort((a, b) => a.localeCompare(b))
  return [...known, ...extra]
}

export function priorityOptions(rows: TrackerRow[]): string[] {
  return [...new Set(rows.map((row) => row.priority).filter((value): value is string => Boolean(value)))].sort(
    (a, b) => a.localeCompare(b),
  )
}

export function channelLabel(channel: string | undefined): string {
  if (!channel) return DASH
  const key = channel.toLowerCase()
  if (key === 'email') return 'E-mail'
  if (key === 'form') return 'Formulário'
  if (key === 'portal') return 'Portal'
  return channel
}

export function linkLabel(channel: string | undefined): string {
  if (channel === 'portal') return 'Abrir portal'
  if (channel === 'form') return 'Abrir formulário'
  return 'Abrir link'
}

export function safeHttpUrl(value: string | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.href
  } catch {
    return null
  }
}

export function mailtoHref(email: string | undefined, subject: string | undefined): string | null {
  if (!email || !email.includes('@')) return null
  const to = email
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter((part) => part.includes('@'))
  if (!to.length) return null
  const href = `mailto:${to.join(',')}`
  if (!subject) return href
  return `${href}?subject=${encodeURIComponent(subject)}`
}

export function sameEmail(row: TrackerRow, rows: TrackerRow[]): TrackerRow[] {
  const email = row.email?.toLowerCase()
  if (!email) return []
  return rows.filter((other) => other.id !== row.id && other.email?.toLowerCase() === email)
}

export function sameLink(row: TrackerRow, rows: TrackerRow[]): TrackerRow[] {
  const href = safeHttpUrl(row.channelUrl)
  if (!href) return []
  return rows.filter((other) => other.id !== row.id && safeHttpUrl(other.channelUrl) === href)
}

export function formatStamp(raw: string | undefined): string {
  if (!raw) return DASH
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/)
  if (!match) return raw
  const day = Number(match[3])
  const month = MONTHS[Number(match[2]) - 1] ?? match[2]
  let zone = ''
  if (/BRT/i.test(raw)) zone = ' BRT'
  else if (raw.includes('+00:00') || /Z$/.test(raw)) zone = ' UTC'
  else {
    const offset = raw.match(/([+-]\d{2}:\d{2})/)
    if (offset) zone = offset[1] === '-03:00' ? ' BRT' : ` ${offset[1]}`
  }
  return `${day} ${month} ${match[1]} · ${match[4]}:${match[5]}${zone}`
}

export function stampToDate(raw: string | undefined): Date | null {
  if (!raw) return null
  if (raw.includes('T')) {
    const parsed = new Date(raw)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?/)
  if (!match) return null
  const parsed = new Date(`${match[1]}T${match[2] ?? '00:00'}:00-03:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function latestStamp(rows: TrackerRow[]): string | null {
  let best: { time: number; raw: string } | null = null
  for (const row of rows) {
    for (const raw of [row.sentAt, row.recordedAt]) {
      const date = stampToDate(raw)
      if (!raw || !date) continue
      const time = date.getTime()
      if (!best || time > best.time) best = { time, raw }
    }
  }
  return best?.raw ?? null
}

export function matches(row: TrackerRow, filters: Filters): boolean {
  if (filters.status === 'replied') {
    if (!hasReply(row)) return false
  } else if (filters.status !== 'all' && statusKey(row.status) !== filters.status) {
    return false
  }
  if (filters.region !== 'all' && regionOf(row).label !== filters.region) return false
  if (filters.priority !== 'all' && row.priority !== filters.priority) return false
  const query = filters.query.trim().toLowerCase()
  if (!query) return true
  const blob = [row.id, row.name, row.uni, row.email, row.subject, row.notes, row.hook, row.role, row.chance]
    .filter(Boolean)
    .join('\n')
    .toLowerCase()
  return blob.includes(query)
}

export function emptyFilters(): Filters {
  return { status: 'all', query: '', region: 'all', priority: 'all' }
}

export function readFilters(): Filters {
  const params = new URLSearchParams(window.location.search)
  const status = params.get('status')
  const allowed: StatusFilter[] = ['all', 'sent', 'form_needed', 'hold', 'skip', 'replied']
  return {
    status: allowed.includes(status as StatusFilter) ? (status as StatusFilter) : 'all',
    query: params.get('q') ?? '',
    region: params.get('region') ?? 'all',
    priority: params.get('priority') ?? 'all',
  }
}

export function writeFilters(filters: Filters) {
  const params = new URLSearchParams()
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.region !== 'all') params.set('region', filters.region)
  if (filters.priority !== 'all') params.set('priority', filters.priority)
  if (filters.query) params.set('q', filters.query)
  const query = params.toString()
  const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  window.history.replaceState(null, '', next)
}
