import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckSquare } from 'lucide-react'
import { MODULE_REGISTRY } from '@/modules/registry'
import { supabase } from '@/lib/supabase'

// Descriptions for each module (ModuleManifest does not include a description field)
const MODULE_DESCRIPTIONS: Record<string, string> = {
  docs: 'Processo, ferramentas e padroes tecnicos da FXL.',
  'wireframe-builder': 'Crie e edite wireframes interativos para clientes.',
  clients: 'Workspaces de clientes com docs, briefing e wireframe.',
  'knowledge-base': 'Base de conhecimento cross-cliente e operacional.',
  tasks: 'Gestao de tarefas e kanban por cliente e projeto.',
}

export type ActivityItem = {
  id: string
  title: string
  type: 'kb_entry' | 'task'
  subtype?: string
  client_slug?: string | null
  updated_at: string
  href: string
}

export function mergeAndSortActivityItems(
  kbItems: ActivityItem[],
  taskItems: ActivityItem[],
): ActivityItem[] {
  return [...kbItems, ...taskItems]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 10)
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function useActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [kbResult, taskResult] = await Promise.all([
          supabase
            .from('knowledge_entries')
            .select('id, title, entry_type, client_slug, updated_at')
            .order('updated_at', { ascending: false })
            .limit(10),
          supabase
            .from('tasks')
            .select('id, title, status, client_slug, updated_at')
            .order('updated_at', { ascending: false })
            .limit(10),
        ])

        if (cancelled) return

        const kbItems: ActivityItem[] = (kbResult.data ?? []).map((e) => ({
          id: e.id as string,
          title: e.title as string,
          type: 'kb_entry' as const,
          subtype: e.entry_type as string | undefined,
          client_slug: e.client_slug as string | null | undefined,
          updated_at: e.updated_at as string,
          href: `/knowledge-base/${e.id as string}`,
        }))

        const taskItems: ActivityItem[] = (taskResult.data ?? []).map((t) => ({
          id: t.id as string,
          title: t.title as string,
          type: 'task' as const,
          subtype: t.status as string | undefined,
          client_slug: t.client_slug as string | null | undefined,
          updated_at: t.updated_at as string,
          href: '/tarefas',
        }))

        const merged = mergeAndSortActivityItems(kbItems, taskItems)

        setItems(merged)
      } catch {
        // Silently handle — tables may not exist, activity feed is non-critical
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { items, loading }
}

const clients = [
  {
    slug: 'financeiro-conta-azul',
    name: 'Financeiro Conta Azul',
    badge: 'BI Personalizado',
    description: 'Dashboard financeiro com dados exportados do Conta Azul.',
    status: 'Em andamento',
    href: '/clients/financeiro-conta-azul',
  },
]

export default function Home() {
  // Hooks must be called unconditionally before any conditional returns
  const { items: activityItems, loading: activityLoading } = useActivityFeed()

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
          Nucleo FXL
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
          Processo, knowledge e ferramentas — o nucleo operacional da FXL.
        </p>
      </div>

      {/* Module Hub Grid */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
        Modulos
      </h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULE_REGISTRY.map((mod) => {
          const Icon = mod.icon
          const description = MODULE_DESCRIPTIONS[mod.id]
          return (
            <Link key={mod.id} to={mod.route} className="h-full">
              <div className="flex h-full min-h-[120px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card dark:hover:border-indigo-800">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">
                      {mod.label}
                    </h3>
                    {description && (
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  {mod.status !== 'active' && (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {mod.status}
                    </span>
                  )}
                  <ArrowRight className="ml-auto h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Activity Feed */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
        Atividade recente
      </h2>
      <div className="mb-8 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card">
        {activityLoading ? (
          <p className="p-5 text-sm text-slate-400 dark:text-slate-500">Carregando...</p>
        ) : activityItems.length === 0 ? (
          <p className="p-5 text-sm text-slate-400 dark:text-slate-500">
            Nenhuma atividade recente.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {activityItems.map((item) => (
              <li key={`${item.type}-${item.id}`} className="flex items-center gap-3 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {item.type === 'kb_entry' ? (
                    <BookOpen className="h-4 w-4" />
                  ) : (
                    <CheckSquare className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={item.href}
                      className="truncate text-sm font-medium text-slate-900 hover:text-indigo-600 dark:text-foreground dark:hover:text-indigo-400"
                    >
                      {item.title}
                    </Link>
                    {item.subtype && (
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {item.subtype}
                      </span>
                    )}
                    {item.client_slug && (
                      <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500">
                        {item.client_slug}
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">
                  {formatDate(item.updated_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Clientes */}
      <h2
        id="clientes"
        className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground"
      >
        Clientes
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <Link
            key={c.slug}
            to={c.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-card"
          >
            <div className="mb-3 flex items-start justify-between">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {c.badge}
              </span>
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                {c.status}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-foreground dark:group-hover:text-indigo-400">
              {c.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
