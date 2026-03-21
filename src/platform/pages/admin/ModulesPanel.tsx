import { Blocks } from 'lucide-react'

// Re-export shared status constants for backward compatibility
export { STATUS_LABELS, STATUS_CLASSES } from './module-status-constants'

// ---------------------------------------------------------------------------
// ModulesPanel — scaffold for upcoming module overview (Phase 140 + 141)
// ---------------------------------------------------------------------------

export default function ModulesPanel() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">
          Modulos
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Visao geral dos modulos da plataforma.
        </p>
      </div>

      {/* Placeholder — will be replaced by diagram (Phase 140) and card grid (Phase 141) */}
      <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-700">
        <Blocks className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Visao geral dos modulos sera adicionada em breve
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Gerencie modulos por tenant na pagina de detalhes do tenant.
        </p>
      </div>
    </div>
  )
}
