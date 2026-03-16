import { getAllDocuments, type DocumentRow } from './docs-service'

export type SearchEntry = {
  title: string
  description?: string
  badge?: string
  href: string
}

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const docs = await getAllDocuments()
  return docs.map((doc: DocumentRow) => ({
    title: doc.title,
    description: doc.description ?? undefined,
    badge: doc.badge ?? undefined,
    href: `/${doc.slug}`,
  }))
}
