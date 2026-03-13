import { Users } from 'lucide-react'
import FinanceiroIndex from '@/pages/clients/FinanceiroContaAzul/Index'
import FinanceiroDocViewer from '@/pages/clients/FinanceiroContaAzul/DocViewer'
import BlueprintTextView from '@/pages/clients/BlueprintTextView'
import BriefingForm from '@/pages/clients/BriefingForm'
import type { ModuleManifest } from '@/modules/registry'

export const clientsManifest: ModuleManifest = {
  id: 'clients',
  label: 'Clientes',
  route: '/clients/financeiro-conta-azul',
  icon: Users,
  status: 'active',
  navChildren: [
    {
      label: 'Clientes',
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
    { path: '/clients/financeiro-conta-azul', element: <FinanceiroIndex /> },
    { path: '/clients/:clientSlug/briefing', element: <BriefingForm /> },
    { path: '/clients/:clientSlug/blueprint', element: <BlueprintTextView /> },
    { path: '/clients/financeiro-conta-azul/:doc', element: <FinanceiroDocViewer /> },
  ],
}
