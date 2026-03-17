import { Link } from 'react-router-dom'
import { Activity, ArrowRight, CheckSquare } from 'lucide-react'
import { MODULE_REGISTRY, SLOT_IDS, type ModuleDefinition } from '@platform/module-loader/registry'
import { ExtensionSlot } from '@platform/module-loader/slots'
import { useModuleEnabled } from '@platform/module-loader/hooks/useModuleEnabled'
import { useActivityFeed, type ActivityItem, formatDate } from '@platform/services/activity-feed'
import { useModuleStats, type ModuleStats } from '@platform/services/module-stats'
import { Badge } from '@shared/ui/badge'
import { Separator } from '@shared/ui/separator'
import SemModulos from '@platform/pages/SemModulos'

// ---------------------------------------------------------------------------
// Internal components (not exported)
// ---------------------------------------------------------------------------

function FeaturedModuleCard({
  mod,
  badgeCount,
}: {
  mod: ModuleDefinition
  badgeCount?: number
}) {
  const Icon = mod.icon

  return (
    <Link to={mod.route} className="block">
      <div className="flex min-h-[140px] flex-col justify-between rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 transition-all hover:border-indigo-300 hover:shadow-md dark:border-indigo-800 dark:from-indigo-950/30 dark:to-card dark:hover:border-indigo-700">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">
                {mod.label}
              </h3>
              {badgeCount !== undefined && badgeCount > 0 && (
                <Badge variant="secondary">{badgeCount}</Badge>
              )}
              {mod.status !== 'active' && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                  {mod.status}
                </Badge>
              )}
            </div>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{mod.description}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Acessar
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function ModuleCard({
  mod,
  badgeCount,
}: {
  mod: ModuleDefinition
  badgeCount?: number
}) {
  const Icon = mod.icon

  return (
    <Link to={mod.route} className="block h-full">
      <div className="flex h-full min-h-[110px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card dark:hover:border-indigo-800">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">
              {mod.label}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
              {mod.description}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {badgeCount !== undefined && badgeCount > 0 && (
              <Badge variant="secondary" className="text-[11px]">
                {badgeCount}
              </Badge>
            )}
            {mod.status !== 'active' && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {mod.status}
              </span>
            )}
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        </div>
      </div>
    </Link>
  )
}

function IdentityCard({
  activeCount,
  stats,
}: {
  activeCount: number
  stats: ModuleStats
}) {
  const totalBadgeCount = Object.values(stats.counts).reduce((sum, n) => sum + n, 0)

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
          <span className="text-xs font-bold text-white">FXL</span>
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-foreground">Nexo</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Plataforma operacional interna
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Modulos ativos</span>
          <span className="font-semibold text-slate-900 dark:text-foreground">{activeCount}</span>
        </div>
        {!stats.loading && totalBadgeCount > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Itens em aberto</span>
            <span className="font-semibold text-slate-900 dark:text-foreground">
              {totalBadgeCount}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Build</span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            FXL-CORE
          </span>
        </div>
      </div>
    </div>
  )
}

function ActivityFeed({
  items,
  loading,
}: {
  items: ActivityItem[]
  loading: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <Activity className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
          Atividade Recente
        </span>
      </div>
      {loading ? (
        <p className="p-4 text-sm text-slate-400 dark:text-slate-500">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="p-4 text-sm text-slate-400 dark:text-slate-500">
          Nenhuma atividade recente.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.slice(0, 8).map((item) => (
            <li key={`${item.type}-${item.id}`} className="flex items-start gap-3 p-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <CheckSquare className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to={item.href}
                  className="block truncate text-xs font-medium text-slate-900 hover:text-indigo-600 dark:text-foreground dark:hover:text-indigo-400"
                >
                  {item.title}
                </Link>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {item.subtype && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {item.subtype}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {formatDate(item.updated_at)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function Home() {
  const { items: activityItems, loading: activityLoading } = useActivityFeed()
  const stats = useModuleStats()
  const { isEnabled, enabledModules: enabledModuleSet, isLoading: modulesLoading } = useModuleEnabled()

  // Show empty state if no modules enabled (after loading completes)
  if (!modulesLoading && enabledModuleSet.size === 0) {
    return <SemModulos />
  }

  const enabledModules = MODULE_REGISTRY.filter((mod) => isEnabled(mod.id))
  const featuredModule = enabledModules.find((mod) => mod.status === 'active') ?? enabledModules[0]
  const remainingModules = featuredModule
    ? enabledModules.filter((mod) => mod.id !== featuredModule.id)
    : enabledModules

  const now = new Date()
  const dateLabel = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
          Nexo
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          Centro de controle — processo, knowledge e ferramentas
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 capitalize">{dateLabel}</p>
      </div>

      {/* Asymmetric 2/3 + 1/3 grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Primary Area — Module Hub (2/3) */}
        <div className="space-y-4 lg:col-span-2">
          {/* Featured Module */}
          {featuredModule && (
            <FeaturedModuleCard
              mod={featuredModule}
              badgeCount={stats.counts[featuredModule.id]}
            />
          )}

          {/* Remaining Modules — 2-column sub-grid */}
          {remainingModules.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {remainingModules.map((mod) => (
                <ModuleCard key={mod.id} mod={mod} badgeCount={stats.counts[mod.id]} />
              ))}
            </div>
          )}
        </div>

        {/* Secondary Area — Identity + Activity (1/3) */}
        <div className="space-y-4 lg:col-span-1">
          <IdentityCard activeCount={enabledModules.length} stats={stats} />
          <ActivityFeed items={activityItems} loading={activityLoading} />
        </div>
      </div>

      {/* Extension Widgets — injected by modules via slot system */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ExtensionSlot id={SLOT_IDS.HOME_DASHBOARD} />
      </div>
    </div>
  )
}
