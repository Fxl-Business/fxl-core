import { CheckSquare } from 'lucide-react'
import type { ModuleDefinition } from '@platform/module-loader/registry'
import { MODULE_IDS, SLOT_IDS } from '@platform/module-loader/module-ids'
import { RecentTasksWidget } from './extensions/RecentTasksWidget'

export const tasksManifest: ModuleDefinition = {
  id: MODULE_IDS.TASKS,
  description: 'Gestao de tarefas e kanban por cliente e projeto.',
  tenantScoped: true,
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
  extensions: [
    {
      id: 'tasks-home-widget',
      description: 'Mostra tarefas pendentes recentes no Home dashboard',
      requires: [MODULE_IDS.TASKS],
      injects: {
        [SLOT_IDS.HOME_DASHBOARD]: RecentTasksWidget,
      },
    },
  ],
}
