import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Loader2 } from 'lucide-react'
import { listClients } from '../services/clients-service'
import type { Client } from '../services/clients-service'

export default function ProjectsIndex() {
  const [projects, setProjects] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listClients()
      .then(setProjects)
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Erro ao carregar projetos'
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-4xl">
      <span className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-400 dark:ring-indigo-400/30">
        Projetos
      </span>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
        Projetos
      </h1>
      <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
        Workspaces de projetos com docs, briefing e wireframe.
      </p>

      <div className="mt-8">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}

        {error && !loading && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && projects.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum projeto encontrado para esta organização.
          </p>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.slug}
                to={`/projetos/${project.slug}`}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-card dark:hover:border-indigo-600/50 dark:hover:bg-indigo-950/20"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 dark:text-foreground dark:group-hover:text-indigo-400">
                    {project.name}
                  </p>
                  {project.description && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {project.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
