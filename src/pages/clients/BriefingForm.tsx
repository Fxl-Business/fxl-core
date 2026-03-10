import { useCallback, useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useUser } from '@clerk/react'
import { Loader2, Plus, Trash2, Save, Pencil } from 'lucide-react'
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
  ProductContext,
  FieldMapping,
  KpiCategory,
  StatusRule,
  BusinessRule,
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

function emptyProductContext(): ProductContext {
  return { productType: '', sourceSystem: '', objective: '', approval: '', corePremise: '' }
}

function emptyFieldMapping(): FieldMapping {
  return { field: '', usage: '' }
}

function emptyKpiCategory(): KpiCategory {
  return { category: '', confirmed: [], suggested: [], blocked: [] }
}

function emptyStatusRule(): StatusRule {
  return { condition: '', status: '' }
}

function emptyBusinessRule(): BusinessRule {
  return { rule: '' }
}

function emptyBriefing(): BriefingConfig {
  return {
    companyInfo: { name: '', segment: '', size: 'PME', description: '' },
    dataSources: [emptyDataSource()],
    modules: [emptyModule()],
    targetAudience: '',
    freeFormNotes: '',
    productContext: undefined,
    kpiCategories: undefined,
    statusRules: undefined,
    businessRules: undefined,
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
// View mode helpers — render read-only values
// ---------------------------------------------------------------------------

function ViewField({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value || 'Nao informado.'}</p>
    </div>
  )
}

function ViewList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">
        {items.length > 0 ? items.join(', ') : 'Nenhum item cadastrado.'}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inner component — receives guaranteed clientSlug
// ---------------------------------------------------------------------------

function BriefingFormInner({ clientSlug }: { clientSlug: string }) {
  const { user } = useUser()
  const [config, setConfig] = useState<BriefingConfig>(emptyBriefing())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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

  // --- Product Context updaters ---

  function updateProductContext(field: keyof ProductContext, value: string) {
    setConfig((prev) => ({
      ...prev,
      productContext: { ...(prev.productContext ?? emptyProductContext()), [field]: value },
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

  function updateFieldMapping(sourceIndex: number, mappingIndex: number, field: keyof FieldMapping, value: string) {
    setConfig((prev) => {
      const sources = [...prev.dataSources]
      const mappings = [...(sources[sourceIndex].fieldMappings ?? [])]
      mappings[mappingIndex] = { ...mappings[mappingIndex], [field]: value }
      sources[sourceIndex] = { ...sources[sourceIndex], fieldMappings: mappings }
      return { ...prev, dataSources: sources }
    })
  }

  function addFieldMapping(sourceIndex: number) {
    setConfig((prev) => {
      const sources = [...prev.dataSources]
      const mappings = [...(sources[sourceIndex].fieldMappings ?? []), emptyFieldMapping()]
      sources[sourceIndex] = { ...sources[sourceIndex], fieldMappings: mappings }
      return { ...prev, dataSources: sources }
    })
  }

  function removeFieldMapping(sourceIndex: number, mappingIndex: number) {
    setConfig((prev) => {
      const sources = [...prev.dataSources]
      const mappings = (sources[sourceIndex].fieldMappings ?? []).filter((_, i) => i !== mappingIndex)
      sources[sourceIndex] = { ...sources[sourceIndex], fieldMappings: mappings.length > 0 ? mappings : undefined }
      return { ...prev, dataSources: sources }
    })
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

  // --- KPI Categories updaters ---

  function updateKpiCategory(index: number, field: keyof KpiCategory, value: string | string[]) {
    setConfig((prev) => {
      const cats = [...(prev.kpiCategories ?? [])]
      cats[index] = { ...cats[index], [field]: value }
      return { ...prev, kpiCategories: cats }
    })
  }

  function addKpiCategory() {
    setConfig((prev) => ({
      ...prev,
      kpiCategories: [...(prev.kpiCategories ?? []), emptyKpiCategory()],
    }))
  }

  function removeKpiCategory(index: number) {
    setConfig((prev) => {
      const cats = (prev.kpiCategories ?? []).filter((_, i) => i !== index)
      return { ...prev, kpiCategories: cats.length > 0 ? cats : undefined }
    })
  }

  // --- Status Rules updaters ---

  function updateStatusRule(index: number, field: keyof StatusRule, value: string) {
    setConfig((prev) => {
      const rules = [...(prev.statusRules ?? [])]
      rules[index] = { ...rules[index], [field]: value }
      return { ...prev, statusRules: rules }
    })
  }

  function addStatusRule() {
    setConfig((prev) => ({
      ...prev,
      statusRules: [...(prev.statusRules ?? []), emptyStatusRule()],
    }))
  }

  function removeStatusRule(index: number) {
    setConfig((prev) => {
      const rules = (prev.statusRules ?? []).filter((_, i) => i !== index)
      return { ...prev, statusRules: rules.length > 0 ? rules : undefined }
    })
  }

  // --- Business Rules updaters ---

  function updateBusinessRule(index: number, value: string) {
    setConfig((prev) => {
      const rules = [...(prev.businessRules ?? [])]
      rules[index] = { rule: value }
      return { ...prev, businessRules: rules }
    })
  }

  function addBusinessRule() {
    setConfig((prev) => ({
      ...prev,
      businessRules: [...(prev.businessRules ?? []), emptyBusinessRule()],
    }))
  }

  function removeBusinessRule(index: number) {
    setConfig((prev) => {
      const rules = (prev.businessRules ?? []).filter((_, i) => i !== index)
      return { ...prev, businessRules: rules.length > 0 ? rules : undefined }
    })
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
      {/* Page header + mode toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Briefing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dados estruturados do cliente para geracao do blueprint.
          </p>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      {/* Section 1: Informacoes da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Informacoes da Empresa</CardTitle>
          <CardDescription>Dados basicos sobre a empresa do cliente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
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
            </>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <ViewField label="Nome da Empresa" value={config.companyInfo.name} />
              <ViewField label="Segmento" value={config.companyInfo.segment} />
              <ViewField label="Porte" value={config.companyInfo.size} />
              <ViewField label="Descricao" value={config.companyInfo.description} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Contexto do Produto */}
      <Card>
        <CardHeader>
          <CardTitle>Contexto do Produto</CardTitle>
          <CardDescription>Tipo de produto, sistema de origem e premissas de design.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-type">Tipo de Produto</Label>
                  <Input
                    id="product-type"
                    placeholder="Ex: BI de Plataforma, Dashboard Customizado"
                    value={config.productContext?.productType ?? ''}
                    onChange={(e) => updateProductContext('productType', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source-system">Sistema de Origem</Label>
                  <Input
                    id="source-system"
                    placeholder="Ex: Conta Azul, Omie"
                    value={config.productContext?.sourceSystem ?? ''}
                    onChange={(e) => updateProductContext('sourceSystem', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-objective">Objetivo do Produto</Label>
                <Textarea
                  id="product-objective"
                  placeholder="Descricao do objetivo principal do produto"
                  value={config.productContext?.objective ?? ''}
                  onChange={(e) => updateProductContext('objective', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-approval">Aprovacao</Label>
                <Input
                  id="product-approval"
                  placeholder="Ex: Interna FXL, Cliente externo"
                  value={config.productContext?.approval ?? ''}
                  onChange={(e) => updateProductContext('approval', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="core-premise">Premissa Principal</Label>
                <Textarea
                  id="core-premise"
                  placeholder="Premissa de design principal do produto"
                  value={config.productContext?.corePremise ?? ''}
                  onChange={(e) => updateProductContext('corePremise', e.target.value)}
                  rows={2}
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <ViewField label="Tipo de Produto" value={config.productContext?.productType} />
                <ViewField label="Sistema de Origem" value={config.productContext?.sourceSystem} />
              </div>
              <ViewField label="Objetivo do Produto" value={config.productContext?.objective} />
              <ViewField label="Aprovacao" value={config.productContext?.approval} />
              <ViewField label="Premissa Principal" value={config.productContext?.corePremise} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Fontes de Dados */}
      <Card>
        <CardHeader>
          <CardTitle>Fontes de Dados</CardTitle>
          <CardDescription>Sistemas e formatos de exportacao do cliente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
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

                  {/* Field Mappings sub-section */}
                  <div className="space-y-3 border-t border-border pt-3">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Mapeamento de Campos (opcional)
                    </Label>
                    {(source.fieldMappings ?? []).map((mapping, mIdx) => (
                      <div key={mIdx} className="flex items-start gap-2">
                        <div className="flex-1 space-y-1">
                          <Input
                            placeholder="Campo"
                            value={mapping.field}
                            onChange={(e) =>
                              updateFieldMapping(index, mIdx, 'field', e.target.value)
                            }
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <Input
                            placeholder="Uso"
                            value={mapping.usage}
                            onChange={(e) =>
                              updateFieldMapping(index, mIdx, 'usage', e.target.value)
                            }
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFieldMapping(index, mIdx)}
                          className="mt-0.5 h-8 px-2 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addFieldMapping(index)}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-3.5 w-3.5" />
                      Adicionar Mapeamento
                    </Button>
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
            </>
          ) : config.dataSources.length === 0 || (config.dataSources.length === 1 && !config.dataSources[0].system) ? (
            <p className="text-sm text-muted-foreground">Nenhuma fonte cadastrada.</p>
          ) : (
            config.dataSources.filter((s) => s.system).map((source, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-border p-4"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  Fonte {index + 1}
                </span>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ViewField label="Sistema" value={source.system} />
                  <ViewField label="Formato de Exportacao" value={source.exportType} />
                </div>
                <ViewList label="Campos Disponiveis" items={source.fields} />
                {(source.fieldMappings ?? []).length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Mapeamento de Campos</p>
                    <div className="space-y-1">
                      {(source.fieldMappings ?? []).map((m, mIdx) => (
                        <p key={mIdx} className="text-sm text-foreground">
                          {m.field} &rarr; {m.usage}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Section 4: Modulos e KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>Modulos e KPIs</CardTitle>
          <CardDescription>Modulos do dashboard e seus indicadores.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
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
            </>
          ) : config.modules.length === 0 || (config.modules.length === 1 && !config.modules[0].name) ? (
            <p className="text-sm text-muted-foreground">Nenhum modulo cadastrado.</p>
          ) : (
            config.modules.filter((m) => m.name).map((mod, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-border p-4"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  Modulo {index + 1}
                </span>
                <ViewField label="Nome" value={mod.name} />
                <ViewList label="KPIs" items={mod.kpis} />
                {mod.businessRules && (
                  <ViewField label="Regras de Negocio" value={mod.businessRules} />
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Section 5: Categorias de KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias de KPIs</CardTitle>
          <CardDescription>Classificacao dos KPIs por categoria com status de confirmacao.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              {(config.kpiCategories ?? []).map((cat, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-lg border border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Categoria {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKpiCategory(index)}
                      className="h-7 px-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Nome da Categoria</Label>
                    <Input
                      placeholder="Ex: Receita, Despesa, DRE / Margens"
                      value={cat.category}
                      onChange={(e) =>
                        updateKpiCategory(index, 'category', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>KPIs Confirmados</Label>
                    <Input
                      placeholder="KPIs confirmados (separados por virgula)"
                      value={cat.confirmed.join(', ')}
                      onChange={(e) =>
                        updateKpiCategory(
                          index,
                          'confirmed',
                          e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>KPIs Sugeridos (opcional)</Label>
                    <Input
                      placeholder="KPIs sugeridos aguardando validacao (separados por virgula)"
                      value={(cat.suggested ?? []).join(', ')}
                      onChange={(e) =>
                        updateKpiCategory(
                          index,
                          'suggested',
                          e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>KPIs Bloqueados (opcional)</Label>
                    <Input
                      placeholder="KPIs desejados mas sem fonte de dados (separados por virgula)"
                      value={(cat.blocked ?? []).join(', ')}
                      onChange={(e) =>
                        updateKpiCategory(
                          index,
                          'blocked',
                          e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addKpiCategory}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Categoria de KPI
              </Button>
            </>
          ) : (config.kpiCategories ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>
          ) : (
            (config.kpiCategories ?? []).map((cat, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-border p-4"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  Categoria {index + 1}
                </span>
                <ViewField label="Categoria" value={cat.category} />
                <ViewList label="Confirmados" items={cat.confirmed} />
                <ViewList label="Sugeridos" items={cat.suggested ?? []} />
                <ViewList label="Bloqueados" items={cat.blocked ?? []} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Section 6: Regras de Classificacao de Status */}
      <Card>
        <CardHeader>
          <CardTitle>Regras de Classificacao de Status</CardTitle>
          <CardDescription>Condicoes para classificar lancamentos por status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              {(config.statusRules ?? []).map((rule, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2"
                >
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Condicao</Label>
                    <Input
                      placeholder="Ex: Valor pago / recebido preenchido"
                      value={rule.condition}
                      onChange={(e) =>
                        updateStatusRule(index, 'condition', e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Input
                      placeholder="Ex: Pago / Recebido"
                      value={rule.status}
                      onChange={(e) =>
                        updateStatusRule(index, 'status', e.target.value)
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStatusRule(index)}
                    className="mt-5 h-8 px-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addStatusRule}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Regra de Status
              </Button>
            </>
          ) : (config.statusRules ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma regra de status cadastrada.</p>
          ) : (
            <div className="space-y-2">
              {(config.statusRules ?? []).map((rule, index) => (
                <p key={index} className="text-sm text-foreground">
                  {rule.condition} &rarr; {rule.status}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 7: Regras de Negocio */}
      <Card>
        <CardHeader>
          <CardTitle>Regras de Negocio</CardTitle>
          <CardDescription>Regras gerais que se aplicam ao produto como um todo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              {(config.businessRules ?? []).map((br, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2"
                >
                  <div className="flex-1">
                    <Textarea
                      placeholder="Regra de negocio"
                      value={br.rule}
                      onChange={(e) => updateBusinessRule(index, e.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBusinessRule(index)}
                    className="mt-0.5 h-8 px-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addBusinessRule}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Regra de Negocio
              </Button>
            </>
          ) : (config.businessRules ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma regra de negocio cadastrada.</p>
          ) : (
            <div className="space-y-2">
              {(config.businessRules ?? []).map((br, index) => (
                <p key={index} className="text-sm text-foreground">{br.rule}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 8: Publico-alvo */}
      <Card>
        <CardHeader>
          <CardTitle>Publico-alvo</CardTitle>
          <CardDescription>Quem vai consumir o dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
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
          ) : (
            <p className="text-sm text-foreground">
              {config.targetAudience || 'Nao informado.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 9: Notas Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Notas Adicionais</CardTitle>
          <CardDescription>Contexto livre em formato Markdown.</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <>
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
            </>
          ) : (
            <p className="text-sm text-foreground" style={{ whiteSpace: 'pre-wrap' }}>
              {config.freeFormNotes || 'Nao informado.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bottom save button — only in edit mode */}
      {isEditing && (
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
      )}
    </div>
  )
}
