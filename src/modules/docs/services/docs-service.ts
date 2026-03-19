import { supabase } from '@platform/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DocumentScope = 'tenant' | 'product'

export type DocumentRow = {
  id: string
  title: string
  badge: string
  description: string
  slug: string
  parent_path: string
  body: string
  sort_order: number
  org_id: string
  scope: DocumentScope
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------

let docsCache: DocumentRow[] | null = null
let docsCachePromise: Promise<DocumentRow[]> | null = null

/**
 * Monotonically increasing counter that increments when invalidateDocsCache()
 * is called. Allows React hooks to detect cache invalidation (e.g., org switch)
 * and re-fetch documents with the new JWT.
 */
let cacheVersion = 0

/** Returns the current cache version. Used by useDocsNav to detect invalidation. */
export function getDocsCacheVersion(): number {
  return cacheVersion
}

/**
 * Ensures the full documents list is loaded exactly once.
 * Concurrent callers share the same in-flight promise; subsequent calls
 * resolve instantly from the populated cache.
 */
async function fetchAllDocs(): Promise<DocumentRow[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('parent_path')
      .order('sort_order')

    if (error || !data) return []
    docsCache = data as DocumentRow[]
    return docsCache
  } catch {
    return []
  } finally {
    docsCachePromise = null
  }
}

function ensureCache(): Promise<DocumentRow[]> {
  if (docsCache !== null) {
    return Promise.resolve(docsCache)
  }

  if (docsCachePromise !== null) {
    return docsCachePromise
  }

  docsCachePromise = fetchAllDocs()
  return docsCachePromise
}

/**
 * Clears the in-memory cache so the next call triggers a fresh Supabase fetch.
 * Use after a sync-up operation that may have changed the documents table.
 */
export function invalidateDocsCache(): void {
  docsCache = null
  docsCachePromise = null
  cacheVersion += 1
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch a single document by its slug (e.g., "processo/fases/fase1"). */
export async function getDocBySlug(slug: string): Promise<DocumentRow | null> {
  const docs = await ensureCache()
  return docs.find((d) => d.slug === slug) ?? null
}

/** Fetch all documents ordered by parent_path then sort_order. */
export async function getAllDocuments(): Promise<DocumentRow[]> {
  return ensureCache()
}

/** Fetch documents under a specific parent path, ordered by sort_order. */
export async function getDocsByParentPath(parentPath: string): Promise<DocumentRow[]> {
  const docs = await ensureCache()
  return docs.filter((d) => d.parent_path === parentPath)
}

/** Fetch all product-scoped documents (visible to all tenants). */
export async function getProductDocs(): Promise<DocumentRow[]> {
  const docs = await ensureCache()
  return docs.filter((d) => d.scope === 'product')
}

/** Fetch all tenant-scoped documents for the current tenant (org-isolated). */
export async function getTenantDocs(): Promise<DocumentRow[]> {
  const docs = await ensureCache()
  return docs.filter((d) => d.scope === 'tenant')
}
