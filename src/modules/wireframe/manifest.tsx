import { Wrench } from 'lucide-react'
import ComponentGallery from './pages/ComponentGallery'
import type { ModuleDefinition } from '@platform/module-loader/registry'
import { MODULE_IDS } from '@platform/module-loader/module-ids'

export const ferramentasManifest: ModuleDefinition = {
  id: MODULE_IDS.FERRAMENTAS,
  description: 'Crie e edite wireframes interativos para clientes.',
  label: 'Ferramentas',
  route: '/ferramentas/index',
  icon: Wrench,
  status: 'active',
  navChildren: [
    {
      label: 'Ferramentas',
      href: '/ferramentas/index',
      children: [
        {
          label: 'Wireframe Builder',
          href: '/ferramentas/wireframe-builder',
          children: [
            {
              label: 'Blocos Disponiveis',
              href: '/ferramentas/blocos/index',
              children: [
                { label: 'KpiCard', href: '/ferramentas/blocos/kpi-card' },
                { label: 'KpiCardFull', href: '/ferramentas/blocos/kpi-card-full' },
                { label: 'CalculoCard', href: '/ferramentas/blocos/calculo-card' },
                { label: 'BarLineChart', href: '/ferramentas/blocos/bar-line-chart' },
                { label: 'WaterfallChart', href: '/ferramentas/blocos/waterfall-chart' },
                { label: 'DonutChart', href: '/ferramentas/blocos/donut-chart' },
                { label: 'ParetoChart', href: '/ferramentas/blocos/pareto-chart' },
                { label: 'DataTable', href: '/ferramentas/blocos/data-table' },
                { label: 'DrillDownTable', href: '/ferramentas/blocos/drill-down-table' },
                { label: 'ClickableTable', href: '/ferramentas/blocos/clickable-table' },
                { label: 'ConfigTable', href: '/ferramentas/blocos/config-table' },
                { label: 'WireframeSidebar', href: '/ferramentas/blocos/wireframe-sidebar' },
                { label: 'WireframeHeader', href: '/ferramentas/blocos/wireframe-header' },
                { label: 'WireframeFilterBar', href: '/ferramentas/blocos/wireframe-filter-bar' },
                { label: 'GlobalFilters', href: '/ferramentas/blocos/global-filters' },
                { label: 'WireframeModal', href: '/ferramentas/blocos/wireframe-modal' },
                { label: 'DetailViewSwitcher', href: '/ferramentas/blocos/detail-view-switcher' },
                { label: 'CommentOverlay', href: '/ferramentas/blocos/comment-overlay' },
                { label: 'InputsScreen', href: '/ferramentas/blocos/inputs-screen' },
                { label: 'UploadSection', href: '/ferramentas/blocos/upload-section' },
                { label: 'ManualInputSection', href: '/ferramentas/blocos/manual-input-section' },
                { label: 'SaldoBancoInput', href: '/ferramentas/blocos/saldo-banco-input' },
              ],
            },
            { label: 'Galeria de Componentes', href: '/ferramentas/wireframe-builder/galeria' },
          ],
        },
      ],
    },
  ],
  routeConfig: [
    { path: '/ferramentas/wireframe-builder/galeria', element: <ComponentGallery /> },
  ],
}
