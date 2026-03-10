import { useCallback, useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useUser } from '@clerk/react'
import { Loader2, Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  loadBriefing,
  saveBriefing,
} from '@tools/wireframe-builder/lib/briefing-store'
import type {
  BriefingConfig,
  DataSource,
  BriefingModule,
} from '@tools/wireframe-builder/types/briefing'

// ---------------------------------------------------------------------------
// Empty defaults
// ---------------------------------------------------------------------------

function emptyDataSource(): DataSource {
  return { system: '', exportType: 'CSV', fields: [] }
}

function emptyModule(): BriefingModule {
  return { name: '', kpis: [], businessRules: '' }
}

function emptyBriefing(): BriefingConfig {
  return {
    companyInfo: { name: '', segment: '', size: 'PME', description: '' },
    dataSources: [emptyDataSource()],
    modules: [emptyModule()],
    targetAudience: '',
    freeFormNotes: '',
  }
}

// ---------------------------------------------------------------------------
// Wrapper component — extracts clientSlug, guards with Navigate
// ---------------------------------------------------------------------------

export default function BriefingForm() {
  const { clientSlug } = useParams<{ clientSlug: string }>()

  if (!clientSlug) {
    return <Navigate to="/" replace />
  }

  return <BriefingFormInner clientSlug={clientSlug} />
}

// ---------------------------------------------------------------------------
// Inner component — receives guaranteed clientSlug
// ---------------------------------------------------------------------------

