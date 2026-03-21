import { STATUS_LABELS, STATUS_CLASSES } from './module-status-constants'
import type { ModuleDefinition } from '@platform/module-loader/registry'

type ModuleOverviewCardProps = {
  mod: ModuleDefinition
  highlighted?: boolean
}

export function ModuleOverviewCard({ mod, highlighted }: ModuleOverviewCardProps) {
  const Icon = mod.icon

  return (
    <div
      id={`module-card-${mod.id}`}
      data-module-id={mod.id}
      className={`rounded-xl border bg-white p-5 dark:bg-card dark:border-slate-700 transition-shadow duration-300${highlighted ? ' ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}`}
    >
      {/* Header: icon + label + status badge */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
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

      {/* Features section */}
      {mod.features && mod.features.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Funcionalidades
          </p>
          <ul className="space-y-1">
            {mod.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Extensions section */}
      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
          Extensoes
        </p>
        {!mod.extensions || mod.extensions.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Nenhuma extensao registrada
          </p>
        ) : (
          <ul className="space-y-2">
            {mod.extensions.map((ext) => (
              <li key={ext.id} className="flex items-start gap-1.5 text-xs">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400 dark:bg-indigo-500" />
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {ext.id}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {' '}&mdash; {ext.description}
                  </span>
                  {Object.keys(ext.injects).length > 0 && (
                    <p className="mt-0.5 font-mono text-slate-400 dark:text-slate-500">
                      Slot: {Object.keys(ext.injects).join(', ')}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
