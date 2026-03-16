import { Users } from 'lucide-react'
import ClientsIndex from './pages/ClientsIndex'
import FinanceiroIndex from './pages/FinanceiroContaAzul/Index'
import FinanceiroDocViewer from './pages/FinanceiroContaAzul/DocViewer'
import BlueprintTextView from './pages/BlueprintTextView'
import BriefingForm from './pages/BriefingForm'
import type { ModuleDefinition } from '@platform/module-loader/registry'
import { MODULE_IDS } from '@platform/module-loader/module-ids'

export const clientsManifest: ModuleDefinition = {
  id: MODULE_IDS.CLIENTS,
  description: 'Workspaces de clientes com docs, briefing e wireframe.',
  label: 'Clientes',
  route: '/clientes',
  icon: Users,
  status: 'active',
  navChildren: [
    {
      label: 'Clientes',
      href: '/clientes',
      children: [
        {
          label: 'Financeiro Conta Azul',
          href: '/clients/financeiro-conta-azul',
          children: [
            { label: 'Briefing', href: '/clients/financeiro-conta-azul/briefing' },
            { label: 'Blueprint', href: '/clients/financeiro-conta-azul/blueprint' },
            { label: 'Wireframe', href: '/clients/financeiro-conta-azul/wireframe', external: true },
            { label: 'Branding', href: '/clients/financeiro-conta-azul/branding' },
            { label: 'Changelog', href: '/clients/financeiro-conta-azul/changelog' },
          ],
        },
      ],
    },
  ],
  routeConfig: [
    { path: '/clientes', element: <ClientsIndex /> },
    { path: '/clients/financeiro-conta-azul', element: <FinanceiroIndex /> },
    { path: '/clients/:clientSlug/briefing', element: <BriefingForm /> },
    { path: '/clients/:clientSlug/blueprint', element: <BlueprintTextView /> },
    { path: '/clients/financeiro-conta-azul/:doc', element: <FinanceiroDocViewer /> },
  ],
}
