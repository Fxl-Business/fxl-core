import { useState, useEffect } from 'react'
import type { NavItem } from '@platform/module-loader/registry'
import { listProjects } from '../services/projects-service'

/**
 * Hook that fetches all projects from Supabase and builds NavItem[]
 * for the projects module sidebar.
 *
 * Each project becomes an expandable item with sub-items:
 *   Briefing, Blueprint, Wireframe, Branding
 *
 * Returns empty array while loading — Sidebar renders nothing for projects
 * until loaded.
 */
export function useProjectsNav(): { items: NavItem[]; isLoading: boolean } {
  const [items, setItems] = useState<NavItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    listProjects()
      .then((projects) => {
        if (cancelled) return

        const projectItems: NavItem[] = projects.map((p) => ({
          label: p.name,
          href: `/projetos/${p.slug}`,
          children: [
            { label: 'Briefing', href: `/projetos/${p.slug}/briefing` },
            { label: 'Blueprint', href: `/projetos/${p.slug}/blueprint` },
            { label: 'Wireframe', href: `/projetos/${p.slug}/wireframe` },
            { label: 'Branding', href: `/projetos/${p.slug}/branding` },
          ],
        }))

        setItems(projectItems)
        setIsLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { items, isLoading }
}
