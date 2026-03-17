/**
 * Extension: injects ConnectorHomeWidget into the HOME_DASHBOARD slot.
 * This makes connected spoke apps visible on the Home page.
 */

import type { ModuleExtension } from '@platform/module-loader/registry'
import { MODULE_IDS, SLOT_IDS } from '@platform/module-loader/module-ids'
import { ConnectorHomeWidget } from '../components/ConnectorCard'

export const connectorHomeExtension: ModuleExtension = {
  id: 'connector-home-widget',
  description: 'Mostra apps conectados (spokes) no Home dashboard',
  requires: [MODULE_IDS.CONNECTOR],
  injects: {
    [SLOT_IDS.HOME_DASHBOARD]: ConnectorHomeWidget,
  },
}
