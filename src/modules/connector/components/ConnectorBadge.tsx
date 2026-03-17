import type { ConnectorStatus } from '../types'

interface ConnectorBadgeProps {
  status: ConnectorStatus
}

const STATUS_CONFIG: Record<ConnectorStatus, { label: string; className: string }> = {
  online: {
    label: 'Online',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  },
  offline: {
    label: 'Offline',
    className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  },
  error: {
    label: 'Erro',
    className: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
  },
  loading: {
    label: 'Carregando',
    className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  },
}

/**
 * Status badge showing connector online/offline/error state.
 */
export default function ConnectorBadge({ status }: ConnectorBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${config.className}`}>
      {status === 'online' && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
      )}
      {status === 'offline' && (
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
      )}
      {config.label}
    </span>
  )
}
