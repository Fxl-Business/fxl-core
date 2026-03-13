import { Link } from 'react-router-dom'
import { BookOpen, Bug, Scale, Lightbulb } from 'lucide-react'
import type { KnowledgeEntry, KnowledgeEntryType } from '@/lib/kb-service'

// ---------------------------------------------------------------------------
// Icon map per entry type
// ---------------------------------------------------------------------------

const TYPE_ICONS: Record<KnowledgeEntryType, React.ComponentType<{ className?: string }>> = {
  pattern: BookOpen,
  bug: Bug,
  decision: Scale,
  lesson: Lightbulb,
}

// ---------------------------------------------------------------------------
// KBEntryCard
// ---------------------------------------------------------------------------

interface KBEntryCardProps {
  entry: KnowledgeEntry
}

export function KBEntryCard({ entry }: KBEntryCardProps) {
  const Icon = TYPE_ICONS[entry.entry_type]

  return (
    <Link to={`/knowledge-base/${entry.id}`} className="h-full">
      <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card">
        {/* Type badge + client slug */}
        <div className="mb-2 flex items-center gap-2">
          <Icon className="h-3 w-3 shrink-0 text-slate-500 dark:text-slate-400" />
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {entry.entry_type}
          </span>
          {entry.client_slug && (
            <span className="text-[10px] text-slate-400">{entry.client_slug}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">
          {entry.title}
        </h3>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Date */}
        <p className="mt-auto pt-3 text-[10px] text-slate-400">
          {new Date(entry.created_at).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </Link>
  )
}
