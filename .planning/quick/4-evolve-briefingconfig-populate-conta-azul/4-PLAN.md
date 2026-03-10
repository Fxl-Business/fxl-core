---
phase: quick-4
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - tools/wireframe-builder/types/briefing.ts
  - tools/wireframe-builder/lib/briefing-schema.ts
  - src/pages/clients/BriefingForm.tsx
  - tools/wireframe-builder/lib/generation-engine.test.ts
  - tools/wireframe-builder/scripts/seed-briefing-conta-azul.ts
autonomous: true
requirements: [QUICK-4]

must_haves:
  truths:
    - "BriefingConfig supports product context (productType, sourceSystem, objective, approval, corePremise)"
    - "BriefingConfig supports field-to-usage mapping per DataSource"
    - "BriefingConfig supports KPI categories with confirmed/suggested/blocked classifications"
    - "BriefingConfig supports status classification rules and business rules as structured arrays"
    - "financeiro-conta-azul briefing is populated in Supabase with all briefing.md data"
    - "Existing generation engine and tests pass without changes to their logic"
  artifacts:
    - path: "tools/wireframe-builder/types/briefing.ts"
      provides: "Evolved BriefingConfig with product context, field mappings, KPI categories, status rules, business rules"
    - path: "tools/wireframe-builder/lib/briefing-schema.ts"
      provides: "Zod schema matching evolved BriefingConfig"
    - path: "src/pages/clients/BriefingForm.tsx"
      provides: "Form UI with sections for new fields"
    - path: "tools/wireframe-builder/scripts/seed-briefing-conta-azul.ts"
      provides: "CLI script to seed financeiro-conta-azul briefing data"
  key_links:
    - from: "tools/wireframe-builder/types/briefing.ts"
      to: "tools/wireframe-builder/lib/briefing-schema.ts"
      via: "Zod schema mirrors TS type"
      pattern: "BriefingConfigSchema.*z\\.object"
    - from: "tools/wireframe-builder/lib/briefing-schema.ts"
      to: "tools/wireframe-builder/lib/briefing-store.ts"
      via: "safeParse / parse validation"
      pattern: "BriefingConfigSchema\\.(safeParse|parse)"
    - from: "tools/wireframe-builder/types/briefing.ts"
      to: "src/pages/clients/BriefingForm.tsx"
      via: "imports BriefingConfig and sub-types"
      pattern: "from.*types/briefing"
---

<objective>
Evolve BriefingConfig to support richer briefing data (product context, field-to-usage mappings, KPI categories, status classification rules, business rules) and populate the financeiro-conta-azul client briefing with comprehensive data from briefing.md.

Purpose: The current BriefingConfig is too flat to capture the structured briefing data that exists in briefing.md. Enriching the type enables the generation engine and future features to leverage detailed client context rather than relying on freeform markdown.

Output: Evolved type + schema, updated form UI, seeded financeiro-conta-azul briefing in Supabase.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@tools/wireframe-builder/types/briefing.ts
@tools/wireframe-builder/lib/briefing-schema.ts
@tools/wireframe-builder/lib/briefing-store.ts
@src/pages/clients/BriefingForm.tsx
@clients/financeiro-conta-azul/docs/briefing.md
@tools/wireframe-builder/lib/generation-engine.ts
@tools/wireframe-builder/lib/generation-engine.test.ts

<interfaces>
<!-- Existing types and contracts the executor needs. -->

From tools/wireframe-builder/types/briefing.ts (CURRENT -- will be evolved):
```typescript
export type DataSource = {
  system: string
  exportType: string
  fields: string[]
}

export type BriefingModule = {
  name: string
  kpis: string[]
  businessRules?: string
}

export type CompanyInfo = {
  name: string
  segment: string
  size: string
  description?: string
}

export type BriefingConfig = {
  companyInfo: CompanyInfo
  dataSources: DataSource[]
  modules: BriefingModule[]
  targetAudience: string
  freeFormNotes: string
}
```

