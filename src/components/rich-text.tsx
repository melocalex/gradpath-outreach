import type { ReactNode } from 'react'
import type { Block } from '@/lib/content'

export function Inline({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+)/g
  let last = 0
  let index = 0
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0
    if (start > last) nodes.push(text.slice(last, start))
    const token = match[0]
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={index} className="font-medium text-foreground">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('`')) {
      nodes.push(
        <code key={index} className="font-mono text-[0.92em]">
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith('[')) {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
      if (link) {
        nodes.push(
          <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="underline decoration-primary/50 underline-offset-2 hover:decoration-primary">
            {link[1]}
          </a>,
        )
      }
    } else {
      const href = token.replace(/[.,)]+$/, '')
      nodes.push(
        <a key={index} href={href} target="_blank" rel="noreferrer" className="underline decoration-primary/50 underline-offset-2 hover:decoration-primary">
          {href}
        </a>,
      )
    }
    last = start + token.length
    index += 1
  }
  if (last < text.length) nodes.push(text.slice(last))
  return <>{nodes}</>
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="grid gap-4 text-sm leading-relaxed text-foreground/90">
      {blocks.map((block, index) => {
        if (block.type === 'hr') return <hr key={index} className="border-border" />
        if (block.type === 'ul') {
          return (
            <ul key={index} className="grid list-disc gap-2 pl-5 marker:text-primary">
              {block.items.map((item) => (
                <li key={item}>
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          )
        }
        if (block.type === 'quote') {
          return (
            <blockquote key={index} className="border-l-2 border-primary pl-4 text-muted-foreground">
              <Inline text={block.text} />
            </blockquote>
          )
        }
        return (
          <p key={index}>
            <Inline text={block.text} />
          </p>
        )
      })}
    </div>
  )
}
