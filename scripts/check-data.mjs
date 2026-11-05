import { readFileSync } from 'node:fs'

const tracker = JSON.parse(readFileSync(new URL('../data/tracker.json', import.meta.url), 'utf8'))
if (!Array.isArray(tracker)) {
  console.error('data/tracker.json must be an array')
  process.exit(1)
}

const ids = new Set()
const counts = {}
for (const row of tracker) {
  if (!row || typeof row !== 'object') {
    console.error('tracker row is not an object')
    process.exit(1)
  }
  if (typeof row.id !== 'string' || !row.id.trim()) {
    console.error('tracker row is missing id')
    process.exit(1)
  }
  if (ids.has(row.id)) {
    console.error(`duplicate id ${row.id}`)
    process.exit(1)
  }
  ids.add(row.id)
  if (typeof row.name !== 'string' || !row.name.trim()) {
    console.error(`${row.id} is missing name`)
    process.exit(1)
  }
  const uni = typeof row.uni === 'string' ? row.uni.trim() : ''
  const university = typeof row.university === 'string' ? row.university.trim() : ''
  if (!uni && !university) {
    console.error(`${row.id} is missing uni/university`)
    process.exit(1)
  }
  if (typeof row.status !== 'string' || !row.status.trim()) {
    console.error(`${row.id} is missing status`)
    process.exit(1)
  }
  counts[row.status] = (counts[row.status] ?? 0) + 1
  if (row.status === 'sent') {
    const sent = (typeof row.sentAt === 'string' && row.sentAt.trim()) || (typeof row.sent_at === 'string' && row.sent_at.trim())
    if (!sent) console.warn(`${row.id} is sent without sentAt/sent_at`)
  }
}

const shortlist = readFileSync(new URL('../data/shortlist.md', import.meta.url), 'utf8')
const ranked = shortlist.split('## Pathways')[0]
const programRows = ranked.split('\n').filter((line) => line.startsWith('|') && !line.includes('---') && !line.startsWith('| #'))
if (programRows.length < 16) {
  console.error(`expected at least 16 shortlist programs, found ${programRows.length}`)
  process.exit(1)
}
const pathways = shortlist.split('## Pathways')[1] ?? ''
const pathwayRows = pathways.split('\n').filter((line) => line.startsWith('|') && !line.includes('---') && !line.startsWith('| Pathway'))
if (pathwayRows.length < 4) {
  console.error(`expected at least 4 pathways, found ${pathwayRows.length}`)
  process.exit(1)
}

const template = readFileSync(new URL('../data/email_template.md', import.meta.url), 'utf8')
if (!template.includes('## Variant A') || !template.includes('## Variant B')) {
  console.error('email template is missing variant A or B')
  process.exit(1)
}

const summary = Object.entries(counts)
  .map(([status, count]) => `${status} ${count}`)
  .join(' · ')
console.log(`${tracker.length} rows · ${summary}`)
console.log(`${programRows.length} programs · ${pathwayRows.length} pathways`)
