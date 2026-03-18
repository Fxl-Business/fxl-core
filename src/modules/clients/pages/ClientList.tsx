import { useCallback, useState } from 'react'
import { Plus, Users, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog'
import { useClients } from '../hooks/useClients'
import { createClient } from '../services/clients-service'
import type { ClientFormData } from '../components/ClientForm'
import ClientCard from '../components/ClientCard'
import ClientForm from '../components/ClientForm'

// ---------------------------------------------------------------------------
// ClientList — /clientes
// ---------------------------------------------------------------------------

export default function ClientList() {
  const { clients, loading, error, refetch } = useClients()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleCreate = useCallback(
    async (params: ClientFormData) => {
      setSaving(true)
      try {
        await createClient(params)
        setDialogOpen(false)
        refetch()
      } catch (err) {
        console.error('[ClientList] create failed:', err)
      } finally {
        setSaving(false)
      }
    },
    [refetch],
  )

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-400 dark:ring-indigo-400/30">
            Clientes
          </span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
            Clientes
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            Cadastro de clientes da organizacao.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="mt-4 gap-2">
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      {/* Content */}
      <div className="mt-8">
        {loading && (
          <div className="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Carregando clientes...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Erro ao carregar clientes: {error}
          </div>
        )}

        {!loading && !error && clients.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
              Nenhum cliente cadastrado
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Crie seu primeiro cliente para comecar.
            </p>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(true)}
              className="mt-4 gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar cliente
            </Button>
          </div>
        )}

        {!loading && !error && clients.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSubmit={handleCreate}
            onCancel={() => setDialogOpen(false)}
            loading={saving}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
