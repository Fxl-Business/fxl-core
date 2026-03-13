import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookMarked } from 'lucide-react'
import type { SlotComponentProps } from '@/modules/registry'
import { supabase } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type KnowledgeEntryType = 'bug' | 'decision' | 'pattern' | 'lesson'

interface KBEntryRow {
  id: string
  title: string
  entry_type: KnowledgeEntryType
  updated_at: string
}

// ---------------------------------------------------------------------------
// Constants — inline to keep extension self-contained (no cross-module import)
// ---------------------------------------------------------------------------

const TYPE_COLORS: Record<string, string> = {
  bug: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
  decision: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  pattern: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  lesson: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
}

const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug',
  decision: 'Decisao',
  pattern: 'Padrao',
  lesson: 'Licao',
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function relativeDate(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays}d atras`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RecentKBWidget({ className }: SlotComponentProps) {
  const [entries, setEntries] = useState<KBEntryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchEntries() {
      setLoading(true)
      const { data } = await supabase
        .from('knowledge_entries')
        .select('id, title, entry_type, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5)

      if (!cancelled && data) {
        setEntries(
          data.map((row) => ({
            id: row.id as string,
            title: row.title as string,
            entry_type: row.entry_type as KnowledgeEntryType,
            updated_at: row.updated_at as string,
          })),
        )
      }
      if (!cancelled) setLoading(false)
    }

    void fetchEntries()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card${className ? ` ${className}` : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
            Base de Conhecimento
          </span>
        </div>
        <Link
          to="/knowledge-base"
          className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Ver todas
        </Link>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
        </div>
      ) : entries.length === 0 ? (
        <p className="p-4 text-sm text-slate-400 dark:text-slate-500">Nenhuma entrada recente.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-foreground">
                  {entry.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TYPE_COLORS[entry.entry_type] ?? TYPE_COLORS.lesson}`}
                  >
                    {TYPE_LABELS[entry.entry_type] ?? entry.entry_type}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {relativeDate(entry.updated_at)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
