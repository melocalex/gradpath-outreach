export type LinkRef = { label: string; href: string }

export type Program = {
  rank: string
  name: string
  province: string
  plausibility: string
  why: string
  contact: string
  links: LinkRef[]
  deadline: string
  tuition: string
}

export type Pathway = {
  name: string
  where: string
  fit: string
  contact: string
  links: LinkRef[]
  deadline: string
}

export type Shortlist = {
  researched: string | null
  definitions: { code: string; text: string }[]
  programs: Program[]
  top: string[]
  pathways: Pathway[]
  reference: string | null
}

export type TemplateSection = { level: number; title: string; body: string }

export type TemplateDoc = {
  title: string
  intro: string
  sections: TemplateSection[]
}

export type Block =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'hr' }

export function plain(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractLinks(cell: string): LinkRef[] {
  const links: LinkRef[] = []
  const markdown = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g
  for (const match of cell.matchAll(markdown)) {
    links.push({ label: match[1], href: match[2] })
  }
  const bare = cell.replace(markdown, ' ')
  for (const part of bare.split(';')) {
    const found = part.match(/https?:\/\/[^\s)]+/)
    if (!found) continue
    const href = found[0].replace(/[.,)]+$/, '')
    if (links.some((link) => link.href === href)) continue
    const label = plain(part.replace(found[0], '')).replace(/[:\-–]+$/g, '').trim() || 'Página'
    links.push({ label, href })
  }
  return links
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function isRule(cells: string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')))
}

function tableAfter(md: string, heading: string): { headers: string[]; rows: string[][] } | null {
  const at = md.indexOf(heading)
  if (at < 0) return null
  const table: string[] = []
  for (const line of md.slice(at).split('\n').slice(1)) {
    if (line.trim().startsWith('|')) table.push(line)
    else if (table.length) break
  }
  if (table.length < 2) return null
  const headers = splitRow(table[0])
  const rows = table
    .slice(1)
    .map(splitRow)
    .filter((cells) => !isRule(cells))
  return { headers, rows }
}

function col(headers: string[], ...needles: string[]): number {
  return headers.findIndex((header) => needles.some((needle) => header.toLowerCase().includes(needle)))
}

function cell(row: string[], index: number): string {
  if (index < 0) return ''
  return row[index] ?? ''
}

export function parseShortlist(md: string): Shortlist {
  const researched = md.match(/Researched\s+(.+?)\./)?.[1]?.trim() ?? null
  const definitions: { code: string; text: string }[] = []
  for (const match of md.matchAll(/^- \*\*([A-C])\*\*:\s*(.+)$/gm)) {
    definitions.push({ code: match[1], text: match[2].trim() })
  }

  const ranked = tableAfter(md, '## Ranked shortlist')
  const programs: Program[] = []
  if (ranked) {
    const rank = col(ranked.headers, '#')
    const name = col(ranked.headers, 'program')
    const province = col(ranked.headers, 'province')
    const plaus = col(ranked.headers, 'plaus')
    const why = col(ranked.headers, 'why', 'blocker')
    const contact = col(ranked.headers, 'contact', 'admission')
    const url = col(ranked.headers, 'url', 'apply')
    const deadline = col(ranked.headers, 'deadline')
    const tuition = col(ranked.headers, 'tuition', 'funding')
    for (const row of ranked.rows) {
      programs.push({
        rank: plain(cell(row, rank)),
        name: cell(row, name),
        province: plain(cell(row, province)),
        plausibility: plain(cell(row, plaus)),
        why: cell(row, why),
        contact: cell(row, contact),
        links: extractLinks(cell(row, url)),
        deadline: cell(row, deadline),
        tuition: cell(row, tuition),
      })
    }
  }

  const bridge = tableAfter(md, '## Pathways')
  const pathways: Pathway[] = []
  if (bridge) {
    const name = col(bridge.headers, 'pathway')
    const where = col(bridge.headers, 'where')
    const fit = col(bridge.headers, 'fit')
    const contact = col(bridge.headers, 'contact')
    const url = col(bridge.headers, 'url')
    const deadline = col(bridge.headers, 'deadline', 'cost')
    for (const row of bridge.rows) {
      pathways.push({
        name: cell(row, name),
        where: cell(row, where),
        fit: cell(row, fit),
        contact: cell(row, contact),
        links: extractLinks(cell(row, url)),
        deadline: cell(row, deadline),
      })
    }
  }

  const top: string[] = []
  const topAt = md.indexOf('## Top 8')
  if (topAt >= 0) {
    for (const line of md.slice(topAt).split('\n').slice(1)) {
      const match = line.match(/^\s*\d+\.\s+(.*\S)\s*$/)
      if (match) top.push(match[1])
      else if (top.length) break
    }
  }

  const reference = md.split('\n').find((line) => line.startsWith('Reference only')) ?? null
  return { researched, definitions, programs, top, pathways, reference }
}

