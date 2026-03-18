import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Eye, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@shared/ui/button'
import {
  getProductDocs,
  invalidateDocsCache,
  type DocumentRow,
} from '@modules/docs/services/docs-service'
import { parseDoc, type DocSection } from '@modules/docs/services/docs-parser'
import MarkdownRenderer from '@modules/docs/components/MarkdownRenderer'
import Callout from '@modules/docs/components/Callout'
import Operational from '@modules/docs/components/Operational'
import PromptBlock from '@shared/ui/PromptBlock'
import PhaseCard from '@modules/docs/components/PhaseCard'
import DocPageHeader from '@modules/docs/components/DocPageHeader'
import DocTableOfContents from '@modules/docs/components/DocTableOfContents'
import { cn } from '@shared/utils'
import { supabase } from '@platform/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormMode = 'hidden' | 'create' | { edit: DocumentRow }

interface DocFormValues {
  title: string
  slug: string
  parent_path: string
  badge: string
  description: string
  body: string
  sort_order: number
}

const EMPTY_FORM: DocFormValues = {
  title: '',
  slug: '',
  parent_path: '',
  badge: 'Produto',
  description: '',
  body: '',
  sort_order: 0,
}

// ---------------------------------------------------------------------------
// Section renderer (same logic as DocRenderer)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Doc reader sidebar nav
// ---------------------------------------------------------------------------

