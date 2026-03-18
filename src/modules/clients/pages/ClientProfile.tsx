import { useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Edit2,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog'
import { useClient } from '../hooks/useClients'
import { updateClient } from '../services/clients-service'
import type { ClientStatus } from '../types'
import ClientForm, { type ClientFormData } from '../components/ClientForm'

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  archived: 'Arquivado',
}

const STATUS_VARIANTS: Record<ClientStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-400/30',
  inactive: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-400/30',
  archived: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-400/30',
}

// ---------------------------------------------------------------------------
// ClientProfile — /clientes/:slug
// ---------------------------------------------------------------------------

export default function ClientProfile() {
  const { slug } = useParams<{ slug: string }>()
  const { client, loading, error, refetch } = useClient(slug)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleUpdate = useCallback(
    async (params: ClientFormData) => {
      if (!client) return
      setSaving(true)
      try {
        await updateClient(client.id, params)
        setEditOpen(false)
        refetch()
      } catch (err) {
        console.error('[ClientProfile] update failed:', err)
      } finally {
        setSaving(false)
      }
    },
    [client, refetch],
  )

  // -------------------------------------------------------------------------
  // Loading / Error states
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl items-center justify-center py-24 text-slate-500 dark:text-slate-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Carregando perfil...
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="mx-auto max-w-4xl">
        <Link
          to="/clientes"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para clientes
        </Link>
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error ?? 'Cliente nao encontrado.'}
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back link */}
      <Link
        to="/clientes"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para clientes
      </Link>

      {/* Profile header */}
      <div className="flex items-start gap-5">
        {/* Logo / avatar */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
          {client.logo_url ? (
            <img
              src={client.logo_url}
              alt={client.name}
              className="h-12 w-12 rounded-lg object-contain"
            />
          ) : (
            <Building2 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          )}
        </div>

        {/* Title + status */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="truncate text-3xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
              {client.name}
            </h1>
            <Badge
              variant="outline"
              className={STATUS_VARIANTS[client.status]}
            >
              {STATUS_LABELS[client.status]}
            </Badge>
          </div>
          {client.description && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {client.description}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Slug: {client.slug}
          </p>
        </div>

        {/* Edit button */}
        <Button variant="outline" onClick={() => setEditOpen(true)} className="shrink-0 gap-2">
          <Edit2 className="h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Details cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* Projects link */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              to={`/projetos?client=${client.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Ver projetos deste cliente
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Informacoes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-300">Criado em:</span>{' '}
              {new Date(client.created_at).toLocaleDateString('pt-BR')}
            </div>
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-300">ID:</span>{' '}
              <span className="font-mono text-xs">{client.id}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          <ClientForm
            client={client}
            onSubmit={handleUpdate}
            onCancel={() => setEditOpen(false)}
            loading={saving}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
