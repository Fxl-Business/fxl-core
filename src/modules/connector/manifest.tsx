import { Plug } from 'lucide-react'
import type { ModuleDefinition } from '@platform/module-loader/registry'
import { MODULE_IDS } from '@platform/module-loader/module-ids'
import { connectorHomeExtension } from './extensions/home-widgets'
import ConnectorRouter from './pages/ConnectorRouter'

export const connectorManifest: ModuleDefinition = {
  id: MODULE_IDS.CONNECTOR,
  description: 'Conecta apps externos (spokes) via contrato padronizado FXL.',
  tenantScoped: true,
  label: 'Conectores',
  route: '/apps',
  icon: Plug,
  status: 'beta',
  navChildren: [
    {
      label: 'Conectores',
      href: '/apps',
      children: [],
      // Dynamic children will be injected by useConnectorList in sidebar
    },
  ],
  routeConfig: [
    { path: '/apps/:appId/*', element: <ConnectorRouter /> },
  ],
  extensions: [connectorHomeExtension],
}
