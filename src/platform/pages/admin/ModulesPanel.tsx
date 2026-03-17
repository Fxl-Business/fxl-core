import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MODULE_REGISTRY } from '@platform/module-loader/registry'
import type { ModuleDefinition } from '@platform/module-loader/registry'
import type { ModuleId } from '@platform/module-loader/module-ids'
import { MODULE_IDS } from '@platform/module-loader/module-ids'
import { supabase } from '@platform/supabase'
import { useActiveOrg } from '@platform/tenants/useActiveOrg'
import { Switch } from '@shared/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import { Loader2 } from 'lucide-react'

const ALL_MODULE_IDS: ModuleId[] = Object.values(MODULE_IDS)

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
// ModulesPanel page — Supabase-backed, per-tenant module management
// ---------------------------------------------------------------------------

export default function ModulesPanel() {
  const { orgs, isLoading: orgsLoading } = useActiveOrg()
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [moduleStates, setModuleStates] = useState<Map<string, boolean>>(new Map())
  const [isLoadingModules, setIsLoadingModules] = useState(false)

  // Fetch module states from Supabase when selected org changes
  useEffect(() => {
    if (!selectedOrgId) return

    let cancelled = false
    setIsLoadingModules(true)

    async function fetchModuleStates(orgId: string) {
      const { data, error } = await supabase
        .from('tenant_modules')
        .select('module_id, enabled')
        .eq('org_id', orgId)

      if (cancelled) return

      if (error) {
        toast.error('Erro ao carregar modulos do tenant')
        setIsLoadingModules(false)
        return
      }

      // Build map: modules in DB use their stored value, others default to true (opt-out model)
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
      setIsLoadingModules(false)
    }

    fetchModuleStates(selectedOrgId)
    return () => { cancelled = true }
  }, [selectedOrgId])

  const selectedOrg = orgs.find(o => o.id === selectedOrgId)

  const activeCount = MODULE_REGISTRY.filter(m =>
    moduleStates.get(m.id) ?? true,
  ).length
  const total = MODULE_REGISTRY.length

  const handleToggle = useCallback(async (moduleId: string, checked: boolean) => {
    if (!selectedOrgId) return

    const mod = MODULE_REGISTRY.find(m => m.id === moduleId)
    const label = mod?.label ?? moduleId
    const orgName = selectedOrg?.name ?? selectedOrgId

    // Optimistic update
    setModuleStates(prev => {
      const next = new Map(prev)
      next.set(moduleId, checked)
      return next
    })

    const { error } = await supabase
      .from('tenant_modules')
      .upsert(
        { org_id: selectedOrgId, module_id: moduleId, enabled: checked },
        { onConflict: 'org_id,module_id' }
      )

    if (error) {
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
      toast.success(`Modulo "${label}" ativado para ${orgName}`)
    } else {
      toast(`Modulo "${label}" desativado para ${orgName}`)
    }
  }, [selectedOrgId, selectedOrg])

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">
            Modulos
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gerencie os modulos ativos por tenant.
          </p>
        </div>
        {selectedOrgId && (
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
            {activeCount} de {total} ativos
          </span>
        )}
      </div>

      {/* Tenant selector */}
      <div className="w-full max-w-sm">
        {orgsLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando tenants...
          </div>
        ) : (
          <Select
            value={selectedOrgId ?? ''}
            onValueChange={setSelectedOrgId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tenant" />
            </SelectTrigger>
            <SelectContent>
              {orgs.map(org => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Content */}
      {!selectedOrgId && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Selecione um tenant para gerenciar modulos.
        </p>
      )}

      {selectedOrgId && isLoadingModules && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {selectedOrgId && !isLoadingModules && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {MODULE_REGISTRY.map(mod => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              isEnabled={moduleStates.get(mod.id) ?? true}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
