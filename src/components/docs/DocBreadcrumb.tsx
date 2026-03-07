import { Link } from 'react-router-dom'

type Props = {
  section?: string
  title: string
}

const sectionSlugMap: Record<string, string> = {
  Processo: '/processo/index',
  Referencias: '/referencias/index',
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
    <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
      {section && (
        <>
          {sectionHref ? (
            <Link to={sectionHref} className="hover:text-foreground transition-colors">
              {section}
            </Link>
          ) : (
            <span>{section}</span>
          )}
          {!isSameName && <span>/</span>}
        </>
      )}
      {!isSameName && <span className="text-foreground">{title}</span>}
    </nav>
  )
}
