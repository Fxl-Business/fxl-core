import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Loader2, Plus } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { listProjects } from '../services/projects-service'
import type { ProjectWithClient } from '../types/project'
import CreateProjectDialog from '../components/CreateProjectDialog'

export default function ProjectsIndex() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Erro ao carregar projetos'
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <span className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-400 dark:ring-indigo-400/30">
            Projetos
          </span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
            Projetos
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            Workspaces de projetos com docs, briefing e wireframe.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="mt-2">
          <Plus className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

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
            Nenhum projeto encontrado para esta organizacao.
          </p>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projetos/${project.slug}`}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-card dark:hover:border-indigo-600/50 dark:hover:bg-indigo-950/20"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 dark:text-foreground dark:group-hover:text-indigo-400">
                    {project.name}
                  </p>
                  {project.client_name && (
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      {project.client_name}
                    </Badge>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(project) => {
          setProjects((prev) => [...prev, { ...project, client_name: null }])
        }}
      />
    </div>
  )
}
