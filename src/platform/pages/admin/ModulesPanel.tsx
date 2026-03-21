import { useCallback, useMemo, useState } from 'react'
import { MODULE_REGISTRY } from '@platform/module-loader/registry'
import ModuleDiagram from './components/ModuleDiagram'
import { ModuleOverviewCard } from './ModuleOverviewCard'

// Re-export shared status constants for backward compatibility
export { STATUS_LABELS, STATUS_CLASSES } from './module-status-constants'

export default function ModulesPanel() {
  const modules = useMemo(() => MODULE_REGISTRY, [])
  const [highlightedModuleId, setHighlightedModuleId] = useState<string | null>(null)

  const handleNodeClick = useCallback((moduleId: string) => {
    const el = document.getElementById(`module-card-${moduleId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedModuleId(moduleId)
      setTimeout(() => setHighlightedModuleId(null), 2000)
    }
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">
          Modulos
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Visao geral dos modulos da plataforma.
        </p>
      </div>

      {/* Module dependency diagram */}
      <ModuleDiagram onNodeClick={handleNodeClick} />

      {/* Module card grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <ModuleOverviewCard
            key={mod.id}
            mod={mod}
            highlighted={highlightedModuleId === mod.id}
          />
        ))}
      </div>
    </div>
  )
}
