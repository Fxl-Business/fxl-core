import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { BlueprintSection } from '@tools/wireframe-builder/types/blueprint'

import KpiGridForm from './property-forms/KpiGridForm'
import BarLineChartForm from './property-forms/BarLineChartForm'
import DonutChartForm from './property-forms/DonutChartForm'
import WaterfallChartForm from './property-forms/WaterfallChartForm'
import ParetoChartForm from './property-forms/ParetoChartForm'
import CalculoCardForm from './property-forms/CalculoCardForm'
import DataTableForm from './property-forms/DataTableForm'
import DrillDownTableForm from './property-forms/DrillDownTableForm'
import ClickableTableForm from './property-forms/ClickableTableForm'
import SaldoBancoForm from './property-forms/SaldoBancoForm'
import ManualInputForm from './property-forms/ManualInputForm'
import UploadSectionForm from './property-forms/UploadSectionForm'
import ConfigTableForm from './property-forms/ConfigTableForm'
import InfoBlockForm from './property-forms/InfoBlockForm'
import ChartGridForm from './property-forms/ChartGridForm'

type Props = {
  open: boolean
  section: BlueprintSection | null
  onClose: () => void
  onChange: (updated: BlueprintSection) => void
}

function getSectionLabel(type: BlueprintSection['type']): string {
  const labels: Record<BlueprintSection['type'], string> = {
    'kpi-grid': 'KPI Grid',
    'bar-line-chart': 'Grafico de Barras/Linhas',
    'donut-chart': 'Grafico Donut',
    'waterfall-chart': 'Grafico Waterfall',
    'pareto-chart': 'Grafico Pareto',
    'calculo-card': 'Card de Calculo',
    'data-table': 'Tabela de Dados',
    'drill-down-table': 'Tabela Drill-Down',
    'clickable-table': 'Tabela Clicavel',
    'saldo-banco': 'Saldo Banco',
    'manual-input': 'Entrada Manual',
    'upload-section': 'Upload',
    'config-table': 'Tabela de Configuracao',
    'info-block': 'Bloco de Informacao',
    'chart-grid': 'Grade de Graficos',
    'settings-page': 'Pagina de Configuracoes',
    'form-section': 'Formulario',
    'filter-config': 'Configuracao de Filtros',
    'stat-card': 'Card de Metrica',
    'progress-bar': 'Barra de Progresso',
    'divider': 'Divisor',
  }
  return labels[type]
}

function renderForm(
  section: BlueprintSection,
  onChange: (updated: BlueprintSection) => void
) {
  switch (section.type) {
    case 'kpi-grid':
      return (
        <KpiGridForm
          section={section}
          onChange={onChange}
        />
      )
    case 'bar-line-chart':
      return (
        <BarLineChartForm
          section={section}
          onChange={onChange}
        />
      )
    case 'donut-chart':
      return (
        <DonutChartForm
          section={section}
          onChange={onChange}
        />
      )
    case 'waterfall-chart':
      return (
        <WaterfallChartForm
          section={section}
          onChange={onChange}
        />
      )
    case 'pareto-chart':
      return (
        <ParetoChartForm
          section={section}
          onChange={onChange}
        />
      )
    case 'calculo-card':
      return (
        <CalculoCardForm
          section={section}
          onChange={onChange}
        />
      )
    case 'data-table':
      return (
        <DataTableForm
          section={section}
          onChange={onChange}
        />
      )
    case 'drill-down-table':
      return (
        <DrillDownTableForm
          section={section}
          onChange={onChange}
        />
      )
    case 'clickable-table':
      return (
        <ClickableTableForm
          section={section}
          onChange={onChange}
        />
      )
    case 'saldo-banco':
      return (
        <SaldoBancoForm
          section={section}
          onChange={onChange}
        />
      )
    case 'manual-input':
      return (
        <ManualInputForm
          section={section}
          onChange={onChange}
        />
      )
    case 'upload-section':
      return (
        <UploadSectionForm
          section={section}
          onChange={onChange}
        />
      )
    case 'config-table':
      return (
        <ConfigTableForm
          section={section}
          onChange={onChange}
        />
      )
    case 'info-block':
      return (
        <InfoBlockForm
          section={section}
          onChange={onChange}
        />
      )
    case 'chart-grid':
      return (
        <ChartGridForm
          section={section}
          onChange={onChange}
        />
      )
    case 'settings-page':
    case 'form-section':
    case 'filter-config':
    case 'stat-card':
    case 'progress-bar':
    case 'divider':
      return <div className="text-sm text-muted-foreground p-4">Formulario em desenvolvimento</div>
  }
}

export default function PropertyPanel({
  open,
  section,
  onClose,
  onChange,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[450px] overflow-y-auto"
      >
        {section && (
          <>
            <SheetHeader>
              <SheetTitle>Editar {getSectionLabel(section.type)}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{renderForm(section, onChange)}</div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
