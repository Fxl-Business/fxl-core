---
phase: quick-12
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/clients/ClientsIndex.tsx
  - src/modules/clients/manifest.tsx
  - src/modules/ferramentas/manifest.tsx
autonomous: false
requirements: [quick-12]
must_haves:
  truths:
    - "Navegar para /clientes exibe pagina index listando todos os clientes disponiveis"
    - "Clicar em um cliente na lista leva ao workspace do cliente"
    - "Sidebar de Ferramentas mostra apenas Wireframe Builder como item direto — sub-paginas (Blocos, Galeria) so aparecem ao expandir WB"
  artifacts:
    - path: "src/pages/clients/ClientsIndex.tsx"
      provides: "Pagina index de clientes"
      min_lines: 30
    - path: "src/modules/clients/manifest.tsx"
      provides: "Manifest atualizado com rota /clientes e navChildren correto"
  key_links:
    - from: "src/modules/clients/manifest.tsx"
      to: "src/pages/clients/ClientsIndex.tsx"
      via: "routeConfig element"
      pattern: "ClientsIndex"
---

<objective>
Criar pagina index para /clientes e garantir que a sidebar de Ferramentas mostre apenas Wireframe Builder como item direto.

Purpose: Clientes precisa de uma pagina de entrada (como Processo, Ferramentas e Tarefas ja tem). A sidebar de Ferramentas nao deve expor sub-paginas do WB como itens de primeiro nivel.
Output: ClientsIndex.tsx, manifests atualizados, sidebar correta.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/modules/registry.ts
@src/modules/clients/manifest.tsx
@src/modules/ferramentas/manifest.tsx
@src/components/layout/Sidebar.tsx
@src/pages/clients/FinanceiroContaAzul/Index.tsx
@src/App.tsx

<interfaces>
From src/modules/registry.ts:
```typescript
export interface NavItem {
  label: string
  href?: string
  external?: boolean
  children?: NavItem[]
}

export interface ModuleManifest {
  id: string
  label: string
  route: string
  icon: LucideIcon
  status: ModuleStatus
  navChildren?: NavItem[]
  routeConfig?: RouteObject[]
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Criar ClientsIndex e atualizar clients manifest</name>
  <files>src/pages/clients/ClientsIndex.tsx, src/modules/clients/manifest.tsx</files>
  <action>
1. Criar `src/pages/clients/ClientsIndex.tsx`:
   - Pagina simples listando clientes disponiveis, seguindo o visual pattern do projeto (badges, cards, tipografia como em FinanceiroIndex.tsx e Home.tsx).
   - Titulo "Clientes" com badge "Clientes" (mesmo pattern do FinanceiroIndex).
   - Descricao breve: "Workspaces de clientes com docs, briefing e wireframe."
   - Lista de clientes como cards clicaveis (Link do react-router-dom). Cada card mostra nome do cliente e descricao curta.
   - Por agora so existe um cliente: Financeiro Conta Azul (slug: financeiro-conta-azul, descricao: "Dashboard financeiro — Conta Azul"). Rota: /clients/financeiro-conta-azul.
   - Usar Tailwind classes consistentes com o projeto: max-w-4xl mx-auto, rounded-xl border cards com hover states indigo, dark mode support.
   - Definir array de clientes como constante no topo (facil de expandir futuramente).

2. Atualizar `src/modules/clients/manifest.tsx`:
   - Mudar `route` de `/clients/financeiro-conta-azul` para `/clientes` (rota principal do modulo).
   - Importar ClientsIndex e adicionar ao routeConfig: `{ path: '/clientes', element: <ClientsIndex /> }`.
   - Atualizar navChildren: o item raiz de depth 0 deve ter label "Clientes" e href "/clientes". Manter Financeiro Conta Azul como child.
   - Estrutura final do navChildren:
     ```
     Clientes (href: /clientes)
       └─ Financeiro Conta Azul (href: /clients/financeiro-conta-azul)
           └─ Briefing, Blueprint, Wireframe, Branding, Changelog
     ```
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>Pagina /clientes renderiza lista de clientes. Manifest aponta rota principal para /clientes. NavChildren tem estrutura hierarquica correta.</done>
</task>

<task type="auto">
  <name>Task 2: Verificar e corrigir sidebar Ferramentas</name>
  <files>src/modules/ferramentas/manifest.tsx</files>
  <action>
Verificar que o manifest de Ferramentas tem a estrutura correta na sidebar. O objetivo e que apenas "Wireframe Builder" apareca como item direto de Ferramentas. Sub-paginas (Blocos Disponiveis, Galeria de Componentes) devem ser filhas de Wireframe Builder, nao de Ferramentas.

Verificar a estrutura atual de navChildren. A estrutura correta deve ser:
```
Ferramentas (href: /ferramentas/index, depth 0)
  └─ Wireframe Builder (href: /ferramentas/wireframe-builder, depth 1)
      └─ Blocos Disponiveis (href: /ferramentas/blocos/index, depth 2)
          └─ KpiCard, KpiCardFull, ... (depth 3)
      └─ Galeria de Componentes (href: /ferramentas/wireframe-builder/galeria, depth 2)
```

Se a estrutura ja estiver correta (quick-11 pode ter feito isso), apenas confirmar e seguir.

Se houver problemas:
- Garantir que Blocos e Galeria estejam nested sob Wireframe Builder, NAO como siblings
- Garantir que Wireframe Builder seja o unico filho direto de Ferramentas
- Manter todos os hrefs existentes intactos

Testar visualmente no browser: navegar para /ferramentas/index e verificar que a sidebar mostra Ferramentas com apenas WB visivel, e WB expande para mostrar Blocos e Galeria.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>Sidebar de Ferramentas mostra apenas Wireframe Builder como filho direto. Blocos e Galeria aparecem somente ao expandir WB.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Verificacao visual — Clientes index e sidebar Ferramentas</name>
  <action>Verificacao visual pelo usuario das duas mudancas implementadas.</action>
  <what-built>Pagina index de Clientes em /clientes e sidebar de Ferramentas corrigida</what-built>
  <how-to-verify>
    1. Abrir http://localhost:5173/clientes — deve mostrar pagina com titulo "Clientes", card de "Financeiro Conta Azul" clicavel
    2. Clicar no card do Financeiro Conta Azul — deve navegar para /clients/financeiro-conta-azul
    3. Verificar sidebar: secao "Clientes" deve ter href /clientes e mostrar Financeiro Conta Azul como sub-item
    4. Verificar sidebar: secao "Ferramentas" deve mostrar apenas "Wireframe Builder" como item direto. Blocos e Galeria so aparecem ao expandir WB
    5. Testar dark mode em ambas as paginas
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passa sem erros
- Pagina /clientes renderiza corretamente
- Sidebar mostra hierarquia correta para Clientes e Ferramentas
- Dark mode funciona em todos os elementos novos
</verification>

<success_criteria>
- /clientes exibe lista de clientes com card clicavel para Financeiro Conta Azul
- Sidebar "Clientes" tem link para /clientes como raiz
- Sidebar "Ferramentas" mostra apenas WB como item direto, sub-paginas colapsadas
- Zero erros TypeScript
</success_criteria>

<output>
After completion, create `.planning/quick/12-pagina-principal-de-clientes-e-corrigir-/12-SUMMARY.md`
</output>
