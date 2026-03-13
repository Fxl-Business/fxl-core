import type { ComponentType } from 'react'
import type { SidebarWidgetType } from '../types/blueprint'
import { ChevronsUpDown, User } from 'lucide-react'

export type SidebarWidgetZone = 'header' | 'nav' | 'footer'

export type SidebarWidgetRegistration = {
  icon: ComponentType<{ style?: React.CSSProperties; className?: string }>
  label: string
  zone: SidebarWidgetZone
}

export const SIDEBAR_WIDGET_REGISTRY: Record<SidebarWidgetType, SidebarWidgetRegistration> = {
  'workspace-switcher': {
    icon: ChevronsUpDown,
    label: 'Workspace Switcher',
    zone: 'header',
  },
  'user-menu': {
    icon: User,
    label: 'User Menu',
    zone: 'footer',
  },
}
