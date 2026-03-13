import yaml from 'yaml'
import type { DocumentRow } from './docs-service'

export type DocFrontmatter = {
  title: string
  badge?: string
  description?: string
}

export type DocSection =
  | { type: 'markdown'; content: string }
  | { type: 'prompt'; label: string; content: string }
  | { type: 'callout'; variant: 'info' | 'warning'; content: string }
  | { type: 'operational'; content: string }
  | { type: 'phase-card'; number: number; title: string; description: string; href: string }

export type DocHeading = {
  id: string
  text: string
  level: 2 | 3
}

export type ParsedDoc = {
  frontmatter: DocFrontmatter
  sections: DocSection[]
  headings: DocHeading[]
  rawBody: string
}

function extractFrontmatter(raw: string): { frontmatter: DocFrontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { frontmatter: { title: '' }, body: raw }
  return {
    frontmatter: yaml.parse(match[1]) as DocFrontmatter,
    body: match[2],
  }
}

function parseAttributes(attrString: string): Record<string, string | number> {
  const attrs: Record<string, string | number> = {}
  const attrRegex = /(\w+)\s*=\s*(?:"([^"]*)"|(\d+))/g
  let m: RegExpExecArray | null
  while ((m = attrRegex.exec(attrString)) !== null) {
    attrs[m[1]] = m[3] !== undefined ? Number(m[3]) : m[2]
  }
  return attrs
}

const TAG_REGEX = /\{%\s*(\/?\s*[\w][\w-]*)((?:\s+\w+\s*=\s*(?:"[^"]*"|\d+))*)\s*(\/)?\s*%\}/g

function parseBody(body: string): DocSection[] {
  const sections: DocSection[] = []
  let lastIndex = 0
  const tagStack: { tagName: string; attrs: Record<string, string | number>; contentStart: number }[] = []

  TAG_REGEX.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = TAG_REGEX.exec(body)) !== null) {
    const [fullMatch, tagNameRaw, attrString, selfClose] = match
    const tagName = tagNameRaw.trim()
    const matchStart = match.index
    const matchEnd = match.index + fullMatch.length

    if (selfClose === '/') {
      const before = body.slice(lastIndex, matchStart).trim()
      if (before) sections.push({ type: 'markdown', content: before })

      const attrs = parseAttributes(attrString)
      if (tagName === 'phase-card') {
        sections.push({
          type: 'phase-card',
          number: attrs.number as number,
          title: attrs.title as string,
          description: attrs.description as string,
          href: attrs.href as string,
        })
      }
      lastIndex = matchEnd
      continue
    }

    if (tagName.startsWith('/')) {
      const closingName = tagName.slice(1).trim()
      const openTag = tagStack.pop()
      if (openTag && openTag.tagName === closingName) {
        const innerContent = body.slice(openTag.contentStart, matchStart).trim()
        const attrs = openTag.attrs

        switch (closingName) {
          case 'prompt':
            sections.push({ type: 'prompt', label: (attrs.label as string) || '', content: innerContent })
            break
          case 'callout':
            sections.push({ type: 'callout', variant: (attrs.type as 'info' | 'warning') || 'info', content: innerContent })
            break
          case 'operational':
            sections.push({ type: 'operational', content: innerContent })
            break
          default:
            sections.push({ type: 'markdown', content: innerContent })
        }
      }
      lastIndex = matchEnd
      continue
    }

    if (tagStack.length === 0) {
      const before = body.slice(lastIndex, matchStart).trim()
      if (before) sections.push({ type: 'markdown', content: before })
    }

    tagStack.push({
      tagName,
      attrs: parseAttributes(attrString),
      contentStart: matchEnd,
    })
    lastIndex = matchEnd
  }

  const remaining = body.slice(lastIndex).trim()
  if (remaining) sections.push({ type: 'markdown', content: remaining })

  return sections
}

export function extractHeadings(markdown: string): DocHeading[] {
  const lines = markdown.split('\n')
  return lines
    .filter(line => /^#{2,3}\s/.test(line))
    .map(line => {
      const level: 2 | 3 = line.startsWith('### ') ? 3 : 2
      const text = line.replace(/^#{2,3}\s+/, '').trim()
      const id = text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      return { id, text, level }
    })
}

/** Parse a DocumentRow from Supabase into a ParsedDoc. */
export function parseDoc(row: DocumentRow): ParsedDoc {
  const frontmatter: DocFrontmatter = {
    title: row.title,
    ...(row.badge && { badge: row.badge }),
    ...(row.description && { description: row.description }),
  }
  const sections = parseBody(row.body)
  const headings = extractHeadings(row.body)
  return { frontmatter, sections, headings, rawBody: row.body }
}

/** Parse raw markdown string (with frontmatter) into a ParsedDoc. Used by sync CLI. */
export function parseRawMarkdown(raw: string): ParsedDoc {
  const { frontmatter, body } = extractFrontmatter(raw)
  const sections = parseBody(body)
  const headings = extractHeadings(body)
  return { frontmatter, sections, headings, rawBody: body }
}

