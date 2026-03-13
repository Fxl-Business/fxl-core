import { BookMarked } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/registry'
import { MODULE_IDS } from '@/modules/module-ids'

export const knowledgeBaseManifest: ModuleDefinition = {
  id: MODULE_IDS.KNOWLEDGE_BASE,
  description: 'Base de conhecimento cross-cliente e operacional.',
  label: 'Base de Conhecimento',
  route: '/knowledge-base',
  icon: BookMarked,
  status: 'coming-soon',
  routeConfig: [],
}
