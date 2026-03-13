import type { ComponentType } from 'react'
import type { SidebarWidget, SidebarWidgetType } from '../types/blueprint'
import { ChevronsUpDown, User } from 'lucide-react'

export type SidebarWidgetZone = 'header' | 'nav' | 'footer'

export type SidebarWidgetRegistration = {
  type: SidebarWidgetType
  icon: ComponentType<{ style?: React.CSSProperties; className?: string }>
  label: string
  zone: SidebarWidgetZone
  defaultProps: () => SidebarWidget
}

export const SIDEBAR_WIDGET_REGISTRY: Record<SidebarWidgetType, SidebarWidgetRegistration> = {
  'workspace-switcher': {
    type: 'workspace-switcher',
    icon: ChevronsUpDown,
    label: 'Workspace Switcher',
    zone: 'header',
    defaultProps: (): SidebarWidget => ({
      type: 'workspace-switcher',
      label: 'Minha Empresa',
      workspaces: [],
    }),
  },
  'user-menu': {
    type: 'user-menu',
    icon: User,
    label: 'User Menu',
    zone: 'footer',
    defaultProps: (): SidebarWidget => ({
      type: 'user-menu',
      name: 'Operador',
      role: 'Admin',
      showRole: true,
    }),
  },
}
