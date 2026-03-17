import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { createTenant } from '@platform/services/tenant-service'

interface CreateTenantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CreateTenantDialog({ open, onOpenChange, onCreated }: CreateTenantDialogProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleClose(isOpen: boolean) {
    if (!submitting) {
      if (!isOpen) {
        setName('')
        setSlug('')
        setNameError(null)
      }
      onOpenChange(isOpen)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (name.trim().length < 2) {
      setNameError('O nome deve ter pelo menos 2 caracteres')
      return
    }

    setNameError(null)
    setSubmitting(true)

    try {
      await createTenant({ name: name.trim(), slug: slug.trim() || undefined })
      toast.success('Tenant criado com sucesso')
      onCreated()
      handleClose(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar tenant')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Tenant</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field */}
          <div className="space-y-1.5">
            <Label htmlFor="tenant-name">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tenant-name"
              placeholder="Nome da organizacao"
              value={name}
              onChange={e => {
                setName(e.target.value)
                if (nameError) setNameError(null)
              }}
              disabled={submitting}
              autoFocus
            />
            {nameError && (
              <p className="text-xs text-red-500 dark:text-red-400">{nameError}</p>
            )}
          </div>

          {/* Slug field */}
          <div className="space-y-1.5">
            <Label htmlFor="tenant-slug">Slug</Label>
            <Input
              id="tenant-slug"
              placeholder="slug-url-friendly"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              disabled={submitting}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Opcional — gerado automaticamente se vazio
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar Tenant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
