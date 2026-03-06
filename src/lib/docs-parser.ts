import yaml from 'yaml'

const docFiles = import.meta.glob('/docs/**/*.md', { query: '?raw', import: 'default', eager: true })

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

export type ParsedDoc = {
  frontmatter: DocFrontmatter
  sections: DocSection[]
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

const TAG_REGEX = /\{%\s*(\/?\s*[\w][\w-]*)((?:\s+\w+\s*=\s*(?:"[^"]*"|\d+))*)\s*(\/?)%\}/g

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

export function getDoc(urlPath: string): ParsedDoc | null {
  const cleanPath = urlPath.replace(/^\//, '').replace(/\/$/, '')
  const filePath = `/docs/${cleanPath}.md`
  const raw = docFiles[filePath] as string | undefined
  if (!raw) return null

  const { frontmatter, body } = extractFrontmatter(raw)
  const sections = parseBody(body)
  return { frontmatter, sections }
}

export function getAllDocPaths(): string[] {
  return Object.keys(docFiles).map((fp) => fp.replace('/docs/', '/').replace('.md', ''))
}
