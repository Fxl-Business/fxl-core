import { useState } from 'react'
import { toast } from 'sonner'
import { MODULE_REGISTRY } from '@/modules/registry'
import type { ModuleDefinition } from '@/modules/registry'
import { Switch } from '@/components/ui/switch'

// ---------------------------------------------------------------------------
// Enabled-modules local state hook (localStorage-backed, synchronous init)
// ---------------------------------------------------------------------------

function useEnabledModules() {
  const [enabledIds, setEnabledIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('fxl-enabled-modules')
    if (saved) {
      try {
        return JSON.parse(saved) as string[]
      } catch {
        /* fall through to default */
      }
    }
    return MODULE_REGISTRY.filter(m => m.enabled !== false).map(m => m.id)
  })

  function toggleModule(moduleId: string) {
    setEnabledIds(prev => {
      const next = prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
      localStorage.setItem('fxl-enabled-modules', JSON.stringify(next))
      return next
    })
  }

  return { enabledIds, toggleModule }
}

// ---------------------------------------------------------------------------
// Status badge helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  beta: 'Beta',
  'coming-soon': 'Em breve',
}

const STATUS_CLASSES: Record<string, string> = {
  active:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  beta: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  'coming-soon':
    'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
}

// ---------------------------------------------------------------------------
// Module card component
// ---------------------------------------------------------------------------

interface ModuleCardProps {
  mod: ModuleDefinition
  isEnabled: boolean
  onToggle: (id: string, enabled: boolean) => void
}

function ModuleCard({ mod, isEnabled, onToggle }: ModuleCardProps) {
  const Icon = mod.icon
  const extensions = mod.extensions ?? []

  return (
    <div className="rounded-xl border bg-white p-5 dark:bg-card dark:border-slate-700">
      {/* Top row: icon + label + status badge */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-foreground">
              {mod.label}
            </span>
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_CLASSES[mod.status] ?? STATUS_CLASSES.active}`}
            >
              {STATUS_LABELS[mod.status] ?? mod.status}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {mod.description}
          </p>
        </div>
      </div>

      {/* Toggle row */}
      <div className="mt-4 flex items-center gap-2">
        <Switch
          checked={isEnabled}
          onCheckedChange={checked => onToggle(mod.id, checked)}
        />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {isEnabled ? 'Ativo' : 'Desativado'}
        </span>
      </div>

      {/* Extensions section */}
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Extensoes
        </p>
        {extensions.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Nenhuma extensao registrada
          </p>
        ) : (
          <ul className="space-y-2">
            {extensions.map(ext => {
              const slotIds = Object.keys(ext.injects)
              return (
                <li key={ext.id} className="text-xs">
                  <div className="flex items-start gap-1.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400 dark:bg-indigo-500" />
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {ext.id}
                      </span>
                      <p className="text-slate-500 dark:text-slate-400">
                        {ext.description}
                      </p>
                      {slotIds.length > 0 && (
                        <p className="text-slate-400 dark:text-slate-500">
                          Slot:{' '}
                          <span className="font-mono">
                            {slotIds.join(', ')}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ModulesPanel page
// ---------------------------------------------------------------------------

export default function ModulesPanel() {
  const { enabledIds, toggleModule } = useEnabledModules()

  const activeCount = MODULE_REGISTRY.filter(m =>
    enabledIds.includes(m.id),
  ).length
  const total = MODULE_REGISTRY.length

  function handleToggle(moduleId: string, checked: boolean) {
    toggleModule(moduleId)
    const mod = MODULE_REGISTRY.find(m => m.id === moduleId)
    const label = mod?.label ?? moduleId
    if (checked) {
      toast.success(`Modulo "${label}" ativado`)
    } else {
      toast(`Modulo "${label}" desativado`)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">
            Modulos
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gerencie os modulos ativos da plataforma.
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
          {activeCount} de {total} ativos
        </span>
      </div>

      {/* Module cards grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {MODULE_REGISTRY.map(mod => (
          <ModuleCard
            key={mod.id}
            mod={mod}
            isEnabled={enabledIds.includes(mod.id)}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  )
}
