# Changelog — Financeiro Conta Azul

## [2026-03-05] — DFC: padronização de comparação em KPIs, CalculoCard e layout

- KPI Cards 2–4 (MC, RO, RF): semáforo removido, adicionada prop `variation` no formato padrão `▲ X,X% vs Período`
- KPI Cards da Tela 1 agora seguem padrão uniforme: valor R$ + sub (% s/ receita) + variation no compareMode
- DFCScreen: layout do CalculoCard + WaterfallChart alterado de grid 2 colunas para empilhado (1 bloco por linha)
- CalculoCard: todas as 7 linhas agora exibem comparação no modo comparativo (antes apenas MC, RO, RF)
- CalculoCard: regra de inversão de cor documentada — custos (operador `-`) usam verde para ▼ e vermelho para ▲
- Blueprint e `blocos_disponiveis.md` atualizados com todas as regras acima

## [2026-03-05] — DFC: CalculoCard, correção de KPIs e padrão global de comparação

- Regra de processo formalizada: Blueprint é fonte da verdade — wireframe nunca pode divergir
- Regra global adicionada: modo comparativo NUNCA cria novos blocos — transforma internamente os existentes
- Novo componente `CalculoCard` criado em `skills/wireframe-builder/components/`
  - Cascata de cálculo financeiro com operadores (−/=), valor R$, % s/ faturamento
  - Modo comparação: colunas adicionais "Período Anterior" e "Var. %" sem novo componente
- DFCScreen: grid 2 colunas fixo com CalculoCard + WaterfallChart (sempre visíveis)
- DFCScreen: KPIs Margem de Contribuição, Resultado Operacional e Resultado Final corrigidos — valor R$ como primário, % como subtexto secundário
- WaterfallChart: props `compareMode`, `compareBars`, `comparePeriodLabel` adicionadas — barras agrupadas internamente no modo comparação (sem BarLineChart paralelo)
- Blueprint e `blocos_disponiveis.md` atualizados com todas as regras acima

## [2026-03-05] — Paradigma de comparação: switch "Comparar" global

- Nova regra de UX: nenhuma tela exibe comparativos por padrão
- WireframeFilterBar: adicionado switch "Comparar" + seletor de período condicional (props: `showCompareSwitch`, `compareMode`, `onCompareModeChange`, `comparePeriodType`, `comparePeriod`, `onComparePeriodChange`)
- KpiCardFull: nova prop `compareMode` — variation oculta quando OFF
- Tela 1 (DFC): modo padrão só Waterfall (largura total); modo comparação = Waterfall + barras agrupadas; colunas da tabela condicionais; filtro "Comparar com" removido (agora é switch)
- Tela 2 (Receita): gráfico "Evolução 12M" removido; modo comparação com barras agrupadas por status e categoria
- Tela 3 (Despesas): gráfico "Evolução 12M" removido; modo comparação com barras agrupadas por grupo e status
- Tela 4 (Centro de Custo): KPIs limpos no modo padrão; colunas da tabela condicionais
- Tela 5 (Margens): gráficos "Evolução 12M" e "YoY" removidos do modo padrão; adicionado "Composição do Resultado"; modo comparação com barras de margens
- Tela 6 (Fluxo Mensal): KPIs limpos; "Previsto vs Realizado" mantém sempre; coluna comparativa na tabela com switch ON
- Tela 7 (Fluxo Anual): switch compara com ano X (`comparePeriodType="anual"`); KPIs com variação temporal oculta no modo padrão
- Tela 8 (Indicadores): gráfico "Evolução 12M" removido; modo comparação com barras agrupadas; colunas da tabela condicionais
- Blueprint atualizado com regra global de comparação e gráficos modo padrão/comparação por tela
- `blocos_disponiveis.md` atualizado com novas props do WireframeFilterBar e padrão de comparação
- `pacote_cliente.md` atualizado com itens 7 e 8 nas regras de geração de wireframe

