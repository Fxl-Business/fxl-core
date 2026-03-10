import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

type Props = {
  section?: string
  title: string
}

const sectionSlugMap: Record<string, string> = {
  Processo: '/processo/index',
  Padroes: '/padroes/index',
  Ferramentas: '/ferramentas/index',
}

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export default function DocBreadcrumb({ section, title }: Props) {
  const sectionHref = section ? sectionSlugMap[section] : undefined
  const isSameName = section ? normalize(section) === normalize(title) : false

  return (
    <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      {section && (
        <>
          {sectionHref ? (
            <Link to={sectionHref} className="transition-colors hover:text-slate-900 dark:hover:text-slate-200">
              {section}
            </Link>
          ) : (
            <span>{section}</span>
          )}
          {!isSameName && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
        </>
      )}
      {!isSameName && <span className="font-medium text-slate-900 dark:text-foreground">{title}</span>}
    </nav>
  )
}
