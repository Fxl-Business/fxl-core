import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@clerk/react'
import { Building2, Plus, RefreshCw, RotateCcw, Archive } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { listTenants, restoreTenant, setClerkTokenGetter } from '@platform/services/tenant-service'
import type { Tenant } from '@platform/types/tenant'
import { CreateTenantDialog } from './CreateTenantDialog'

export default function TenantsPage() {
  const navigate = useNavigate()
  const { session } = useSession()

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Archived state
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')
  const [archivedTenants, setArchivedTenants] = useState<Tenant[]>([])
  const [archivedCount, setArchivedCount] = useState(0)
  const [archivedLoading, setArchivedLoading] = useState(false)

  // Register Clerk token getter for the service
  useEffect(() => {
    if (session) {
      setClerkTokenGetter(() => session.getToken({ template: 'supabase' }))
    }
  }, [session])

  async function fetchActiveTenants() {
    setLoading(true)
    setError(null)
    try {
      const result = await listTenants('active')
      setTenants(result.tenants)
      setTotalCount(result.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tenants')
    } finally {
      setLoading(false)
    }
  }

  async function fetchArchivedTenants() {
    setArchivedLoading(true)
    try {
      const result = await listTenants('archived')
      setArchivedTenants(result.tenants)
      setArchivedCount(result.totalCount)
    } catch (err) {
      console.error('Failed to fetch archived tenants:', err)
    } finally {
      setArchivedLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      void fetchActiveTenants()
      void fetchArchivedTenants()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  function handleRowClick(tenantId: string) {
    navigate(`/admin/tenants/${tenantId}`)
  }

  async function handleRestore(orgId: string) {
    try {
      await restoreTenant(orgId)
      await fetchActiveTenants()
      await fetchArchivedTenants()
      setActiveTab('active')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao restaurar tenant')
    }
  }

  const isActiveTab = activeTab === 'active'
  const currentLoading = isActiveTab ? loading : archivedLoading
  const currentTenants = isActiveTab ? tenants : archivedTenants

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">Tenants</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Organizacoes registradas na plataforma Nexo
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Tenant
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={[
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            isActiveTab
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-foreground'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
          ].join(' ')}
        >
          Ativas
          <span className={[
            'rounded-full px-2 py-0.5 text-xs font-medium',
            isActiveTab
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400'
              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
          ].join(' ')}>
            {totalCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('archived')}
          className={[
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            !isActiveTab
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-foreground'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
          ].join(' ')}
        >
          Arquivadas
          <span className={[
            'rounded-full px-2 py-0.5 text-xs font-medium',
            !isActiveTab
              ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
          ].join(' ')}>
            {archivedCount}
          </span>
        </button>
      </div>

      {/* Loading state */}
      {currentLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-16 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {!currentLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-2"
            onClick={() => {
              if (isActiveTab) void fetchActiveTenants()
              else void fetchArchivedTenants()
            }}
          >
            <RefreshCw className="h-3 w-3" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!currentLoading && !error && currentTenants.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-700">
          {isActiveTab ? (
            <>
              <Building2 className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum tenant encontrado</p>
            </>
          ) : (
            <>
              <Archive className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum tenant arquivado</p>
            </>
          )}
        </div>
      )}

      {/* Tenant list — Active tab */}
      {!currentLoading && !error && isActiveTab && tenants.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card">
          {tenants.map((tenant, idx) => (
            <button
              key={tenant.id}
              type="button"
              onClick={() => handleRowClick(tenant.id)}
              className={[
                'flex w-full items-center gap-4 px-5 py-4 text-left transition-colors',
                'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                idx !== 0 ? 'border-t border-slate-100 dark:border-slate-700/50' : '',
              ].join(' ')}
            >
              {/* Avatar */}
              {tenant.imageUrl ? (
                <img
                  src={tenant.imageUrl}
                  alt={tenant.name}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Building2 className="h-4 w-4" />
                </div>
              )}

              {/* Name + ID */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900 dark:text-foreground">
                  {tenant.name}
                </p>
                <p className="truncate font-mono text-xs text-slate-400 dark:text-slate-500">
                  {tenant.id}
                </p>
              </div>

              {/* Members badge */}
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {tenant.membersCount} {tenant.membersCount === 1 ? 'membro' : 'membros'}
              </span>

              {/* Created date */}
              <span className="hidden shrink-0 text-sm text-slate-400 dark:text-slate-500 sm:block">
                {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Tenant list — Archived tab */}
      {!currentLoading && !error && !isActiveTab && archivedTenants.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card">
          {archivedTenants.map((tenant, idx) => (
            <div
              key={tenant.id}
              className={[
                'flex w-full items-center gap-4 px-5 py-4 opacity-60',
                idx !== 0 ? 'border-t border-slate-100 dark:border-slate-700/50' : '',
              ].join(' ')}
            >
              {/* Avatar */}
              {tenant.imageUrl ? (
                <img
                  src={tenant.imageUrl}
                  alt={tenant.name}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500">
                  <Building2 className="h-4 w-4" />
                </div>
              )}

              {/* Name + ID */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900 dark:text-foreground">
                  {tenant.name}
                </p>
                <p className="truncate font-mono text-xs text-slate-400 dark:text-slate-500">
                  {tenant.id}
                </p>
              </div>

              {/* Archived badge */}
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-500">
                Arquivado
              </span>

              {/* Restore button */}
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 text-xs"
                onClick={(e) => { e.stopPropagation(); void handleRestore(tenant.id) }}
              >
                <RotateCcw className="h-3 w-3" />
                Restaurar
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create Tenant Dialog */}
      <CreateTenantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={() => void fetchActiveTenants()}
      />
    </div>
  )
}
