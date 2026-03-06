import { useLocation } from 'react-router-dom'
import { getDoc, type DocSection } from '@/lib/docs-parser'
import MarkdownRenderer from '@/components/docs/MarkdownRenderer'
import PromptBlock from '@/components/docs/PromptBlock'
import Callout from '@/components/docs/Callout'
import Operational from '@/components/docs/Operational'
import PhaseCard from '@/components/docs/PhaseCard'
import DocBreadcrumb from '@/components/docs/DocBreadcrumb'
import DocPageHeader from '@/components/docs/DocPageHeader'
import DocTableOfContents from '@/components/docs/DocTableOfContents'
import { Separator } from '@/components/ui/separator'

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

  const { frontmatter, sections, headings, rawBody } = doc

  return (
    <div className="flex gap-10">
      {/* Main content */}
      <div className="min-w-0 flex-1">
        <DocBreadcrumb section={frontmatter.badge} title={frontmatter.title} />

        <DocPageHeader
          badge={frontmatter.badge}
          title={frontmatter.title}
          description={frontmatter.description}
          rawContent={rawBody}
        />

        <Separator className="my-6" />

        <div className="space-y-4">
          {sections.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))}
        </div>
      </div>

      {/* Right TOC */}
      {headings.length > 1 && (
        <DocTableOfContents headings={headings} />
      )}
    </div>
  )
}
