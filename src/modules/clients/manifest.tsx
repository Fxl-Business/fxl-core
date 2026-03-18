import { Users } from 'lucide-react'
import type { ModuleDefinition } from '@platform/module-loader/registry'
import { MODULE_IDS } from '@platform/module-loader/module-ids'
import ClientList from './pages/ClientList'
import ClientProfile from './pages/ClientProfile'

export const clientsManifest: ModuleDefinition = {
  id: MODULE_IDS.CLIENTS,
  description: 'Cadastro e gestao de clientes da organizacao.',
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
    { path: '/clientes', element: <ClientList /> },
    { path: '/clientes/:slug', element: <ClientProfile /> },
  ],
}
