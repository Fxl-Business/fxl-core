import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createKnowledgeEntry, updateKnowledgeEntry } from '@/lib/kb-service'
import { useKBEntry } from '../hooks/useKBEntry'
import { KB_ENTRY_TYPES, ADR_TEMPLATE } from '../types/kb'
import type { KBEntryType } from '../types/kb'

// ---------------------------------------------------------------------------
// KBFormPage — /knowledge-base/new and /knowledge-base/:id/edit
// ---------------------------------------------------------------------------

interface FormState {
  title: string
  body: string
  type: KBEntryType
  tags: string
  clientSlug: string
}

const DEFAULT_FORM: FormState = {
  title: '',
  body: '',
  type: 'lesson',
  tags: '',
  clientSlug: '',
}

export default function KBFormPage() {
  // ALL hooks before conditional returns (project memory rule)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const { entry, loading: entryLoading } = useKBEntry(id)

  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  // Pre-fill form when entry loads in edit mode
  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title,
        body: entry.body,
        type: entry.entry_type as KBEntryType,
        tags: entry.tags.join(', '),
        clientSlug: entry.client_slug ?? '',
      })
    }
  }, [entry])

  // ADR template injection: only when type changes to 'decision' and body is empty
  function handleTypeChange(value: string) {
    const newType = value as KBEntryType
    setFormData((prev) => {
      const shouldInjectTemplate = newType === 'decision' && !prev.body.trim()
      return {
        ...prev,
        type: newType,
        body: shouldInjectTemplate ? ADR_TEMPLATE : prev.body,
      }
    })
  }

  function handleFieldChange(
    field: keyof FormState,
    value: string
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const parsedTags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      if (isEditMode && id) {
        await updateKnowledgeEntry(id, {
          title: formData.title,
          body: formData.body,
          entry_type: formData.type,
          tags: parsedTags,
          client_slug: formData.clientSlug || undefined,
        })
        toast.success('Entrada atualizada')
        navigate(`/knowledge-base/${id}`)
      } else {
        await createKnowledgeEntry({
          title: formData.title,
          body: formData.body,
          entry_type: formData.type,
          tags: parsedTags,
          client_slug: formData.clientSlug || undefined,
        })
        toast.success('Entrada criada')
        navigate('/knowledge-base')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error(`Erro ao salvar: ${message}`)
    } finally {
      setSaving(false)
    }
  }

  const cancelHref = isEditMode ? `/knowledge-base/${id}` : '/knowledge-base'

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          to={cancelHref}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cancelar
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground mb-8">
        {isEditMode ? 'Editar entrada' : 'Nova entrada'}
      </h1>

      {/* Loading entry in edit mode */}
      {isEditMode && entryLoading && (
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="h-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
      )}

      {/* Form */}
      {(!isEditMode || !entryLoading) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titulo */}
          <div className="space-y-1.5">
            <label
              htmlFor="kb-title"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Titulo <span className="text-red-500">*</span>
            </label>
            <Input
              id="kb-title"
              required
              placeholder="Titulo da entrada"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-1.5">
            <label
              htmlFor="kb-type"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Tipo <span className="text-red-500">*</span>
            </label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger id="kb-type">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {KB_ENTRY_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Corpo */}
          <div className="space-y-1.5">
            <label
              htmlFor="kb-body"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Corpo
            </label>
            <Textarea
              id="kb-body"
              placeholder="Conteudo em Markdown..."
              className="min-h-[300px] font-mono text-sm"
              value={formData.body}
              onChange={(e) => handleFieldChange('body', e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label
              htmlFor="kb-tags"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Tags
            </label>
            <Input
              id="kb-tags"
              placeholder="Tags separadas por virgula (ex: supabase, auth, deploy)"
              value={formData.tags}
              onChange={(e) => handleFieldChange('tags', e.target.value)}
            />
          </div>

          {/* Cliente */}
          <div className="space-y-1.5">
            <label
              htmlFor="kb-client"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Cliente
            </label>
            <Input
              id="kb-client"
              placeholder="Slug do cliente (ex: financeiro-conta-azul)"
              value={formData.clientSlug}
              onChange={(e) => handleFieldChange('clientSlug', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving || !formData.title.trim()}>
              <Save className="h-4 w-4 mr-1.5" />
              {saving ? 'Salvando...' : isEditMode ? 'Salvar alteracoes' : 'Criar entrada'}
            </Button>
            <Button variant="outline" type="button" asChild>
              <Link to={cancelHref}>Cancelar</Link>
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