From tools/wireframe-builder/lib/briefing-store.ts (UNCHANGED -- uses BriefingConfig + BriefingConfigSchema):
```typescript
export async function loadBriefing(clientSlug: string): Promise<BriefingConfig | null>
export async function saveBriefing(clientSlug: string, config: BriefingConfig, updatedBy: string): Promise<void>
```

From tools/wireframe-builder/lib/generation-engine.ts (UNCHANGED -- consumes BriefingConfig):
```typescript
// Uses: briefing.companyInfo.name, briefing.companyInfo.segment
// Uses: briefing.modules[].name, briefing.modules[].kpis
// New optional fields will NOT break this -- all additions are optional or have defaults
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Evolve BriefingConfig type, Zod schema, and BriefingForm UI</name>
  <files>
    tools/wireframe-builder/types/briefing.ts
    tools/wireframe-builder/lib/briefing-schema.ts
    src/pages/clients/BriefingForm.tsx
    tools/wireframe-builder/lib/generation-engine.test.ts
  </files>
  <action>
CRITICAL CONSTRAINT: All new fields MUST be optional (TypeScript `?:` and Zod `.optional()`) to preserve backward compatibility. The generation engine, briefing-store, and existing test fixtures reference the current shape -- they must continue to work unmodified.

**1. Evolve `tools/wireframe-builder/types/briefing.ts`:**

Add these new sub-types BEFORE the existing types:

```typescript
export type ProductContext = {
  productType?: string        // 'BI de Plataforma', 'Dashboard Customizado'
  sourceSystem?: string       // 'Conta Azul', 'Omie', etc.
  objective?: string          // one-paragraph product objective
  approval?: string           // 'Interna FXL', 'Cliente externo'
  corePremise?: string        // key design premise
}
```

```typescript
export type FieldMapping = {
  field: string               // 'Nome do cliente'
  usage: string               // 'Ranking e filtro por cliente'
}
```

Extend `DataSource` by adding ONE new optional field:
```typescript
export type DataSource = {
  system: string
  exportType: string
  fields: string[]
  fieldMappings?: FieldMapping[]  // NEW: detailed field-to-usage mapping
}
```

Add KPI classification type:
```typescript
export type KpiCategory = {
  category: string            // 'Receita', 'Despesa', 'DRE / Margens', 'Caixa'
  confirmed: string[]         // validated KPIs
  suggested?: string[]        // awaiting validation
  blocked?: string[]          // desired but no data source
}
```

Add status classification and business rule types:
```typescript
export type StatusRule = {
  condition: string           // 'Valor pago / recebido preenchido'
  status: string              // 'Pago / Recebido'
}

