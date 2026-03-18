import { useParams, Navigate, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

/**
 * Generic document viewer for project sub-pages (branding, changelog, etc.).
 * Briefing and Blueprint have their own dedicated pages.
 * Wireframe opens in full-screen mode via a separate route.
 *
 * This is a placeholder that will be expanded when docs are loaded from DB.
 */

const DOC_LABELS: Record<string, string> = {
  branding: 'Branding',
  changelog: 'Changelog',
}

export default function ProjectDocViewer() {
  const { projectSlug, doc } = useParams<{ projectSlug: string; doc: string }>()

  if (!projectSlug || !doc) {
    return <Navigate to="/projetos" replace />
  }

  const label = DOC_LABELS[doc] ?? doc

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/projetos" className="hover:text-indigo-600 dark:hover:text-indigo-400">Projetos</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link to={`/projetos/${projectSlug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">{projectSlug}</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium text-slate-900 dark:text-foreground">{label}</span>
        </nav>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">{label}</h1>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-card">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Conteudo de {label} para o projeto <strong>{projectSlug}</strong> sera carregado do banco de dados.
        </p>
      </div>
    </div>
  )
}
