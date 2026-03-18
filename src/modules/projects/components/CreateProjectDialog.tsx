import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import { createProject } from '../services/projects-service'
import type { Project } from '../types/project'
import { listClients } from '@modules/clients/services/clients-service'
import type { Client } from '@modules/clients/types'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (project: Project) => void
}

const NO_CLIENT_VALUE = '__none__'

export default function CreateProjectDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateProjectDialogProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [clientId, setClientId] = useState<string>(NO_CLIENT_VALUE)
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [saving, setSaving] = useState(false)

  // Auto-generate slug from name unless user has manually edited it
  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(name))
    }
  }, [name, slugTouched])

  // Load clients list when dialog opens
  useEffect(() => {
    if (!open) return
    setLoadingClients(true)
    listClients()
      .then(setClients)
      .catch(() => {
        // Silently fail — clients dropdown will just be empty
      })
      .finally(() => setLoadingClients(false))
  }, [open])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName('')
      setSlug('')
      setSlugTouched(false)
      setClientId(NO_CLIENT_VALUE)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) {
      toast.error('Nome e slug sao obrigatorios.')
      return
    }

    setSaving(true)
    try {
      const project = await createProject({
        name: name.trim(),
        slug: slug.trim(),
        client_id: clientId === NO_CLIENT_VALUE ? null : clientId,
      })
      toast.success('Projeto criado!')
      onCreated(project)
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar projeto.'
      toast.error('Erro ao criar projeto', { description: message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogDescription>
            Crie um novo projeto vinculado a um cliente ou diretamente a organizacao.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nome do Projeto</Label>
            <Input
              id="project-name"
              placeholder="Ex: Dashboard Financeiro"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-slug">Slug</Label>
            <Input
              id="project-slug"
              placeholder="Ex: dashboard-financeiro"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugTouched(true)
              }}
            />
            <p className="text-xs text-muted-foreground">
              Identificador unico na URL. Gerado automaticamente a partir do nome.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-client">Cliente (opcional)</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="project-client">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CLIENT_VALUE}>Minha organizacao</SelectItem>
                {loadingClients && (
                  <SelectItem value="__loading__" disabled>
                    Carregando...
                  </SelectItem>
                )}
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Vincule a um cliente existente ou deixe como projeto interno da org.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
