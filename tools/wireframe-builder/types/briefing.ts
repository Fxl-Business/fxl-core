// ---------------------------------------------------------------------------
// BriefingConfig — structured client briefing data
// ---------------------------------------------------------------------------

export type ProductContext = {
  productType?: string       // 'BI de Plataforma', 'Dashboard Customizado'
  sourceSystem?: string      // 'Conta Azul', 'Omie', etc.
  objective?: string         // one-paragraph product objective
  approval?: string          // 'Interna FXL', 'Cliente externo'
  corePremise?: string       // key design premise
}

export type FieldMapping = {
  field: string              // 'Nome do cliente'
  usage: string              // 'Ranking e filtro por cliente'
}

export type KpiCategory = {
  category: string           // 'Receita', 'Despesa', 'DRE / Margens', 'Caixa'
  confirmed: string[]        // validated KPIs
  suggested?: string[]       // awaiting validation
  blocked?: string[]         // desired but no data source
}

export type StatusRule = {
  condition: string          // 'Valor pago / recebido preenchido'
  status: string             // 'Pago / Recebido'
}

export type BusinessRule = {
  rule: string               // concise rule text
}

export type DataSource = {
  system: string             // 'Conta Azul', 'Excel', etc.
  exportType: string         // 'CSV', 'XLSX', 'API'
  fields: string[]           // key fields available
  fieldMappings?: FieldMapping[]  // detailed field-to-usage mapping
}

export type BriefingModule = {
  name: string               // 'DRE Gerencial', 'Fluxo de Caixa'
  kpis: string[]             // ['Receita Total', 'Margem Bruta']
  businessRules?: string
}

export type CompanyInfo = {
  name: string
  segment: string
  size: string               // 'PME', 'Medio', 'Grande'
  description?: string
}

export type BriefingConfig = {
  companyInfo: CompanyInfo
  dataSources: DataSource[]
  modules: BriefingModule[]
  targetAudience: string
  freeFormNotes: string      // markdown for additional context
  // Extended briefing fields (optional for backward compat)
  productContext?: ProductContext
  kpiCategories?: KpiCategory[]
  statusRules?: StatusRule[]
  businessRules?: BusinessRule[]
}
