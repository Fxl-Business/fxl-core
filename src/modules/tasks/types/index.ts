// Re-export types from tasks-service (single source of truth)
export type { Task, TaskStatus, TaskPriority } from '../services/tasks-service'

import type { TaskStatus, TaskPriority } from '../services/tasks-service'

// ---------------------------------------------------------------------------
// Status constants
// ---------------------------------------------------------------------------

export const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked']

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'A fazer',
  in_progress: 'Em andamento',
  done: 'Concluido',
  blocked: 'Bloqueado',
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  in_progress: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  done: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  blocked: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
}

// ---------------------------------------------------------------------------
// Priority constants
// ---------------------------------------------------------------------------

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  high: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function nextStatus(current: TaskStatus): TaskStatus {
  return STATUS_ORDER[(STATUS_ORDER.indexOf(current) + 1) % STATUS_ORDER.length]
}
