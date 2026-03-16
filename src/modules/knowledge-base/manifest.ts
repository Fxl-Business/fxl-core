import { BookMarked } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/registry'
import { MODULE_IDS, SLOT_IDS } from '@/modules/module-ids'
import { RecentKBWidget } from './extensions/RecentKBWidget'

export const knowledgeBaseManifest: ModuleDefinition = {
  id: MODULE_IDS.KNOWLEDGE_BASE,
  description: 'Base de conhecimento cross-cliente e operacional.',
  label: 'Base de Conhecimento',
  route: '/knowledge-base',
  icon: BookMarked,
  status: 'coming-soon',
  routeConfig: [],
  extensions: [
    {
      id: 'kb-home-widget',
      description: 'Mostra entradas recentes da base de conhecimento no Home dashboard',
      requires: [MODULE_IDS.KNOWLEDGE_BASE],
      injects: {
        [SLOT_IDS.HOME_DASHBOARD]: RecentKBWidget,
      },
    },
  ],
}
