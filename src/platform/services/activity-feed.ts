import { useEffect, useState } from 'react'
import { supabase } from '@platform/supabase'

export type ActivityItem = {
  id: string
  title: string
  type: 'task'
  subtype?: string
  client_slug?: string | null
  updated_at: string
  href: string
}

export function sortActivityItems(
  items: ActivityItem[],
): ActivityItem[] {
  return [...items]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 10)
}

export function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function useActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const taskResult = await supabase
          .from('tasks')
          .select('id, title, status, client_slug, updated_at')
          .order('updated_at', { ascending: false })
          .limit(10)

        if (cancelled) return

        const taskItems: ActivityItem[] = (taskResult.data ?? []).map((t) => ({
          id: t.id as string,
          title: t.title as string,
          type: 'task' as const,
          subtype: t.status as string | undefined,
          client_slug: t.client_slug as string | null | undefined,
          updated_at: t.updated_at as string,
          href: '/tarefas',
        }))

        setItems(sortActivityItems(taskItems))
      } catch {
        // Silently handle — tables may not exist, activity feed is non-critical
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { items, loading }
}
