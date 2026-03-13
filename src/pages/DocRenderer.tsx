import { useLocation } from 'react-router-dom'
import { useDoc } from '@/hooks/useDoc'
import type { DocSection } from '@/lib/docs-parser'
import MarkdownRenderer from '@/components/docs/MarkdownRenderer'
import PromptBlock from '@/components/docs/PromptBlock'
import Callout from '@/components/docs/Callout'
import Operational from '@/components/docs/Operational'
import PhaseCard from '@/components/docs/PhaseCard'
import DocBreadcrumb from '@/components/docs/DocBreadcrumb'
import DocPageHeader from '@/components/docs/DocPageHeader'
import DocTableOfContents from '@/components/docs/DocTableOfContents'

function DocSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex gap-10">
        <div className="min-w-0 flex-1">
          {/* Breadcrumb skeleton */}
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          {/* Badge + Title skeleton */}
          <div className="mt-6 space-y-3">
            <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-8 w-72 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-4 w-96 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
          {/* Content skeleton */}
          <div className="mt-8 space-y-4">
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-4 w-4/6 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

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
  const slug = location.pathname.replace(/^\//, '').replace(/\/$/, '')
  const { doc, loading, error } = useDoc(slug)

  if (loading) {
    return <DocSkeleton />
  }

  if (error || !doc) {
    return (
      <div className="mx-auto max-w-5xl py-12 text-center">
        <h1 className="text-lg font-semibold text-foreground">Pagina nao encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nao foi possivel encontrar um documento para: {location.pathname}
        </p>
      </div>
    )
  }

  const { frontmatter, sections, headings } = doc

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex gap-10">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          <DocBreadcrumb section={frontmatter.badge} title={frontmatter.title} />

          <DocPageHeader
            badge={frontmatter.badge}
            title={frontmatter.title}
            description={frontmatter.description}
          />

          <div className="mt-8">
            <div className="space-y-4">
              {sections.map((section, i) => (
                <SectionRenderer key={i} section={section} />
              ))}
            </div>
          </div>
        </div>

        {/* Right TOC */}
        {headings.length > 1 && (
          <DocTableOfContents headings={headings} />
        )}
      </div>
    </div>
  )
}
