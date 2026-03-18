import { useState, useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronRight, Loader2 } from 'lucide-react'
import { Badge } from '@shared/ui/badge'
import { getProjectBySlug } from '../services/projects-service'
import type { ProjectWithClient } from '../types/project'

type DocStatus = {
  doc: string
  label: string
  status: string
}

const defaultDocs: DocStatus[] = [
  { doc: 'briefing',   label: 'Briefing',   status: 'Pendente' },
  { doc: 'blueprint',  label: 'Blueprint',  status: 'Pendente' },
  { doc: 'wireframe',  label: 'Wireframe',  status: 'Pendente' },
  { doc: 'branding',   label: 'Branding',   status: 'Pendente' },
]

const STATUS_COLORS: Record<string, string> = {
  Rascunho:    'bg-yellow-50 text-yellow-700',
  Pendente:    'bg-muted text-muted-foreground',
  Iniciado:    'bg-blue-50 text-blue-700',
  'Concluido': 'bg-green-50 text-green-700',
  'Em revisao':'bg-orange-50 text-orange-700',
}

export default function ProjectIndex() {
  const { projectSlug } = useParams<{ projectSlug: string }>()
  const [project, setProject] = useState<ProjectWithClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectSlug) return
    getProjectBySlug(projectSlug)
      .then(setProject)
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Erro ao carregar projeto'
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [projectSlug])

  if (!projectSlug) {
    return <Navigate to="/projetos" replace />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl text-sm text-red-500">{error}</div>
    )
  }

  const name = project?.name ?? projectSlug

  return (
    <div className="mx-auto max-w-4xl">
      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/projetos" className="hover:text-indigo-600 dark:hover:text-indigo-400">Projetos</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-medium text-slate-900 dark:text-foreground">{name}</span>
      </nav>
      <span className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-400 dark:ring-indigo-400/30">
        Projetos
      </span>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
        {name}
      </h1>
      {project?.client_name && (
        <Badge variant="secondary" className="mt-2">
          Cliente: {project.client_name}
        </Badge>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">Documentos</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">Documento</th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">Acao</th>
              </tr>
            </thead>
            <tbody>
              {defaultDocs.map((item) => {
                const href = `/projetos/${projectSlug}/${item.doc}`
                return (
                  <tr key={item.doc} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-foreground">{item.label}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[item.status] ?? 'bg-muted text-muted-foreground'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.doc === 'wireframe' ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline dark:text-indigo-400"
                        >
                          Abrir
                        </a>
                      ) : (
                        <Link
                          to={href}
                          className="text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline dark:text-indigo-400"
                        >
                          Abrir
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
