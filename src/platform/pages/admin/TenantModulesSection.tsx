import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MODULE_REGISTRY } from '@platform/module-loader/registry'
import type { ModuleId } from '@platform/module-loader/module-ids'
import { MODULE_IDS } from '@platform/module-loader/module-ids'
import { supabase } from '@platform/supabase'
import { Switch } from '@shared/ui/switch'

const ALL_MODULE_IDS: ModuleId[] = Object.values(MODULE_IDS)

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
// TenantModulesSection — inline module toggles for a single tenant
// ---------------------------------------------------------------------------

interface TenantModulesSectionProps {
  orgId: string
}

export default function TenantModulesSection({ orgId }: TenantModulesSectionProps) {
  const [moduleStates, setModuleStates] = useState<Map<string, boolean>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchKey, setRefetchKey] = useState(0)

  // Fetch module states from Supabase when orgId changes or retry requested
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    async function fetchModuleStates() {
      const { data, error: fetchError } = await supabase
        .from('tenant_modules')
        .select('module_id, enabled')
        .eq('org_id', orgId)

      if (cancelled) return

      if (fetchError) {
        setError('Erro ao carregar modulos do tenant')
        setIsLoading(false)
        return
      }

      // Build map: modules in DB use stored value, others default to true (opt-out model)
      const states = new Map<string, boolean>()
      const modulesInDb = new Set<string>()

      if (data) {
        for (const row of data) {
          modulesInDb.add(row.module_id)
          states.set(row.module_id, row.enabled)
        }
      }

      for (const moduleId of ALL_MODULE_IDS) {
        if (!modulesInDb.has(moduleId)) {
          states.set(moduleId, true)
        }
      }

      setModuleStates(states)
      setIsLoading(false)
    }

    void fetchModuleStates()
    return () => { cancelled = true }
  }, [orgId, refetchKey])

  const handleToggle = useCallback(async (moduleId: string, checked: boolean) => {
    const mod = MODULE_REGISTRY.find(m => m.id === moduleId)
    const label = mod?.label ?? moduleId

    // Optimistic update
    setModuleStates(prev => {
      const next = new Map(prev)
      next.set(moduleId, checked)
      return next
    })

    const { error: upsertError } = await supabase
      .from('tenant_modules')
      .upsert(
        { org_id: orgId, module_id: moduleId, enabled: checked },
        { onConflict: 'org_id,module_id' },
      )

    if (upsertError) {
      // Revert optimistic update
      setModuleStates(prev => {
        const next = new Map(prev)
        next.set(moduleId, !checked)
        return next
      })
      toast.error('Erro ao atualizar modulo')
      return
    }

    if (checked) {
      toast.success(`Modulo "${label}" ativado para este tenant`)
    } else {
      toast(`Modulo "${label}" desativado para este tenant`)
    }
  }, [orgId])

  const activeCount = MODULE_REGISTRY.filter(m => moduleStates.get(m.id) ?? true).length
  const total = MODULE_REGISTRY.length

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
          Modulos
        </h2>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
          {activeCount} de {total} ativos
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => setRefetchKey(k => k + 1)}
            className="mt-2 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Module list */}
      {!isLoading && !error && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card">
          {MODULE_REGISTRY.map((mod, idx) => {
            const Icon = mod.icon
            const isEnabled = moduleStates.get(mod.id) ?? true
            return (
              <div
                key={mod.id}
                className={[
                  'flex items-center gap-3 px-4 py-3',
                  idx !== 0 ? 'border-t border-slate-100 dark:border-slate-700/50' : '',
                ].join(' ')}
              >
                {/* Module icon */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <Icon className="h-4 w-4" />
                </div>

                {/* Label + status badge */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-foreground">
                      {mod.label}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_CLASSES[mod.status] ?? STATUS_CLASSES.active}`}
                    >
                      {STATUS_LABELS[mod.status] ?? mod.status}
                    </span>
                  </div>
                </div>

                {/* Toggle */}
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {isEnabled ? 'Ativo' : 'Desativado'}
                  </span>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={checked => void handleToggle(mod.id, checked)}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
