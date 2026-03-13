import { useState, useEffect } from 'react'
import { getAllDocuments, type DocumentRow } from '@/lib/docs-service'
import type { NavItem } from '@/modules/registry'

/**
 * Build a NavItem tree from DocumentRow[] matching the exact sidebar structure:
 *
 * Processo (processo/index)
 *   ├── Visao Geral, Prompts, etc. (parent_path = "processo")
 *   └── Fases (processo/fases/index)
 *       └── Fase 1, Fase 2, etc. (parent_path = "processo/fases")
 * Padroes (padroes/index)
 *   ├── Tech Radar (ferramentas/tech-radar)
 *   │   └── Vite+React+TS, etc. (parent_path = "ferramentas/techs")
 *   ├── Premissas, Seguranca, Testes (parent_path = "ferramentas")
 */
function buildNavTree(docs: DocumentRow[]): NavItem[] {
  // Group docs by their parent_path
  const byParentPath = new Map<string, DocumentRow[]>()
  // Also index all docs by slug for quick lookup
  const bySlug = new Map<string, DocumentRow>()

  for (const doc of docs) {
    bySlug.set(doc.slug, doc)
    const group = byParentPath.get(doc.parent_path) ?? []
    group.push(doc)
    byParentPath.set(doc.parent_path, group)
  }

  /**
   * Build children for a given parent_path.
   * For each doc in the group:
   * - If it's an index doc (slug ends with /index), skip it (it's the parent's label/href)
   * - Otherwise, check if there's a sub-index doc that would make this a parent node
   * - Create NavItem with potential children from a deeper parent_path
   */
  function buildChildren(parentPath: string): NavItem[] {
    const group = byParentPath.get(parentPath) ?? []
    const items: NavItem[] = []

    for (const doc of group) {
      // Skip index docs — they are used as the parent node, not children
      if (doc.slug.endsWith('/index') || doc.slug === 'index') continue

      // Check if this doc has children by looking for a sub-index
      // e.g., "processo/fases/fase1" doesn't have children
      // but "ferramentas/tech-radar" might have children at "ferramentas/techs"
      const subParentPath = findSubParentPath(doc, byParentPath)
      if (subParentPath) {
        items.push({
          label: doc.title,
          href: `/${doc.slug}`,
          children: buildChildren(subParentPath),
        })
      } else {
        items.push({
          label: doc.title,
          href: `/${doc.slug}`,
        })
      }
    }

    return items
  }

  // For the top-level sections, find docs that are section indexes
  // Section 1: Processo (badge = "Processo", index at processo/index)
  // Section 2: Padroes (badge = "Padroes", index at padroes/index)
  const sections: NavItem[] = []

  // Build Processo section
  const processoIndex = bySlug.get('processo/index')
  if (processoIndex) {
    // Processo direct children + Fases subsection
    const processoChildren: NavItem[] = []
    const processoDocs = byParentPath.get('processo') ?? []

    for (const doc of processoDocs) {
      if (doc.slug === 'processo/index') continue

      // Check if this is "fases" section index
      if (doc.slug === 'processo/fases/index') {
        // This doesn't exist as a direct child of "processo" parent_path
        // The fases index is at parent_path "processo/fases"
        continue
      }

      processoChildren.push({
        label: doc.title,
        href: `/${doc.slug}`,
      })
    }

    // Add Fases subsection
    const fasesIndex = bySlug.get('processo/fases/index')
    if (fasesIndex) {
      processoChildren.push({
        label: fasesIndex.title,
        href: `/${fasesIndex.slug}`,
        children: buildChildren('processo/fases'),
      })
    }

    // Add Onboarding at the end if it exists (it's under parent_path "processo")
    // It should already be in processoChildren from the loop above

    sections.push({
      label: processoIndex.title,
      href: `/${processoIndex.slug}`,
      children: processoChildren,
    })
  }

  // Build Padroes section
  const padroesIndex = bySlug.get('padroes/index')
  if (padroesIndex) {
    const padroesChildren: NavItem[] = []

    // Tech Radar (ferramentas/tech-radar) with children from ferramentas/techs
    const techRadar = bySlug.get('ferramentas/tech-radar')
    if (techRadar) {
      padroesChildren.push({
        label: techRadar.title,
        href: `/${techRadar.slug}`,
        children: buildChildren('ferramentas/techs'),
      })
    }

    // Other ferramentas docs (not index, not tech-radar, not wireframe-builder, not branding-collection)
    // These are: premissas-gerais, seguranca, testes
    const ferramentasDocs = byParentPath.get('ferramentas') ?? []
    for (const doc of ferramentasDocs) {
      if (doc.slug === 'ferramentas/index') continue
      if (doc.slug === 'ferramentas/tech-radar') continue
      // Skip docs that belong to the Ferramentas module (wireframe-builder, branding-collection)
      // Only include docs with badge "Padroes" in the Padroes section
      if (doc.badge !== 'Padroes') continue
      padroesChildren.push({
        label: doc.title,
        href: `/${doc.slug}`,
      })
    }

    sections.push({
      label: 'Padroes',
      href: `/${padroesIndex.slug}`,
      children: padroesChildren,
    })
  }

  return sections
}

/**
 * Check if a doc has a sub-parent path that contains children.
 * This handles cases like "ferramentas/tech-radar" being a parent for "ferramentas/techs/*".
 *
 * The mapping is: a doc at slug "X/Y" may have children at parent_path "X/Y" or a related path.
 * In practice the only case in our tree is tech-radar -> techs.
 */
function findSubParentPath(
  doc: DocumentRow,
  byParentPath: Map<string, DocumentRow[]>,
): string | null {
  // Check if doc.slug itself is a parent_path for other docs
  if (byParentPath.has(doc.slug) && (byParentPath.get(doc.slug)?.length ?? 0) > 0) {
    return doc.slug
  }
  return null
}

/**
 * Hook that fetches all documents from Supabase and builds a NavItem[] tree
 * for the docs module sidebar.
 *
 * Returns empty array while loading — Sidebar falls back to hardcoded navChildren.
 * Once loaded, returns the dynamic tree matching the exact current structure.
 */
export function useDocsNav(): NavItem[] {
  const [navItems, setNavItems] = useState<NavItem[]>([])

  useEffect(() => {
    let cancelled = false

    getAllDocuments()
      .then((docs) => {
        if (cancelled) return
        const tree = buildNavTree(docs)
        setNavItems(tree)
      })
      .catch(() => {
        // On error, return empty — Sidebar falls back to hardcoded nav
      })

    return () => {
      cancelled = true
    }
  }, [])

  return navItems
}
