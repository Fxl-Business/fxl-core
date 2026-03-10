// ---------------------------------------------------------------------------
// BriefingConfig — structured client briefing data
// ---------------------------------------------------------------------------

export type DataSource = {
  system: string       // 'Conta Azul', 'Excel', etc.
  exportType: string   // 'CSV', 'XLSX', 'API'
  fields: string[]     // key fields available
}

export type BriefingModule = {
  name: string         // 'DRE Gerencial', 'Fluxo de Caixa'
  kpis: string[]       // ['Receita Total', 'Margem Bruta']
  businessRules?: string
}

export type CompanyInfo = {
  name: string
  segment: string
  size: string         // 'PME', 'Medio', 'Grande'
  description?: string
}

export type BriefingConfig = {
  companyInfo: CompanyInfo
  dataSources: DataSource[]
  modules: BriefingModule[]
  targetAudience: string
  freeFormNotes: string  // markdown for additional context
}
