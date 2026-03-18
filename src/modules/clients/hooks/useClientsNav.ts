import { useState, useEffect } from 'react'
import type { NavItem } from '@platform/module-loader/registry'
import { listClients } from '../services/clients-service'

/**
 * Hook that fetches all clients from Supabase and builds NavItem[]
 * for the clients module sidebar.
 *
 * Each client becomes a leaf link: /clientes/:slug
 *
 * Returns empty array while loading — Sidebar renders nothing for clients
 * until loaded.
 */
export function useClientsNav(): { items: NavItem[]; isLoading: boolean } {
  const [items, setItems] = useState<NavItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    listClients()
      .then((clients) => {
        if (cancelled) return

        const clientItems: NavItem[] = clients.map((c) => ({
          label: c.name,
          href: `/clientes/${c.slug}`,
        }))

        setItems(clientItems)
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
