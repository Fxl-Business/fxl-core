import { CheckSquare } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/registry'
import { MODULE_IDS } from '@/modules/module-ids'

export const tasksManifest: ModuleDefinition = {
  id: MODULE_IDS.TASKS,
  description: 'Gestao de tarefas e kanban por cliente e projeto.',
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
