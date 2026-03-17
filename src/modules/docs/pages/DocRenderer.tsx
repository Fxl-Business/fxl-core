import { useLocation } from 'react-router-dom'
import { useUser } from '@clerk/react'
import { BookOpen } from 'lucide-react'
import { useDoc } from '../hooks/useDoc'
import type { DocSection } from '../services/docs-parser'
import MarkdownRenderer from '../components/MarkdownRenderer'
import PromptBlock from '@shared/ui/PromptBlock'
import Callout from '../components/Callout'
import Operational from '../components/Operational'
import PhaseCard from '../components/PhaseCard'
import DocBreadcrumb from '../components/DocBreadcrumb'
import DocPageHeader from '../components/DocPageHeader'
import DocTableOfContents from '../components/DocTableOfContents'

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
  const { doc, rawDoc, loading, error } = useDoc(slug)
  const { user } = useUser()
  const isSuperAdmin = user?.publicMetadata?.super_admin === true

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
  const isReadOnly = rawDoc?.scope === 'product' && !isSuperAdmin

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

          {isReadOnly && (
            <div className="mb-6 mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>Doc do Produto — somente leitura para operadores.</span>
            </div>
          )}

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
