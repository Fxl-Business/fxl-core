import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plug, Plus, Trash2, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Switch } from '@shared/ui/switch'
import { Label } from '@shared/ui/label'
import { Separator } from '@shared/ui/separator'
import {
  listAllConnectorConfigs,
  upsertConnectorConfig,
  deleteConnectorConfig,
  toggleConnectorEnabled,
} from '@modules/connector/services/connector-config-service'
import { fetchHealth } from '@modules/connector/services/connector-service'
import type { ConnectorConfig } from '@modules/connector/types'
import { useActiveOrg } from '@platform/tenants/useActiveOrg'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConnectorRow extends ConnectorConfig {
  enabled: boolean
}

type HealthStatus = 'idle' | 'checking' | 'online' | 'offline'

// ---------------------------------------------------------------------------
// Connector form (add/edit)
// ---------------------------------------------------------------------------

interface ConnectorFormProps {
  initial?: ConnectorConfig
  onSave: (config: ConnectorConfig) => Promise<void>
  onCancel: () => void
}

function ConnectorForm({ initial, onSave, onCancel }: ConnectorFormProps) {
  const [appId, setAppId] = useState(initial?.appId ?? '')
  const [appName, setAppName] = useState(initial?.appName ?? '')
  const [baseUrl, setBaseUrl] = useState(initial?.baseUrl ?? '')
  const [apiKey, setApiKey] = useState(initial?.apiKey ?? '')
  const [saving, setSaving] = useState(false)
  const isEdit = !!initial

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!appId.trim() || !baseUrl.trim() || !apiKey.trim()) {
      toast.error('Preencha todos os campos obrigatorios')
      return
    }
    setSaving(true)
    await onSave({ appId: appId.trim(), appName: appName.trim(), baseUrl: baseUrl.trim().replace(/\/$/, ''), apiKey: apiKey.trim() })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-5 dark:bg-card dark:border-slate-700 space-y-4">
      <h3 className="font-semibold text-slate-900 dark:text-foreground">
        {isEdit ? 'Editar Connector' : 'Novo Connector'}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="appId">App ID *</Label>
          <Input
            id="appId"
            placeholder="sitio-santa-cruz"
            value={appId}
            onChange={e => setAppId(e.target.value)}
            disabled={isEdit}
          />
          <p className="text-[11px] text-slate-400">Identificador unico (sem espacos)</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="appName">Nome</Label>
          <Input
            id="appName"
            placeholder="Sitio Santa Cruz"
            value={appName}
            onChange={e => setAppName(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="baseUrl">Base URL *</Label>
        <Input
          id="baseUrl"
          placeholder="https://sitio-santa-cruz.vercel.app"
          value={baseUrl}
          onChange={e => setBaseUrl(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="apiKey">API Key *</Label>
        <Input
          id="apiKey"
          type="password"
          placeholder="Chave de autenticacao hub→spoke"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
        />
        <p className="text-[11px] text-slate-400">
          Enviada como header X-FXL-API-Key em cada request
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving} size="sm">
          {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {isEdit ? 'Salvar' : 'Adicionar'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Connector card
// ---------------------------------------------------------------------------

interface ConnectorCardProps {
  connector: ConnectorRow
  onEdit: (c: ConnectorRow) => void
  onDelete: (appId: string) => void
  onToggle: (appId: string, enabled: boolean) => void
}

function ConnectorCard({ connector, onEdit, onDelete, onToggle }: ConnectorCardProps) {
  const [showKey, setShowKey] = useState(false)
  const [health, setHealth] = useState<HealthStatus>('idle')

  async function checkHealth() {
    setHealth('checking')
    const result = await fetchHealth(connector.baseUrl, connector.apiKey)
    setHealth(result.ok ? 'online' : 'offline')
  }

  return (
    <div className="rounded-xl border bg-white p-5 dark:bg-card dark:border-slate-700">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Plug className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-foreground">
              {connector.appName || connector.appId}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium font-mono text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {connector.appId}
            </span>
            {health === 'online' && (
              <span className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Online
              </span>
            )}
            {health === 'offline' && (
              <span className="flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
                <XCircle className="h-3 w-3" /> Offline
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
            {connector.baseUrl}
          </p>
        </div>
      </div>

      {/* API Key */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-slate-400">API Key:</span>
        <code className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {showKey ? connector.apiKey : '••••••••••••••••'}
        </code>
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>

      <Separator className="my-3" />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={connector.enabled}
            onCheckedChange={checked => onToggle(connector.appId, checked)}
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {connector.enabled ? 'Ativo' : 'Desativado'}
          </span>
        </div>
        <div className="ml-auto flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={checkHealth} disabled={health === 'checking'}>
            {health === 'checking' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Testar'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(connector)}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 dark:text-red-400" onClick={() => onDelete(connector.appId)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ConnectorsPanel page
// ---------------------------------------------------------------------------

export default function ConnectorsPanel() {
  const { activeOrg } = useActiveOrg()
  const [connectors, setConnectors] = useState<ConnectorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ConnectorRow | null>(null)

  async function loadConnectors() {
    setLoading(true)
    const data = await listAllConnectorConfigs()
    setConnectors(data)
    setLoading(false)
  }

  useEffect(() => {
    void loadConnectors()
  }, [])

  async function handleSave(config: ConnectorConfig) {
    const result = await upsertConnectorConfig(config, true, activeOrg?.id ?? '')
    if (result.ok) {
      toast.success(editing ? 'Connector atualizado' : 'Connector adicionado')
      setShowForm(false)
      setEditing(null)
      await loadConnectors()
    } else {
      toast.error(`Erro: ${result.error}`)
    }
  }

  async function handleDelete(appId: string) {
    const result = await deleteConnectorConfig(appId, activeOrg?.id ?? '')
    if (result.ok) {
      toast('Connector removido')
      await loadConnectors()
    } else {
      toast.error(`Erro: ${result.error}`)
    }
  }

  async function handleToggle(appId: string, enabled: boolean) {
    const result = await toggleConnectorEnabled(appId, enabled, activeOrg?.id ?? '')
    if (result.ok) {
      toast(enabled ? 'Connector ativado' : 'Connector desativado')
      await loadConnectors()
    } else {
      toast.error(`Erro: ${result.error}`)
    }
  }

  function handleEdit(connector: ConnectorRow) {
    setEditing(connector)
    setShowForm(true)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">
            Conectores
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gerencie as conexoes com aplicacoes externas (spokes).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
            {connectors.filter(c => c.enabled).length} de {connectors.length} ativos
          </span>
          {!showForm && (
            <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Novo Connector
            </Button>
          )}
        </div>
      </div>

      {/* Form (add/edit) */}
      {showForm && (
        <ConnectorForm
          initial={editing ?? undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {/* Connector cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : connectors.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-slate-50 p-12 text-center dark:bg-slate-900/50 dark:border-slate-700">
          <Plug className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Nenhum connector cadastrado.
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Conecte uma spoke para ver seus dados no hub.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {connectors.map(c => (
            <ConnectorCard
              key={c.appId}
              connector={c}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
