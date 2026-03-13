import { CheckSquare } from 'lucide-react'
import type { ModuleManifest } from '@/modules/registry'

export const tasksManifest: ModuleManifest = {
  id: 'tasks',
  label: 'Tarefas',
  route: '/tarefas',
  icon: CheckSquare,
  status: 'coming-soon',
  routeConfig: [],
}
