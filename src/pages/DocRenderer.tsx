import { useLocation } from 'react-router-dom'
import { getDoc, type DocSection } from '@/lib/docs-parser'
import MarkdownRenderer from '@/components/docs/MarkdownRenderer'
import PromptBlock from '@/components/docs/PromptBlock'
import Callout from '@/components/docs/Callout'
import Operational from '@/components/docs/Operational'
import PhaseCard from '@/components/docs/PhaseCard'

function SectionRenderer({ section }: { section: DocSection }) {
  switch (section.type) {
    case 'markdown':
      return <MarkdownRenderer content={section.content} />
    case 'prompt':
      return <PromptBlock label={section.label} prompt={section.content} />
    case 'callout':
      return <Callout type={section.variant} content={section.content} />
    case 'operational':
      return <Operational content={section.content} />
    case 'phase-card':
      return (
        <PhaseCard
          number={section.number}
          title={section.title}
          description={section.description}
          href={section.href}
        />
      )
    default:
      return null
  }
}

export default function DocRenderer() {
  const location = useLocation()
  const doc = getDoc(location.pathname)

  if (!doc) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-lg font-semibold text-slate-700">Pagina nao encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">
          Nao foi possivel encontrar um documento para: {location.pathname}
        </p>
      </div>
    )
  }

  const { frontmatter, sections } = doc

  return (
    <div>
      <div className="mb-8">
        {frontmatter.badge && (
          <span className="mb-2 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {frontmatter.badge}
          </span>
        )}
        <h1 className="text-2xl font-bold text-slate-900">{frontmatter.title}</h1>
        {frontmatter.description && (
          <p className="mt-2 text-sm text-slate-500">{frontmatter.description}</p>
        )}
      </div>

      {sections.map((section, i) => (
        <SectionRenderer key={i} section={section} />
      ))}
    </div>
  )
}
