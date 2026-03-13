import { Puzzle } from 'lucide-react'
import type { ModuleManifest } from '@/modules/registry'

export const wireframeBuilderManifest: ModuleManifest = {
  id: 'wireframe-builder',
  label: 'Wireframe Builder',
  route: '/ferramentas/wireframe-builder',
  icon: Puzzle,
  status: 'active',
}