function BriefingFormInner({ clientSlug }: { clientSlug: string }) {
  const { user } = useUser()
  const [config, setConfig] = useState<BriefingConfig>(emptyBriefing())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // --- Load existing briefing on mount ---

  useEffect(() => {
    async function init() {
      try {
        const data = await loadBriefing(clientSlug)
        if (data) {
          setConfig(data)
        }
      } catch (err) {
        console.error('Failed to load briefing:', err)
        const message = err instanceof Error ? err.message : 'Erro ao carregar briefing.'
        toast.error('Erro ao carregar briefing', { description: message })
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [clientSlug])

  // --- Save handler ---

  const handleSave = useCallback(async () => {
    if (!user) {
      toast.error('Voce precisa estar autenticado para salvar.')
      return
    }
    setSaving(true)
    try {
      await saveBriefing(clientSlug, config, user.id)
      toast.success('Briefing salvo!')
    } catch (err) {
      console.error('Failed to save briefing:', err)
      const message = err instanceof Error ? err.message : 'Erro ao salvar briefing.'
      toast.error('Erro ao salvar', { description: message })
    } finally {
      setSaving(false)
    }
  }, [clientSlug, config, user])

  // --- Company Info updaters ---

  function updateCompanyInfo(field: keyof BriefingConfig['companyInfo'], value: string) {
    setConfig((prev) => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, [field]: value },
    }))
  }

  // --- Data Sources updaters ---

  function updateDataSource(index: number, field: keyof DataSource, value: string | string[]) {
    setConfig((prev) => {
      const sources = [...prev.dataSources]
      sources[index] = { ...sources[index], [field]: value }
      return { ...prev, dataSources: sources }
    })
  }

  function addDataSource() {
    setConfig((prev) => ({
      ...prev,
      dataSources: [...prev.dataSources, emptyDataSource()],
    }))
  }

  function removeDataSource(index: number) {
    setConfig((prev) => ({
      ...prev,
      dataSources: prev.dataSources.filter((_, i) => i !== index),
    }))
  }

  // --- Modules updaters ---

  function updateModule(index: number, field: keyof BriefingModule, value: string | string[]) {
    setConfig((prev) => {
      const mods = [...prev.modules]
      mods[index] = { ...mods[index], [field]: value }
      return { ...prev, modules: mods }
    })
  }

  function addModule() {
    setConfig((prev) => ({
      ...prev,
      modules: [...prev.modules, emptyModule()],
    }))
  }

  function removeModule(index: number) {
    setConfig((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }))
  }

  // --- Render: loading state ---

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Carregando briefing...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      {/* Page header + save button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Briefing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dados estruturados do cliente para geracao do blueprint.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {/* Section 1: Informacoes da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Informacoes da Empresa</CardTitle>
          <CardDescription>Dados basicos sobre a empresa do cliente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input
                id="company-name"
                placeholder="Ex: Conta Azul"
                value={config.companyInfo.name}
                onChange={(e) => updateCompanyInfo('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-segment">Segmento</Label>
              <Input
                id="company-segment"
                placeholder="Ex: Financeiro, Varejo"
                value={config.companyInfo.segment}
                onChange={(e) => updateCompanyInfo('segment', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-size">Porte</Label>
            <Select
              value={config.companyInfo.size}
              onValueChange={(value) => updateCompanyInfo('size', value)}
            >
              <SelectTrigger id="company-size">
                <SelectValue placeholder="Selecione o porte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PME">PME</SelectItem>
                <SelectItem value="Medio">Medio</SelectItem>
                <SelectItem value="Grande">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-description">Descricao (opcional)</Label>
            <Textarea
              id="company-description"
              placeholder="Breve descricao da empresa e seu contexto de negocio"
              value={config.companyInfo.description ?? ''}
              onChange={(e) => updateCompanyInfo('description', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Fontes de Dados */}
      <Card>
        <CardHeader>
          <CardTitle>Fontes de Dados</CardTitle>
          <CardDescription>Sistemas e formatos de exportacao do cliente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.dataSources.map((source, index) => (
            <div
              key={index}
              className="space-y-3 rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Fonte {index + 1}
                </span>
                {config.dataSources.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDataSource(index)}
                    className="h-7 px-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Sistema</Label>
                  <Input
                    placeholder="Ex: Conta Azul, Excel"
                    value={source.system}
                    onChange={(e) =>
                      updateDataSource(index, 'system', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Formato de Exportacao</Label>
                  <Select
                    value={source.exportType}
                    onValueChange={(value) =>
                      updateDataSource(index, 'exportType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSV">CSV</SelectItem>
                      <SelectItem value="XLSX">XLSX</SelectItem>
                      <SelectItem value="API">API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Campos Disponiveis</Label>
                <Input
                  placeholder="Ex: receita, despesa, data (separados por virgula)"
                  value={source.fields.join(', ')}
                  onChange={(e) =>
                    updateDataSource(
                      index,
                      'fields',
                      e.target.value
                        .split(',')
                        .map((f) => f.trim())
                        .filter(Boolean)
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Separe os campos por virgula.
                </p>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addDataSource}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Fonte de Dados
          </Button>
        </CardContent>
      </Card>

      {/* Section 3: Modulos e KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>Modulos e KPIs</CardTitle>
          <CardDescription>Modulos do dashboard e seus indicadores.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.modules.map((mod, index) => (
            <div
              key={index}
              className="space-y-3 rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Modulo {index + 1}
                </span>
                {config.modules.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeModule(index)}
                    className="h-7 px-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Nome do Modulo</Label>
                <Input
                  placeholder="Ex: DRE Gerencial, Fluxo de Caixa"
                  value={mod.name}
                  onChange={(e) =>
                    updateModule(index, 'name', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>KPIs</Label>
                <Input
                  placeholder="Ex: Receita Total, Margem Bruta (separados por virgula)"
                  value={mod.kpis.join(', ')}
                  onChange={(e) =>
                    updateModule(
                      index,
                      'kpis',
                      e.target.value
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean)
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Separe os KPIs por virgula.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Regras de Negocio (opcional)</Label>
                <Textarea
                  placeholder="Regras especificas para este modulo"
                  value={mod.businessRules ?? ''}
                  onChange={(e) =>
                    updateModule(index, 'businessRules', e.target.value)
                  }
                  rows={2}
                />
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addModule}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Modulo
          </Button>
        </CardContent>
      </Card>

      {/* Section 4: Publico-alvo */}
      <Card>
        <CardHeader>
          <CardTitle>Publico-alvo</CardTitle>
          <CardDescription>Quem vai consumir o dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: Diretores financeiros e controllers de PMEs que precisam de visao consolidada de receita vs despesa"
            value={config.targetAudience}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                targetAudience: e.target.value,
              }))
            }
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Section 5: Notas Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Notas Adicionais</CardTitle>
          <CardDescription>Contexto livre em formato Markdown.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Informacoes adicionais, edge cases, observacoes..."
            value={config.freeFormNotes}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                freeFormNotes: e.target.value,
              }))
            }
            rows={6}
            className="font-mono text-sm"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Suporta Markdown. Use para capturar contexto que nao se encaixa nas secoes acima.
          </p>
        </CardContent>
      </Card>

      {/* Bottom save button */}
      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? 'Salvando...' : 'Salvar Briefing'}
        </Button>
      </div>
    </div>
  )
}