export type BusinessRule = {
  rule: string                // concise rule text
}
```

Extend `BriefingConfig` with optional fields:
```typescript
export type BriefingConfig = {
  companyInfo: CompanyInfo
  dataSources: DataSource[]
  modules: BriefingModule[]
  targetAudience: string
  freeFormNotes: string
  // NEW optional fields
  productContext?: ProductContext
  kpiCategories?: KpiCategory[]
  statusRules?: StatusRule[]
  businessRules?: BusinessRule[]
}
```

**2. Update `tools/wireframe-builder/lib/briefing-schema.ts`:**

Add corresponding Zod schemas for each new sub-type. All new top-level fields use `.optional()`:

- `ProductContextSchema` = `z.object({...}).optional()`
- `FieldMappingSchema` = `z.object({ field: z.string(), usage: z.string() })`
- Add `fieldMappings: z.array(FieldMappingSchema).optional()` to DataSourceSchema
- `KpiCategorySchema` = `z.object({ category: z.string(), confirmed: z.array(z.string()), suggested: z.array(z.string()).optional(), blocked: z.array(z.string()).optional() })`
- `StatusRuleSchema` = `z.object({ condition: z.string(), status: z.string() })`
- `BusinessRuleSchema` = `z.object({ rule: z.string() })`
- Add to BriefingConfigSchema: `productContext`, `kpiCategories`, `statusRules`, `businessRules` -- all `.optional()`

**3. Update `src/pages/clients/BriefingForm.tsx`:**

Add new form sections BETWEEN the existing sections. Keep the same Card-based layout pattern.

After "Informacoes da Empresa" card, add a "Contexto do Produto" card with fields:
- productType (Input), sourceSystem (Input), objective (Textarea rows=3), approval (Input), corePremise (Textarea rows=2)
- All fields read/write from `config.productContext?.fieldName ?? ''`
- Updater function: `updateProductContext(field, value)` -- follows same pattern as `updateCompanyInfo`

After "Fontes de Dados" card, add a "Mapeamento de Campos" sub-section within each DataSource card:
- Below the existing "Campos Disponiveis" input, add a repeatable field pair (field + usage) with add/remove buttons
- Label: "Mapeamento de Campos (opcional)"
- Uses comma-input pattern: one Input per fieldMapping, "Campo: Uso" format display

After "Modulos e KPIs" card, add a "Categorias de KPIs" card:
- Repeatable items with: category (Input), confirmed (comma-separated Input), suggested (comma-separated Input, optional), blocked (comma-separated Input, optional)
- Add/remove buttons following the same pattern as modules

After KPI categories, add a "Regras de Classificacao de Status" card:
- Repeatable items with: condition (Input), status (Input)
- Add/remove buttons

After status rules, add a "Regras de Negocio" card:
- Repeatable items with: rule (Textarea rows=2)
- Add/remove buttons

Import new types: `ProductContext`, `FieldMapping`, `KpiCategory`, `StatusRule`, `BusinessRule`

Add empty-state factory functions:
- `emptyProductContext(): ProductContext`
- `emptyFieldMapping(): FieldMapping`
- `emptyKpiCategory(): KpiCategory`
- `emptyStatusRule(): StatusRule`
- `emptyBusinessRule(): BusinessRule`

Update `emptyBriefing()` to include `productContext: undefined`, `kpiCategories: undefined`, `statusRules: undefined`, `businessRules: undefined` (so the form starts clean for new clients -- only shows empty inputs, no pre-populated arrays).

IMPORTANT: Do NOT modify generation-engine.ts or briefing-store.ts -- they work as-is with optional fields.

**4. Update test fixtures in `generation-engine.test.ts`:**

The existing test fixtures do NOT include the new optional fields -- this is correct and intentional (they test backward compat). However, verify by running tests that the existing fixtures still pass Zod validation. If any test uses `BriefingConfigSchema.parse()` on a fixture missing required fields, add the missing fields. Current analysis shows `emptyModulesBriefing` is missing `description` on companyInfo but that's already optional -- should be fine. No changes expected, but verify.
  </action>
  <verify>
    <automated>cd /Users/cauetpinciara/Documents/fxl/fxl-core && npx tsc --noEmit && npx vitest run tools/wireframe-builder/lib/generation-engine.test.ts</automated>
  </verify>
  <done>
    - BriefingConfig type has productContext, kpiCategories, statusRules, businessRules as optional fields
    - DataSource has optional fieldMappings array
    - Zod schema validates new shape while accepting old shape (backward compat)
    - BriefingForm renders new sections with add/remove UX
    - All existing generation-engine tests pass unchanged
    - Zero TypeScript errors
  </done>
</task>

<task type="auto">
  <name>Task 2: Seed financeiro-conta-azul briefing data via CLI script</name>
  <files>
    tools/wireframe-builder/scripts/seed-briefing-conta-azul.ts
  </files>
  <action>
Create a CLI seed script at `tools/wireframe-builder/scripts/seed-briefing-conta-azul.ts` that populates the financeiro-conta-azul briefing in Supabase with the full structured data from briefing.md.

Follow the exact pattern of `tools/wireframe-builder/scripts/generate-blueprint.ts` for Supabase client setup (standalone `createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY)` -- NOT the Vite import.meta.env variant).

The script should:

1. Import `BriefingConfigSchema` from `../lib/briefing-schema`
2. Build a `BriefingConfig` literal object with ALL the data from briefing.md:

```typescript
const briefingData = {
  companyInfo: {
    name: 'Financeiro Conta Azul',
    segment: 'Financeiro',
    size: 'PME' as const,
    description: 'Dashboard financeiro que le relatorios exportados do Conta Azul e entrega visao consolidada de DRE Gerencial, Fluxo de Caixa, Inadimplencia e Margens por Centro de Custo.',
  },

  productContext: {
    productType: 'BI de Plataforma (Produto FXL)',
    sourceSystem: 'Conta Azul - software de gestao financeira para empresas',
    objective: 'Dashboard financeiro que le os relatorios exportados do Conta Azul e entrega visao consolidada de DRE Gerencial, Fluxo de Caixa, Inadimplencia e Margens por Centro de Custo.',
    approval: 'Interna FXL (produto proprio)',
    corePremise: 'Agnostico de segmento. Os campos Categoria e Centro de Custo presentes nos exports do Conta Azul sao genericos e preenchidos pela propria empresa usuaria.',
  },

  dataSources: [
    {
      system: 'Conta Azul',
      exportType: 'XLSX',
      fields: [
        'Nome do cliente', 'Data competencia', 'Data vencimento',
        'Data ultimo pagamento', 'Valor original (R$)', 'Valor recebido (R$)',
        'Valor em aberto (R$)', 'Categoria 1', 'Centro de Custo 1',
      ],
      fieldMappings: [
        { field: 'Nome do cliente', usage: 'Ranking e filtro por cliente' },
        { field: 'Data de competencia', usage: 'Periodo de referencia' },
        { field: 'Data de vencimento', usage: 'Classificacao de status (pago / a vencer / vencido)' },
        { field: 'Data do ultimo pagamento', usage: 'Confirmacao de recebimento' },
        { field: 'Valor original da parcela (R$)', usage: 'Receita prevista' },
        { field: 'Valor recebido da parcela (R$)', usage: 'Receita recebida' },
        { field: 'Valor da parcela em aberto (R$)', usage: 'Inadimplencia / a vencer' },
        { field: 'Categoria 1', usage: 'Agrupamento de receita (definido pelo usuario)' },
        { field: 'Centro de Custo 1', usage: 'Unidade de negocio (definida pelo usuario)' },
      ],
    },
    {
      system: 'Conta Azul',
      exportType: 'XLSX',
      fields: [
        'Nome fornecedor', 'Data competencia', 'Data vencimento',
        'Data ultimo pagamento', 'Valor original (R$)', 'Valor pago (R$)',
        'Valor em aberto (R$)', 'Categoria 1', 'Centro de Custo 1',
      ],
      fieldMappings: [
        { field: 'Nome do fornecedor', usage: 'Ranking e filtro por fornecedor' },
        { field: 'Data de competencia', usage: 'Periodo de referencia' },
        { field: 'Data de vencimento', usage: 'Classificacao de status (pago / a vencer / vencido)' },
        { field: 'Data do ultimo pagamento', usage: 'Confirmacao de pagamento' },
        { field: 'Valor original da parcela (R$)', usage: 'Despesa prevista' },
        { field: 'Valor pago da parcela (R$)', usage: 'Despesa realizada' },
        { field: 'Valor da parcela em aberto (R$)', usage: 'Passivo em aberto' },
        { field: 'Categoria 1', usage: 'Natureza da despesa (definida pelo usuario)' },
        { field: 'Centro de Custo 1', usage: 'Unidade de negocio (definida pelo usuario)' },
      ],
    },
  ],

  modules: [
    { name: 'Resultado Mensal (DRE)', kpis: ['Receita Total', 'Custos Operacionais Variaveis', 'Margem de Contribuicao', 'Custos Fixos', 'Resultado Operacional', 'Despesas Financeiras', 'Resultado Final / EBITDA'], businessRules: 'Emprestimos fora do escopo v1. Despesas Financeiras = tarifas, IOF, juros, multas. Exibicao por KPI: valor absoluto, % sobre faturamento, comparativo com mes anterior, mesmo mes ano anterior e media anual.' },
    { name: 'Receita', kpis: ['Receita Total Prevista', 'Receita Recebida', 'Receita Vencida', 'Receita a Vencer', '% Recebido sobre total previsto', '% Inadimplencia'], businessRules: 'Ranking por cliente e por categoria. Comparativos mensais e anuais.' },
    { name: 'Despesa', kpis: ['Total Previsto', 'Total Pago', 'Total Vencido', 'Total a Vencer'], businessRules: 'Filtro por grupo de despesa, categoria e centro de custo. Comparativos mensais e por media.' },
    { name: 'Centro de Custo', kpis: ['Receita', 'Custos Variaveis', 'Margem', 'Custos Fixos', 'Resultado Final'], businessRules: 'Resultado por unidade. Comparativo anual e trimestral.' },
    { name: 'Margens', kpis: ['Margem de Contribuicao (R$ e %)', 'Resultado Operacional (R$ e %)', 'Resultado Final / EBITDA (R$ e %)', 'Custos Operacionais Variaveis (% sobre faturamento)', 'Custos Fixos (% sobre faturamento)'], businessRules: 'Visao simplificada de faturamento, custos e margens em % do faturamento. Evolucao mensal e anual.' },
    { name: 'Fluxo Caixa Mensal', kpis: ['Saldo Inicial', 'Receitas Previstas', 'Despesas Previstas', 'Saldo Final Projetado'], businessRules: 'Tabela dia a dia. Saldo inicial do mes inserido manualmente. Saldo inicial de cada dia = saldo final do dia anterior. Semaforizacao: Verde >= R$ 10.000 / Amarelo entre R$ 0 e R$ 10.000 / Vermelho <= R$ 0.' },
    { name: 'Fluxo Caixa Anual', kpis: ['Saldo Inicial', 'Receitas CA', 'Despesas CA', 'Inputs Manuais', 'Saldo Projetado'], businessRules: 'Projecao mensal com inputs manuais ilimitados. Simulacao de cenarios. Identificacao automatica de meses deficitarios.' },
    { name: 'Indicadores', kpis: ['Receita', 'Despesa', 'Margem', 'EBITDA', 'Caixa'], businessRules: 'Paineis com semaforizacao. Comparativos: mes vs anterior, mes vs mesmo mes ano anterior, mes vs media anual, trimestre vs trimestre anterior.' },
    { name: 'Configuracoes', kpis: [], businessRules: 'Cadastro de grupos de despesa (Variavel / Fixo / Financeiro) com vinculacao de categorias. Cadastro de Centros de Custo. Cadastro de bancos (nome + status ativo/inativo) com input manual de saldo.' },
  ],

  targetAudience: 'Qualquer empresa que utilize o Conta Azul como sistema financeiro, independente de segmento ou porte.',

  kpiCategories: [
    {
      category: 'Receita',
      confirmed: ['Receita Total Prevista', 'Receita Recebida', 'Receita Vencida (inadimplencia)', 'Receita a Vencer', '% Recebido sobre total previsto', '% Inadimplencia'],
      suggested: ['Ticket medio por categoria de receita', '% de crescimento mensal da receita', 'Receita por Centro de Custo'],
    },
    {
      category: 'Despesa',
      confirmed: ['Total Previsto', 'Total Pago', 'Total Vencido', 'Total a Vencer'],
    },
    {
      category: 'DRE / Margens',
      confirmed: ['Margem de Contribuicao (R$ e %)', 'Resultado Operacional (R$ e %)', 'Resultado Final / EBITDA (R$ e %)', 'Custos Operacionais Variaveis (% sobre faturamento)', 'Custos Fixos (% sobre faturamento)'],
      blocked: ['CMV (sem campo no export Conta Azul)', 'Margem por cliente (sem cruzamento disponivel)'],
    },
    {
      category: 'Caixa',
      confirmed: ['Saldo inicial (manual)', 'Saldo projetado dia a dia', 'Saldo final projetado', 'Saldo consolidado multi-banco'],
    },
  ],

  statusRules: [
    { condition: 'Valor pago / recebido preenchido', status: 'Pago / Recebido' },
    { condition: 'Nao pago e vencimento > hoje', status: 'A vencer' },
    { condition: 'Nao pago e vencimento <= hoje', status: 'Vencido' },
  ],

  businessRules: [
    { rule: 'Um lancamento pertence a um unico Centro de Custo' },
    { rule: 'A classificacao das categorias como Variavel / Fixo / Financeiro e feita pelo usuario nas Configuracoes' },
    { rule: 'Nao ha controle de acesso ou perfis de usuario nesta versao' },
    { rule: 'Semaforizacao do Fluxo de Caixa com limite fixo de R$ 10.000' },
  ],

  freeFormNotes: 'Formato de importacao: Excel/CSV, manual mensal. API futura prevista, fora do escopo desta versao.',
}
```

3. Validate with `BriefingConfigSchema.parse(briefingData)` before upserting
4. Upsert to `briefing_configs` table with `client_slug = 'financeiro-conta-azul'` and `updated_by = 'system:seed'`
5. Print success/failure message
6. Use `dotenv` to load `.env.local` (same as generate-blueprint.ts pattern -- check that file for exact dotenv approach; if it uses `import 'dotenv/config'` or manual load, follow the same pattern)

Run with: `npx tsx tools/wireframe-builder/scripts/seed-briefing-conta-azul.ts`

Add `--force` flag support: if row already exists and --force is NOT passed, print warning and exit. If --force is passed, upsert.
  </action>
  <verify>
    <automated>cd /Users/cauetpinciara/Documents/fxl/fxl-core && npx tsc --noEmit && npx tsx tools/wireframe-builder/scripts/seed-briefing-conta-azul.ts --force</automated>
  </verify>
  <done>
    - Seed script exists and passes TypeScript compilation
    - Running the script upserts the full financeiro-conta-azul briefing data to Supabase
    - Data includes all 9 modules, 2 data sources with field mappings, 4 KPI categories, 3 status rules, 4 business rules, and product context
    - Data round-trips through BriefingConfigSchema.parse() without errors
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` -- zero TypeScript errors
2. `npx vitest run tools/wireframe-builder/lib/generation-engine.test.ts` -- all existing tests pass (backward compat)
3. `npx tsx tools/wireframe-builder/scripts/seed-briefing-conta-azul.ts --force` -- seeds data successfully
4. Load BriefingForm at `/clients/financeiro-conta-azul/briefing` -- new sections render and display seeded data
</verification>

<success_criteria>
- BriefingConfig type evolved with 4 new optional top-level fields and 1 new optional DataSource field
- Zod schema validates both old and new shapes (backward compat proven by passing existing tests)
- BriefingForm shows new sections (Product Context, Field Mappings, KPI Categories, Status Rules, Business Rules)
- financeiro-conta-azul briefing fully populated in Supabase with all briefing.md structured data
- Zero TypeScript errors, all existing tests pass
</success_criteria>

<output>
After completion, create `.planning/quick/4-evolve-briefingconfig-populate-conta-azul/4-SUMMARY.md`
</output>