## [2026-03-05] — WireframeHeader: navegador de período com setas

- WireframeHeader: `<select>` substituído por navegador ‹ Mês / AA › centralizado no header
- WireframeHeader: nova prop `periodType` ('mensal' | 'anual' | 'none')
- WireframeViewer: mapa `SCREEN_PERIOD_TYPE` adicionado — Tela 7 recebe 'anual', Telas 9–10 recebem 'none'
- Telas 1–6, 8: navegador mensal com setas e formato "Janeiro / 26"

## [2026-03-05] — Auditoria Excel: Tela 1 DFC ajustada

- Novo componente `WaterfallChart` criado em `skills/wireframe-builder/components/`
- DFCScreen: gráfico Waterfall adicionado em grid 2 colunas com BarLineChart
- DFCScreen: DetailViewSwitcher ampliado com 4ª opção "Forma de Pagamento"
- DFCScreen: subcategorias faltantes adicionadas na view Categoria (Diretoria, Comerciais e Marketing, Custos Operacionais)
- DFCScreen: children de Despesas Financeiras limpos (sem empréstimos)
- Blueprint e Briefing atualizados com notas sobre escopo de empréstimos

## [2026-03-05] — Padronização: Tipo de Período Analisado + WireframeFilterBar (telas 2–8)

- Campo "Tipo de Período Analisado" adicionado ao Blueprint das telas 2, 3, 4, 5, 6, 7 e 8
- Definições consolidadas: Análise Mensal · Análise Anual · Análise Acumulada (YTD) · Análise de Período
- Regra documentada: o Tipo de Período responde ao que os KPI cards exibem, não à granularidade dos gráficos
- Tela 8: nomenclatura "YTD" removida dos nomes de KPI (era imprecisa — KPIs são mensais, não acumulados)
- Wireframe telas 2–8: GlobalFilters substituído por WireframeFilterBar
- Filtro de período removido do interior das telas — agora vive exclusivamente no WireframeHeader global
- Telas 5, 6, 7: WireframeFilterBar não adicionada (sem filtros contextuais além do período)

## [2026-03-05] — Layout global do wireframe refinado + WireframeFilterBar

- Sidebar header ajustado para 56px, alinhado ao WireframeHeader
- Títulos e subtítulos removidos de todas as telas (título agora vive apenas no WireframeHeader)
- Criado `skills/wireframe-builder/components/WireframeFilterBar.tsx`: barra flutuante sticky com labels inline, search opcional e sem filtro de período
- DFCScreen atualizada: GlobalFilters substituído por WireframeFilterBar
- `docs/wireframe/blocos_disponiveis.md` atualizado com WireframeFilterBar e padrão global de filtros

## [2026-03-05] — Header global no wireframe + correções TS + PromptBlock padronizado

- Criado `skills/wireframe-builder/components/WireframeHeader.tsx`: header fixo com título da tela e seletor de período
- `WireframeViewer.tsx` atualizado para incluir `WireframeHeader` acima da área de scroll
- Corrigido export quebrado em `wireframe/index.tsx`: `DREScreen` → `DFCScreen`
- Corrigido `FilterType` em `GlobalFilters.tsx`: adicionado `'ano'`
- `Home.tsx` e `Index.tsx` migrados para usar `<PromptBlock>` (elimina duplicação manual)
- `CLAUDE.md` atualizado com checklist obrigatório: `npx tsc --noEmit` antes de finalizar
- `docs/wireframe/blocos_disponiveis.md` atualizado com `WireframeHeader`

## [2026-03-05] — Tela 1: Resultado Mensal DRE → DFC + DetailViewSwitcher

- Tela 1 renomeada de "Resultado Mensal (DRE)" para "Resultado Mensal (DFC)"
- Campo "Tipo de Período Analisado" adicionado ao Blueprint como padrão global
- Novo componente `DetailViewSwitcher` especificado no Blueprint e criado em `skills/wireframe-builder/components/`
- `DREScreen.tsx` removido e substituído por `DFCScreen.tsx` com suporte a 3 dimensões de detalhe:
  Grupo de Despesa · Centro de Custo · Categoria
