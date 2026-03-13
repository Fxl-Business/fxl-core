import { CheckSquare } from 'lucide-react'
import type { ModuleManifest } from '@/modules/registry'

export const tasksManifest: ModuleManifest = {
  id: 'tasks',
  label: 'Tarefas',
  route: '/tarefas',
  icon: CheckSquare,
  status: 'active',
  navChildren: [
    {
      label: 'Tarefas',
      href: '/tarefas',
      children: [
        { label: 'Lista', href: '/tarefas' },
        { label: 'Kanban', href: '/tarefas/kanban' },
        { label: 'Nova Tarefa', href: '/tarefas/new' },
      ],
    },
  ],
  routeConfig: [],
}
