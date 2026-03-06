import Markdoc, { type RenderableTreeNode } from '@markdoc/markdoc'
import yaml from 'yaml'
import markdocConfig from '../../markdoc.config'

// Import all .md files from docs/ as raw strings
const docFiles = import.meta.glob('/docs/**/*.md', { query: '?raw', import: 'default', eager: true })

export type DocFrontmatter = {
  title: string
  badge?: string
  description?: string
}

export type ParsedDoc = {
  frontmatter: DocFrontmatter
  content: RenderableTreeNode
}

/**
 * Resolve a URL path to a doc file path.
 * Example: /processo/master → /docs/processo/master.md
 */
export function getDoc(urlPath: string): ParsedDoc | null {
  // Normalize: remove leading slash, add /docs/ prefix and .md suffix
  const cleanPath = urlPath.replace(/^\//, '').replace(/\/$/, '')
  const filePath = `/docs/${cleanPath}.md`

  const raw = docFiles[filePath] as string | undefined
  if (!raw) return null

  // Parse frontmatter
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  let frontmatter: DocFrontmatter = { title: '' }
  let body = raw

  if (frontmatterMatch) {
    frontmatter = yaml.parse(frontmatterMatch[1]) as DocFrontmatter
    body = frontmatterMatch[2]
  }

  // Parse and transform with Markdoc
  const ast = Markdoc.parse(body)
  const content = Markdoc.transform(ast, markdocConfig)

  return { frontmatter, content }
}

/**
 * Get all available doc paths for generating navigation.
 */
export function getAllDocPaths(): string[] {
  return Object.keys(docFiles).map((filePath) =>
    filePath.replace('/docs/', '/').replace('.md', '')
  )
}
