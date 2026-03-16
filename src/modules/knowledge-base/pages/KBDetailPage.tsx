import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@shared/ui/button'
import MarkdownRenderer from '@/components/docs/MarkdownRenderer'
import { useKBEntry } from '../hooks/useKBEntry'
import { KBMetaPanel } from '../components/KBMetaPanel'

// ---------------------------------------------------------------------------
// KBDetailPage — /knowledge-base/:id
// ---------------------------------------------------------------------------

export default function KBDetailPage() {
  // ALL hooks before conditional returns (project memory rule)
  const { id } = useParams<{ id: string }>()
  const { entry, loading, error } = useKBEntry(id)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/knowledge-base"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para a lista
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/20 dark:text-red-400">
          Erro ao carregar entrada: {error}
        </div>
      )}

      {/* Not found */}
      {!loading && !error && !entry && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-slate-500">Entrada nao encontrada.</p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link to="/knowledge-base">Voltar para a lista</Link>
          </Button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && entry && (
        <>
          {/* Header: title + edit */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
              {entry.title}
            </h1>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/knowledge-base/${entry.id}/edit`}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Editar
              </Link>
            </Button>
          </div>

          {/* Two-column layout: body (2/3) + metadata (1/3) */}
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Left: Markdown body */}
            <div className="flex-1 min-w-0">
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-card">
                <MarkdownRenderer content={entry.body} />
              </div>
            </div>

            {/* Right: Metadata panel */}
            <div className="w-full lg:w-72 shrink-0">
              <KBMetaPanel entry={entry} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