export function parseTemplate(md: string): TemplateDoc {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const title = lines.find((line) => line.startsWith('# '))?.replace(/^#\s+/, '').trim() || 'Modelos'
  const sections: TemplateSection[] = []
  const intro: string[] = []
  let current: { level: number; title: string; body: string[] } | null = null

  for (const line of lines) {
    const heading = /^(#{2,3})\s+(.*)$/.exec(line)
    if (heading) {
      if (current) {
        sections.push({ level: current.level, title: current.title, body: current.body.join('\n').trim() })
      }
      current = { level: heading[1].length, title: heading[2].trim(), body: [] }
      continue
    }
    if (!current) {
      if (!line.startsWith('# ')) intro.push(line)
    } else {
      current.body.push(line)
    }
  }
  if (current) {
    sections.push({ level: current.level, title: current.title, body: current.body.join('\n').trim() })
  }
  return { title, intro: intro.join('\n').trim(), sections }
}

export function mdBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: string[] | null = null
  let quote: string[] | null = null

  const flushParagraph = () => {
    if (!paragraph.length) return
    blocks.push({ type: 'p', text: paragraph.join(' ').trim() })
    paragraph = []
  }
  const flushList = () => {
    if (!list) return
    blocks.push({ type: 'ul', items: list })
    list = null
  }
  const flushQuote = () => {
    if (!quote) return
    blocks.push({ type: 'quote', text: quote.join(' ').trim() })
    quote = null
  }

  for (const line of lines) {
    if (line.trim() === '---') {
      flushParagraph()
      flushList()
      flushQuote()
      blocks.push({ type: 'hr' })
      continue
    }
    if (line.startsWith('- ')) {
      flushParagraph()
      flushQuote()
      list ??= []
      list.push(line.slice(2).trim())
      continue
    }
    if (line.startsWith('>')) {
      flushParagraph()
      flushList()
      quote ??= []
      quote.push(line.replace(/^>\s?/, ''))
      continue
    }
    if (!line.trim()) {
      flushParagraph()
      flushList()
      flushQuote()
      continue
    }
    flushList()
    flushQuote()
    paragraph.push(line.trim())
  }
  flushParagraph()
  flushList()
  flushQuote()
  return blocks
}

export function splitSubject(body: string): { subject: string | null; rest: string } {
  let subject: string | null = null
  const rest = body
    .split('\n')
    .filter((line) => {
      const match = line.match(/^\*\*Subject:\*\*\s*(.+)$/)
      if (match && !subject) {
        subject = match[1].trim()
        return false
      }
      return true
    })
    .join('\n')
    .trim()
  return { subject, rest }
}

export function plausibilityLabel(code: string): string {
  if (code === 'A') return 'Caminho escrito'
  if (code === 'B') return 'Possível com exceção'
  if (code === 'C') return 'Tiro longo'
  if (code === 'A/B') return 'Escrito, raro'
  if (code === 'B/C') return 'Exceção incerta'
  return code
}

export const PROVINCE_NAME: Record<string, string> = {
  AB: 'Alberta',
  BC: 'British Columbia',
  ON: 'Ontario',
  QC: 'Quebec',
  SK: 'Saskatchewan',
  MB: 'Manitoba',
}
