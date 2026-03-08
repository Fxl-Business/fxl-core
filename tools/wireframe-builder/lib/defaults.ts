import type { BlueprintSection } from '../types/blueprint'

export function getDefaultSection(type: BlueprintSection['type']): BlueprintSection {
  switch (type) {
    case 'kpi-grid':
      return {
        type: 'kpi-grid',
        columns: 4,
        items: [{ label: 'Novo KPI', value: 'R$ 0' }],
      }
    case 'bar-line-chart':
      return {
        type: 'bar-line-chart',
        title: 'Novo Grafico',
        chartType: 'bar',
      }
    case 'donut-chart':
      return {
        type: 'donut-chart',
        title: 'Novo Grafico de Rosca',
      }
    case 'waterfall-chart':
      return {
        type: 'waterfall-chart',
        title: 'Novo Waterfall',
        bars: [{ label: 'Item', value: 100, type: 'positive' }],
      }
    case 'pareto-chart':
      return {
        type: 'pareto-chart',
        title: 'Novo Pareto',
      }
    case 'calculo-card':
      return {
        type: 'calculo-card',
        title: 'Novo Calculo',
        rows: [],
      }
    case 'data-table':
      return {
        type: 'data-table',
        title: 'Nova Tabela',
        columns: [{ key: 'col1', label: 'Coluna 1' }],
        rowCount: 5,
      }
    case 'drill-down-table':
      return {
        type: 'drill-down-table',
        title: 'Nova Tabela Drill',
        columns: [{ key: 'col1', label: 'Coluna 1' }],
        rows: [],
      }
    case 'clickable-table':
      return {
        type: 'clickable-table',
        title: 'Nova Tabela Clicavel',
        columns: [{ key: 'col1', label: 'Coluna 1' }],
        rows: [],
      }
    case 'saldo-banco':
      return {
        type: 'saldo-banco',
        banks: [],
        total: 'R$ 0',
      }
    case 'manual-input':
      return {
        type: 'manual-input',
        title: 'Novo Input Manual',
      }
    case 'upload-section':
      return {
        type: 'upload-section',
        label: 'Upload de Dados',
      }
    case 'config-table':
      return {
        type: 'config-table',
        title: 'Nova Config',
        columns: [],
        rows: [],
      }
    case 'info-block':
      return {
        type: 'info-block',
        content: 'Novo bloco de informacao',
        variant: 'info',
      }
    case 'chart-grid':
      return {
        type: 'chart-grid',
        columns: 2,
        items: [],
      }
  }
}
