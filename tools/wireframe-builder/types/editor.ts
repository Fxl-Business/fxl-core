import type { BlueprintSection } from './blueprint'

export type HeaderElementType = 'header-brand' | 'header-period' | 'header-user' | 'header-actions'

export type GridLayout = '1' | '2' | '3' | '2-1' | '1-2'

export type ScreenRow = {
  id: string // crypto.randomUUID() for dnd-kit
  layout: GridLayout
  sections: BlueprintSection[] // length must match cell count for layout
}

export type SidebarElementSelection =
  | { type: 'group'; groupIndex: number }
  | { type: 'footer' }
  | { type: 'widget'; widgetIndex: number }

export type FilterBarActionElement = 'date-picker' | 'share' | 'export' | 'compare'

export type EditModeState = {
  active: boolean
  dirty: boolean // unsaved changes exist
  saving: boolean // save in progress
  selectedSection: { rowIndex: number; cellIndex: number } | null
  selectedHeaderElement: HeaderElementType | null
  selectedSidebarElement: SidebarElementSelection | null
  selectedFilterBarAction?: FilterBarActionElement | null
}
