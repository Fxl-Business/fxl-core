import { useCallback, useEffect, useState } from 'react'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Textarea } from '@shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import type { Client, ClientStatus } from '../types'

/** Form data — always has all fields filled (name, slug required by validation) */
export interface ClientFormData {
  name: string
  slug: string
  description: string
  logo_url: string | null
  status: ClientStatus
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// ---------------------------------------------------------------------------
// ClientForm — used for create and edit (in a Dialog)
// ---------------------------------------------------------------------------

interface ClientFormProps {
  /** When provided, form is in edit mode */
  client?: Client
  onSubmit: (params: ClientFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function ClientForm({ client, onSubmit, onCancel, loading }: ClientFormProps) {
  const isEdit = !!client

  const [name, setName] = useState(client?.name ?? '')
  const [slug, setSlug] = useState(client?.slug ?? '')
  const [description, setDescription] = useState(client?.description ?? '')
  const [logoUrl, setLogoUrl] = useState(client?.logo_url ?? '')
  const [status, setStatus] = useState<ClientStatus>(client?.status ?? 'active')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit)

  // Auto-generate slug from name (only for create)
  useEffect(() => {
    if (!slugManuallyEdited && !isEdit) {
      setSlug(slugify(name))
    }
  }, [name, slugManuallyEdited, isEdit])

  const handleSlugChange = useCallback((value: string) => {
    setSlugManuallyEdited(true)
    setSlug(slugify(value))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!name.trim() || !slug.trim()) return

      const params = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        logo_url: logoUrl.trim() || null,
        status,
      }

      await onSubmit(params)
    },
    [name, slug, description, logoUrl, status, onSubmit],
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="client-name">Nome</Label>
        <Input
          id="client-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do cliente"
          required
          autoFocus
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="client-slug">Slug</Label>
        <Input
          id="client-slug"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="slug-do-cliente"
          required
          disabled={isEdit}
          className={isEdit ? 'opacity-60' : ''}
        />
        {!isEdit && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerado automaticamente a partir do nome. Nao pode ser alterado apos criacao.
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="client-description">Descricao</Label>
        <Textarea
          id="client-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descricao breve do cliente"
          rows={3}
        />
      </div>

      {/* Logo URL */}
      <div className="space-y-2">
        <Label htmlFor="client-logo">Logo URL</Label>
        <Input
          id="client-logo"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://..."
          type="url"
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="client-status">Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as ClientStatus)}>
          <SelectTrigger id="client-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="archived">Arquivado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !name.trim() || !slug.trim()}>
          {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar cliente'}
        </Button>
      </div>
    </form>
  )
}
