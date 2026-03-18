import { Users } from 'lucide-react'
import ClientsListPage from './pages/ClientsListPage'
import type { ModuleDefinition } from '@platform/module-loader/registry'
import { MODULE_IDS } from '@platform/module-loader/module-ids'

export const clientsManifest: ModuleDefinition = {
  id: MODULE_IDS.CLIENTS,
  description: 'Cadastro de clientes da organizacao.',
  tenantScoped: true,
  label: 'Clientes',
  route: '/clientes',
  icon: Users,
  status: 'active',
  navChildren: [
    {
      label: 'Clientes',
      href: '/clientes',
    },
  ],
  routeConfig: [
    { path: '/clientes', element: <ClientsListPage /> },
  ],
}
