import type { KnowledgeEntry } from '@/lib/kb-service'

// ---------------------------------------------------------------------------
// KBMetaPanel — metadata side panel for knowledge entry detail page
// ---------------------------------------------------------------------------

interface KBMetaPanelProps {
  entry: KnowledgeEntry
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

export function KBMetaPanel({ entry }: KBMetaPanelProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-card">
      {/* Tipo */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Tipo
        </span>
        <span className="inline-flex">
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {entry.entry_type}
          </span>
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Tags
        </span>
        {entry.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </div>

      {/* Cliente */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Cliente
        </span>
        <span className="text-sm text-slate-900 dark:text-foreground">
          {entry.client_slug ?? '—'}
        </span>
      </div>

      {/* Criado em */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Criado em
        </span>
        <span className="text-sm text-slate-900 dark:text-foreground">
          {dateFormatter.format(new Date(entry.created_at))}
        </span>
      </div>

      {/* Atualizado em */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Atualizado em
        </span>
        <span className="text-sm text-slate-900 dark:text-foreground">
          {dateFormatter.format(new Date(entry.updated_at))}
        </span>
      </div>
    </div>
  )
}
