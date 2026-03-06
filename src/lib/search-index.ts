import { getAllDocPaths, getDoc } from './docs-parser'

export type SearchEntry = {
  title: string
  description?: string
  badge?: string
  href: string
}

export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = []
  for (const path of getAllDocPaths()) {
    const doc = getDoc(path)
    if (!doc) continue
    entries.push({
      title: doc.frontmatter.title,
      description: doc.frontmatter.description,
      badge: doc.frontmatter.badge,
      href: path,
    })
  }
  return entries
}
