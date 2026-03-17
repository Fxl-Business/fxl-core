import { useEffect, useState } from 'react'
import { Building2, Users, Blocks, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useOrganizationList } from '@clerk/react'
import { MODULE_REGISTRY } from '@platform/module-loader/registry'
import { supabase } from '@platform/supabase'
import { Separator } from '@shared/ui/separator'

// ---------------------------------------------------------------------------
// Internal components (not exported)
// ---------------------------------------------------------------------------

function MetricCard({
  label,
  value,
  icon: Icon,
  href,
  loading,
}: {
  label: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  loading?: boolean
}) {
  const content = (
    <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card dark:hover:border-indigo-800">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Icon className="h-5 w-5" />
        </div>
        {href && <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
      </div>
      <div className="mt-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        {loading ? (
          <div className="mt-1 h-8 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        ) : (
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-foreground">{value}</p>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link to={href} className="block">{content}</Link>
  }
  return content
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function AdminDashboard() {
  const { userMemberships, isLoaded: isOrgsLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  })

  // Tenant count = number of Clerk organizations the super admin belongs to
  const tenantCount = userMemberships?.data?.length ?? 0

  // User count = sum of membersCount across all orgs
  const userCount = userMemberships?.data?.reduce((sum, m) => {
    return sum + (m.organization.membersCount ?? 0)
  }, 0) ?? 0

  // Per-tenant module average from Supabase tenant_modules table
  const totalModuleCount = MODULE_REGISTRY.length
  const [avgModulesPerTenant, setAvgModulesPerTenant] = useState<number | null>(null)
  const [modulesLoading, setModulesLoading] = useState(true)

  useEffect(() => {
    if (!isOrgsLoaded || tenantCount === 0) {
      setModulesLoading(false)
      return
    }

    const orgIds = (userMemberships?.data ?? []).map(m => m.organization.id)

    async function fetchModuleStats() {
      const { data, error } = await supabase
        .from('tenant_modules')
        .select('org_id, module_id, enabled')
        .in('org_id', orgIds)

      if (error || !data) {
        // Fallback: all modules enabled for all tenants
        setAvgModulesPerTenant(totalModuleCount)
        setModulesLoading(false)
        return
      }

      // Group by org_id and count enabled modules per tenant
      const perOrg = new Map<string, Set<string>>()
      const disabledPerOrg = new Map<string, Set<string>>()

      for (const row of data) {
        if (row.enabled) {
          if (!perOrg.has(row.org_id)) perOrg.set(row.org_id, new Set())
          perOrg.get(row.org_id)!.add(row.module_id)
        } else {
          if (!disabledPerOrg.has(row.org_id)) disabledPerOrg.set(row.org_id, new Set())
          disabledPerOrg.get(row.org_id)!.add(row.module_id)
        }
      }

      // Calculate active modules per tenant (opt-out model: no row = enabled)
      let totalActive = 0
      for (const orgId of orgIds) {
        const enabledInDb = perOrg.get(orgId)?.size ?? 0
        const disabledInDb = disabledPerOrg.get(orgId)?.size ?? 0
        const modulesInDb = enabledInDb + disabledInDb
        const modulesNotInDb = totalModuleCount - modulesInDb
        totalActive += enabledInDb + modulesNotInDb
      }

      setAvgModulesPerTenant(Math.round((totalActive / orgIds.length) * 10) / 10)
      setModulesLoading(false)
    }

    fetchModuleStats()
  }, [isOrgsLoaded, tenantCount, userMemberships?.data, totalModuleCount])

  const isLoading = !isOrgsLoaded

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">
          Painel Admin
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Visao geral da plataforma Nexo
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Tenants"
          value={tenantCount}
          icon={Building2}
          href="/admin/tenants"
          loading={isLoading}
        />
        <MetricCard
          label="Usuarios"
          value={userCount}
          icon={Users}
          loading={isLoading}
        />
        <MetricCard
          label="Media modulos/tenant"
          value={avgModulesPerTenant !== null ? `${avgModulesPerTenant}/${totalModuleCount}` : `—/${totalModuleCount}`}
          icon={Blocks}
          href="/admin/modules"
          loading={modulesLoading}
        />
      </div>

      <Separator />

      {/* Quick links section */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
          Acesso Rapido
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to="/admin/tenants"
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card dark:hover:border-indigo-800"
          >
            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-foreground">Gerenciar Tenants</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Criar, visualizar e configurar organizacoes</p>
            </div>
          </Link>
          <Link
            to="/admin/modules"
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card dark:hover:border-indigo-800"
          >
            <Blocks className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-foreground">Modulos</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Habilitar e configurar modulos por tenant</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