- `WireframeViewer.tsx` atualizado para refletir o novo nome da tela
- `docs/wireframe/blocos_disponiveis.md` atualizado com o novo componente

## [2026-03-05] — Wireframe v2 implementado (10 componentes + 10 telas)

- 10 componentes compartilhados criados em `skills/wireframe-builder/components/`:
  `KpiCardFull`, `DonutChart`, `ParetoChart`, `DrillDownTable`, `ClickableTable`,
  `WireframeModal`, `UploadSection`, `SaldoBancoInput`, `ManualInputSection`, `ConfigTable`
- 10 telas implementadas em `clients/financeiro-conta-azul/wireframe/screens/`:
  `DREScreen`, `ReceitaScreen`, `DespesasScreen`, `CentroCustoScreen`, `MargensScreen`,
  `FluxoMensalScreen`, `FluxoAnualScreen`, `IndicadoresScreen`, `UploadScreen`, `ConfiguracaoScreen`
- `WireframeViewer.tsx` atualizado: substituído placeholder por roteamento tipado entre telas reais
- `clients/financeiro-conta-azul/wireframe/index.tsx` atualizado com exports das telas v2
- `vite.config.ts` e `tsconfig.json` atualizados com alias `clients/` para resolução de imports
- Wireframe agora é navegável e interativo em todas as 10 telas

## [2026-03-05] — Arquitetura revisada + Blueprint v2

- Blueprint atualizado para 10 telas com base no wireframe HTML de referência
- Padrão de qualidade documentado: sparkline, semáforo, drill-down, modal, donut, pareto
- Arquitetura de exibição alterada: wireframe abre em nova aba sem o Layout da aplicação
- `Wireframe.tsx` atualizado para exibir botão "Visualizar Wireframe →"
- `WireframeViewer.tsx` criado como página standalone com sidebar escura
- Nova rota `/wireframe-view` adicionada fora do Layout em `App.tsx`
- `docs/wireframe/blocos_disponiveis.md` atualizado com 10 novos componentes pendentes
- Próximo passo: criar componentes pendentes em `skills/wireframe-builder/components/` e implementar as 10 telas

## [2026-03-05] — Wireframe gerado

- Blueprint aprovado formalmente e registrado em `docs/blueprint.md`
- 6 telas geradas em `wireframe/screens/`: Dashboard Principal, Receitas, Despesas, Fluxo de Caixa, Inadimplência, Inputs
- index.tsx do wireframe atualizado com exports de todas as telas
- Wireframe.tsx atualizado para renderizar telas com WireframeSidebar

## [2026-03-05] — Briefing formalizado

- briefing.md atualizado com Briefing completo e formalizado
- Estrutura de Inputs validada (Contas a Receber + Contas a Pagar)
- 9 módulos definidos: DRE, Receita, Despesa, Centro de Custo, Margens, Fluxo Mensal, Fluxo Anual, Indicadores, Configurações
- KPIs confirmados, sugeridos e bloqueados documentados
- Próximo passo: sessão de Branding

## [2026-03-05] — Processo e prompt master

- Criado `docs/process/prompt_master.md` com prompt padrão de abertura para Claude Projects
- Fluxo de trabalho atualizado em `docs/process/pacote_cliente.md`:
  Prompt Master → Discussão → Prompt para Claude Code → Execução no repo
- Processo clarificado: repositório só é alterado via Claude Code, nunca durante conversa no Project

## [2026-03-04] — Setup inicial

- Repositório fxl-third-party-knowledge criado
- Estrutura base do cliente financeiro-conta-azul inicializada
- Arquivos stub criados: briefing.md, blueprint.md, branding.md
- Próximo passo: sessão de branding → sessão de Blueprint → wireframe
