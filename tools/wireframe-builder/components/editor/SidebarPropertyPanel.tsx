import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SIDEBAR_WIDGET_REGISTRY } from '@tools/wireframe-builder/lib/sidebar-widget-registry'
import type {
  SidebarConfig,
  BlueprintScreen,
} from '@tools/wireframe-builder/types/blueprint'
import type { SidebarElementSelection } from '@tools/wireframe-builder/types/editor'
import SidebarGroupForm from './property-forms/SidebarGroupForm'
import SidebarFooterForm from './property-forms/SidebarFooterForm'
import SidebarWidgetForm from './property-forms/SidebarWidgetForm'

type Props = {
  open: boolean
  selection: SidebarElementSelection | null
  sidebarConfig: SidebarConfig
  screens: BlueprintScreen[]
  onClose: () => void
  onUpdateConfig: (updater: (config: SidebarConfig) => SidebarConfig) => void
}

function getTitle(selection: SidebarElementSelection | null): string {
  if (!selection) return ''
  switch (selection.type) {
    case 'group':
      return 'Editar Grupo'
    case 'footer':
      return 'Editar Rodape'
    case 'widget': {
      return 'Editar Widget'
    }
  }
}

export default function SidebarPropertyPanel({
  open,
  selection,
  sidebarConfig,
  screens,
  onClose,
  onUpdateConfig,
}: Props) {
  function renderForm() {
    if (!selection) return null

    switch (selection.type) {
      case 'group': {
        const groups = sidebarConfig.groups ?? []
        const group = groups[selection.groupIndex]
        if (!group) return null

        return (
          <SidebarGroupForm
            group={group}
            screens={screens}
            allGroups={groups}
            onChange={(updated) => {
              onUpdateConfig((cfg) => {
                const newGroups = [...(cfg.groups ?? [])]
                newGroups[selection.groupIndex] = updated
                return { ...cfg, groups: newGroups }
              })
            }}
            onAssignScreen={(screenId, checked) => {
              onUpdateConfig((cfg) => {
                const newGroups = (cfg.groups ?? []).map((g, gi) => {
                  const filteredIds = g.screenIds.filter((id) => id !== screenId)
                  if (gi === selection.groupIndex && checked) {
                    return { ...g, screenIds: [...filteredIds, screenId] }
                  }
                  return { ...g, screenIds: filteredIds }
                })
                return { ...cfg, groups: newGroups }
              })
            }}
          />
        )
      }

      case 'footer': {
        return (
          <SidebarFooterForm
            footer={sidebarConfig.footer ?? ''}
            onChange={(footer) => {
              onUpdateConfig((cfg) => ({ ...cfg, footer }))
            }}
          />
        )
      }

      case 'widget': {
        const widgets = sidebarConfig.widgets ?? []
        const widget = widgets[selection.widgetIndex]
        if (!widget) return null

        const reg = SIDEBAR_WIDGET_REGISTRY[widget.type]
        const widgetLabel = reg?.label ?? 'Widget'

        return (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              {widgetLabel}
            </p>
            <SidebarWidgetForm
              widget={widget}
              onChange={(updated) => {
                onUpdateConfig((cfg) => {
                  const newWidgets = [...(cfg.widgets ?? [])]
                  newWidgets[selection.widgetIndex] = updated
                  return { ...cfg, widgets: newWidgets }
                })
              }}
            />
          </>
        )
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] overflow-y-auto">
        {selection && (
          <>
            <SheetHeader>
              <SheetTitle>{getTitle(selection)}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{renderForm()}</div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
