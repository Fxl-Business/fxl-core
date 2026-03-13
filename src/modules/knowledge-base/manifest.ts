import { BookMarked } from 'lucide-react'
import type { ModuleManifest } from '@/modules/registry'

export const knowledgeBaseManifest: ModuleManifest = {
  id: 'knowledge-base',
  label: 'Base de Conhecimento',
  route: '/knowledge-base',
  icon: BookMarked,
  status: 'coming-soon',
  routeConfig: [],
}
