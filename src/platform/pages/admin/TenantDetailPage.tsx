import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSession } from '@clerk/react'
import { ArrowLeft, Building2, Users, Calendar, Shield, Code2 } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { getTenantDetail, setClerkTokenGetter } from '@platform/services/tenant-service'
import type { TenantDetail } from '@platform/types/tenant'

// ---------------------------------------------------------------------------
// Info card component
// ---------------------------------------------------------------------------

function InfoCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-card">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function TenantDetailPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const navigate = useNavigate()
  const { session } = useSession()

  const [tenant, setTenant] = useState<TenantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Register Clerk token getter for the service
  useEffect(() => {
    if (session) {
      setClerkTokenGetter(() => session.getToken())
    }
  }, [session])

  useEffect(() => {
    if (!orgId) {
      navigate('/admin/tenants', { replace: true })
      return
    }
    if (!session) return

    let cancelled = false

    async function fetchDetail() {
      setLoading(true)
      setError(null)
      try {
        const data = await getTenantDetail(orgId!)
        if (!cancelled) setTenant(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar tenant')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDetail()
    return () => { cancelled = true }
  }, [orgId, session, navigate])

  // ----- Loading state -----
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-16 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  // ----- Error state -----
  if (error) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => navigate('/admin/tenants')}
          >
            Voltar para Tenants
          </Button>
        </div>
      </div>
    )
  }

  if (!tenant) return null

  const publicMetadataEmpty =
    !tenant.publicMetadata || Object.keys(tenant.publicMetadata).length === 0

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Back link */}
      <Link
        to="/admin/tenants"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar para Tenants
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        {tenant.imageUrl ? (
          <img
            src={tenant.imageUrl}
            alt={tenant.name}
            className="h-16 w-16 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Building2 className="h-8 w-8" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">{tenant.name}</h1>
          {tenant.slug && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">/{tenant.slug}</p>
          )}
          <p className="mt-1 font-mono text-xs text-slate-400 dark:text-slate-500">{tenant.id}</p>
        </div>
      </div>

      {/* Info cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoCard
          label="Membros"
          value={tenant.membersCount}
          icon={Users}
        />
        <InfoCard
          label="Criado em"
          value={new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
          icon={Calendar}
        />
        <InfoCard
          label="Max membros"
          value={tenant.maxAllowedMemberships ?? 'Ilimitado'}
          icon={Shield}
        />
      </div>

      {/* Public metadata */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
          Metadados
        </h2>
        {publicMetadataEmpty ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum metadado publico</p>
        ) : (
          <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm font-mono text-slate-700 dark:text-slate-300">
            {JSON.stringify(tenant.publicMetadata, null, 2)}
          </pre>
        )}
      </div>

      {/* Modules section (placeholder) */}
      <div className="rounded-xl border border-dashed border-slate-200 p-6 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <Code2 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-foreground">
              Modulos Habilitados
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Controle de modulos sera implementado na Phase 78
            </p>
          </div>
        </div>
      </div>

      {/* Connectors section (placeholder) */}
      <div className="rounded-xl border border-dashed border-slate-200 p-6 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-foreground">
              Conectores
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Conectores do tenant serao exibidos aqui
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