function ReaderNav({
  docs,
  activeSlug,
  onSelect,
}: {
  docs: DocumentRow[]
  activeSlug: string
  onSelect: (doc: DocumentRow) => void
}) {
  // Group by badge, sorted by sort_order
  const grouped = new Map<string, DocumentRow[]>()
  for (const doc of docs) {
    if (doc.slug.endsWith('/index')) continue
    const badge = doc.badge || 'Outros'
    const group = grouped.get(badge) ?? []
    group.push(doc)
    grouped.set(badge, group)
  }

  return (
    <nav className="space-y-4">
      {[...grouped.entries()].map(([badge, badgeDocs]) => {
        const sorted = [...badgeDocs].sort((a, b) => a.sort_order - b.sort_order)
        return (
          <div key={badge}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {badge}
            </p>
            <div className="space-y-0.5">
              {sorted.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => onSelect(doc)}
                  className={cn(
                    'block w-full truncate rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                    doc.slug === activeSlug
                      ? 'bg-indigo-50 font-medium text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400',
                  )}
                >
                  {doc.title}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Inline doc form
// ---------------------------------------------------------------------------

function DocForm({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial: DocFormValues
  saving: boolean
  onSave: (values: DocFormValues) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<DocFormValues>(initial)

  function field(key: keyof DocFormValues) {
    return {
      value: String(values[key]),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const raw = e.target.value
        setValues((prev) => ({
          ...prev,
          [key]: key === 'sort_order' ? Number(raw) : raw,
        }))
      },
    }
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/20">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Titulo <span className="text-red-500">*</span>
          </label>
          <input
            {...field('title')}
            required
            placeholder="Ex: Introducao ao SDK"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-foreground dark:placeholder-slate-500"
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            {...field('slug')}
            required
            placeholder="Ex: sdk/introducao"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-foreground dark:placeholder-slate-500"
          />
        </div>

        {/* Parent path */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Parent path <span className="text-red-500">*</span>
          </label>
          <input
            {...field('parent_path')}
            required
            placeholder="Ex: sdk"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-foreground dark:placeholder-slate-500"
          />
        </div>

        {/* Badge */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Badge</label>
          <input
            {...field('badge')}
            placeholder="Produto"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-foreground dark:placeholder-slate-500"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Descricao
          </label>
          <input
            {...field('description')}
            placeholder="Breve descricao do doc"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-foreground dark:placeholder-slate-500"
          />
        </div>

        {/* Sort order */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Ordem (sort_order)
          </label>
          <input
            type="number"
            {...field('sort_order')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-foreground dark:placeholder-slate-500"
          />
        </div>

        {/* Body */}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Conteudo (Markdown) <span className="text-red-500">*</span>
          </label>
          <textarea
            {...field('body')}
            required
            placeholder="# Titulo&#10;&#10;Escreva o conteudo em Markdown..."
            className="min-h-[200px] rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-foreground dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Form actions */}
      <div className="mt-4 flex items-center justify-end gap-3">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={() => onSave(values)}
          disabled={saving || !values.title || !values.slug || !values.parent_path || !values.body}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Grouped docs list with collapsible badge sections
// ---------------------------------------------------------------------------

function GroupedDocsList({
  docs,
  formMode,
  saving,
  onRead,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
}: {
  docs: DocumentRow[]
  formMode: FormMode
  saving: boolean
  onRead: (doc: DocumentRow) => void
  onEdit: (doc: DocumentRow) => void
  onDelete: (doc: DocumentRow) => void
  onSave: (values: DocFormValues) => void
  onCancelEdit: () => void
}) {
  // Group all docs by badge (including index docs so we can find the index slug)
  const grouped = new Map<string, DocumentRow[]>()
  for (const doc of docs) {
    const badge = doc.badge || 'Outros'
    const group = grouped.get(badge) ?? []
    group.push(doc)
    grouped.set(badge, group)
  }

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set())

  function toggleGroup(badge: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(badge)) {
        next.delete(badge)
      } else {
        next.add(badge)
      }
      return next
    })
  }

  return (
    <div className="space-y-3">
      {[...grouped.entries()].map(([badge, badgeDocs]) => {
        const sorted = [...badgeDocs].sort((a, b) => a.sort_order - b.sort_order)
        // Non-index docs shown in the accordion
        const contentDocs = sorted.filter((d) => !d.slug.endsWith('/index'))
        // Index doc used as the group link target
        const indexDoc = sorted.find((d) => d.slug.endsWith('/index'))
        const isOpen = openGroups.has(badge)

        return (
          <div
            key={badge}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card"
          >
            {/* Group header: label opens inline reader for index doc, chevron toggles accordion */}
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <button
                type="button"
                onClick={() => indexDoc && onRead(indexDoc)}
                className="min-w-0 flex-1 text-left transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900 dark:text-foreground">{badge}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                    {contentDocs.length} {contentDocs.length === 1 ? 'doc' : 'docs'}
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => toggleGroup(badge)}
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                title="Gerenciar docs"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Group docs — only shown when expanded, for CRUD */}
            {isOpen && (
              <div className="border-t border-slate-100 dark:border-slate-700/50">
                {contentDocs.map((doc, idx) => (
                  <div key={doc.id}>
                    <div
                      className={cn(
                        'flex items-center gap-4 px-5 py-3 pl-16',
                        idx !== 0 ? 'border-t border-slate-100 dark:border-slate-700/50' : '',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onRead(doc)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-medium text-slate-800 hover:text-indigo-600 dark:text-foreground dark:hover:text-indigo-400">
                          {doc.title}
                        </p>
                        <p className="truncate font-mono text-xs text-slate-400 dark:text-slate-500">
                          {doc.slug}
                        </p>
                      </button>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onRead(doc)}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                          title="Ler"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(doc)}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(doc)}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          title="Deletar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {typeof formMode === 'object' &&
                      'edit' in formMode &&
                      formMode.edit.id === doc.id && (
                        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-700/50">
                          <DocForm
                            initial={{
                              title: doc.title,
                              slug: doc.slug,
                              parent_path: doc.parent_path,
                              badge: doc.badge,
                              description: doc.description,
                              body: doc.body,
                              sort_order: doc.sort_order,
                            }}
                            saving={saving}
                            onSave={onSave}
                            onCancel={onCancelEdit}
                          />
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProductDocsPage
// ---------------------------------------------------------------------------

export default function ProductDocsPage() {
  const [docs, setDocs] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<FormMode>('hidden')
  const [saving, setSaving] = useState(false)
  const [reading, setReading] = useState<DocumentRow | null>(null)

  async function fetchDocs() {
    setLoading(true)
    setError(null)
    try {
      const result = await getProductDocs()
      setDocs(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar docs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  async function handleSave(values: DocFormValues) {
    setSaving(true)
    try {
      if (formMode === 'create') {
        const { error: insertError } = await supabase.from('documents').insert({
          title: values.title,
          slug: values.slug,
          parent_path: values.parent_path,
          badge: values.badge || 'Produto',
          description: values.description,
          body: values.body,
          sort_order: values.sort_order,
          scope: 'product',
        })
        if (insertError) throw new Error(insertError.message)
      } else if (typeof formMode === 'object' && 'edit' in formMode) {
        const { error: updateError } = await supabase
          .from('documents')
          .update({
            title: values.title,
            slug: values.slug,
            parent_path: values.parent_path,
            badge: values.badge || 'Produto',
            description: values.description,
            body: values.body,
            sort_order: values.sort_order,
          })
          .eq('id', formMode.edit.id)
        if (updateError) throw new Error(updateError.message)
      }

      invalidateDocsCache()
      setFormMode('hidden')
      await fetchDocs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar doc')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(doc: DocumentRow) {
    if (!window.confirm('Deletar este doc?')) return
    try {
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id)
      if (deleteError) throw new Error(deleteError.message)
      invalidateDocsCache()
      await fetchDocs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar doc')
    }
  }

  // -------------------------------------------------------------------------
  // Reader mode — renders full doc content like DocRenderer
  // -------------------------------------------------------------------------

  if (reading) {
    const parsed = parseDoc(reading)
    const { frontmatter, sections, headings } = parsed

    return (
      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="hidden w-56 shrink-0 lg:block">
          <button
            type="button"
            onClick={() => setReading(null)}
            className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Gerenciar
          </button>
          <ReaderNav
            docs={docs}
            activeSlug={reading.slug}
            onSelect={setReading}
          />
        </div>

        {/* Doc content */}
        <div className="min-w-0 flex-1">
          {/* Mobile back button */}
          <button
            type="button"
            onClick={() => setReading(null)}
            className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-indigo-600 lg:hidden dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para lista
          </button>

          <DocPageHeader
            badge={frontmatter.badge}
            title={frontmatter.title}
            description={frontmatter.description}
          />

          <div className="mt-8">
            <div className="flex gap-10">
              <div className="min-w-0 flex-1 space-y-4">
                {sections.map((section, i) => (
                  <SectionRenderer key={i} section={section} />
                ))}
              </div>
              {headings.length > 1 && (
                <DocTableOfContents headings={headings} />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // List mode — CRUD management
  // -------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">
            Docs do Produto
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Documentacao global visivel para todos os tenants.
          </p>
        </div>
        {formMode === 'hidden' && (
          <Button onClick={() => setFormMode('create')} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Doc
          </Button>
        )}
      </div>

      {/* Inline create form */}
      {formMode === 'create' && (
        <DocForm
          initial={EMPTY_FORM}
          saving={saving}
          onSave={handleSave}
          onCancel={() => setFormMode('hidden')}
        />
      )}

      {/* Stats bar */}
      {!loading && !error && (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
            {docs.length} {docs.length === 1 ? 'doc' : 'docs'}
          </span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-2"
            onClick={fetchDocs}
          >
            <RefreshCw className="h-3 w-3" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && docs.length === 0 && formMode === 'hidden' && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-700">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum doc do produto encontrado
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Clique em "Novo Doc" para criar o primeiro.
          </p>
        </div>
      )}

      {/* Docs list — grouped by badge */}
      {!loading && !error && docs.length > 0 && (
        <GroupedDocsList
          docs={docs}
          formMode={formMode}
          saving={saving}
          onRead={setReading}
          onEdit={(doc) => setFormMode({ edit: doc })}
          onDelete={handleDelete}
          onSave={handleSave}
          onCancelEdit={() => setFormMode('hidden')}
        />
      )}
    </div>
  )
}
