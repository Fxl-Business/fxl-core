import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { FxlAppManifest } from '../types'
import { resolveIcon } from '../services/icon-map'
import KpiWidget from '../components/widgets/KpiWidget'
import ChartWidget from '../components/widgets/ChartWidget'
import TableWidget from '../components/widgets/TableWidget'
import ListWidget from '../components/widgets/ListWidget'

interface ConnectorDashboardProps {
  manifest: FxlAppManifest
  baseUrl: string
  apiKey?: string
}

/**
 * Dashboard view for a specific connector.
 * Shows all widgets and entity quick links.
 */
export default function ConnectorDashboard({ manifest, baseUrl, apiKey }: ConnectorDashboardProps) {
  const { appId } = useParams<{ appId: string }>()

  return (
    <div className="space-y-8">
      {/* Widgets grid */}
      {manifest.dashboardWidgets.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
            Widgets
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {manifest.dashboardWidgets.map(widget => {
              switch (widget.type) {
                case 'kpi':
                  return <KpiWidget key={widget.id} widget={widget} baseUrl={baseUrl} apiKey={apiKey} />
                case 'chart':
                  return <ChartWidget key={widget.id} widget={widget} baseUrl={baseUrl} apiKey={apiKey} />
                case 'table':
                  return <TableWidget key={widget.id} widget={widget} baseUrl={baseUrl} apiKey={apiKey} />
                case 'list':
                  return <ListWidget key={widget.id} widget={widget} baseUrl={baseUrl} apiKey={apiKey} />
                default:
                  return null
              }
            })}
          </div>
        </div>
      )}

      {/* Entity quick links */}
      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
          Entidades
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {manifest.entities.map(entity => {
            const Icon = resolveIcon(entity.icon)
            return (
              <Link
                key={entity.type}
                to={`/apps/${appId}/${entity.type}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card dark:hover:border-indigo-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                      {entity.labelPlural}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {entity.fields.length} campo{entity.fields.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
