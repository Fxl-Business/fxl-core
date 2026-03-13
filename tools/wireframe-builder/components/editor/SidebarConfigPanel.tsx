import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { SIDEBAR_WIDGET_REGISTRY } from '@tools/wireframe-builder/lib/sidebar-widget-registry'
import type {
  SidebarConfig,
  SidebarGroup,
  BlueprintScreen,
} from '@tools/wireframe-builder/types/blueprint'

type Props = {
  open: boolean
  config: SidebarConfig
  screens: BlueprintScreen[]
  onChange: (updated: SidebarConfig) => void
  onClose: () => void
}

export default function SidebarConfigPanel({ open, config, screens, onChange, onClose }: Props) {
  function updateConfig(patch: Partial<SidebarConfig>) {
    onChange({ ...config, ...patch })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configurar Sidebar</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Section 1: Footer Text */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Texto do Rodape</h3>
            <Input
              value={config.footer ?? ''}
              onChange={(e) => updateConfig({ footer: e.target.value })}
              placeholder="Desenvolvido por FXL"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Texto exibido no rodape da sidebar
            </p>
          </div>

          <Separator />

          {/* Section 2: Groups */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Grupos</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newGroup: SidebarGroup = {
                    label: 'Novo Grupo',
                    screenIds: [],
                  }
                  updateConfig({
                    groups: [...(config.groups ?? []), newGroup],
                  })
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Adicionar Grupo
              </Button>
            </div>

            {(config.groups ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground">
                Nenhum grupo criado. Todas as telas aparecem em uma lista unica.
              </p>
            )}

            {(config.groups ?? []).map((group, groupIndex) => (
              <GroupEditor
                key={groupIndex}
                group={group}
                groupIndex={groupIndex}
                screens={screens}
                allGroups={config.groups ?? []}
                onUpdateGroup={(updated) => {
                  const newGroups = [...(config.groups ?? [])]
                  newGroups[groupIndex] = updated
                  updateConfig({ groups: newGroups })
                }}
                onDeleteGroup={() => {
                  const newGroups = [...(config.groups ?? [])]
                  newGroups.splice(groupIndex, 1)
                  updateConfig({ groups: newGroups })
                }}
                onAssignScreen={(screenId, checked) => {
                  const newGroups = (config.groups ?? []).map((g, gi) => {
                    const filteredIds = g.screenIds.filter((id) => id !== screenId)
                    if (gi === groupIndex && checked) {
                      return { ...g, screenIds: [...filteredIds, screenId] }
                    }
                    return { ...g, screenIds: filteredIds }
                  })
                  updateConfig({ groups: newGroups })
                }}
              />
            ))}
          </div>

          <Separator />

          {/* Section 3: Widgets */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Widgets</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Componentes compostos exibidos na sidebar
            </p>

            {Object.values(SIDEBAR_WIDGET_REGISTRY).map((reg) => {
              const isEnabled = (config.widgets ?? []).some((w) => w.type === reg.type)
              const Icon = reg.icon

              return (
                <div key={reg.type} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">{reg.label}</Label>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => {
                      const currentWidgets = config.widgets ?? []
                      if (checked) {
                        updateConfig({
                          widgets: [...currentWidgets, reg.defaultProps()],
                        })
                      } else {
                        updateConfig({
                          widgets: currentWidgets.filter((w) => w.type !== reg.type),
                        })
                      }
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// GroupEditor — private sub-component (not exported)
// ---------------------------------------------------------------------------

type GroupEditorProps = {
  group: SidebarGroup
  groupIndex: number
  screens: BlueprintScreen[]
  allGroups: SidebarGroup[]
  onUpdateGroup: (updated: SidebarGroup) => void
  onDeleteGroup: () => void
  onAssignScreen: (screenId: string, checked: boolean) => void
}

function GroupEditor({
  group,
  groupIndex,
  screens,
  allGroups,
  onUpdateGroup,
  onDeleteGroup,
  onAssignScreen,
}: GroupEditorProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const assignedScreenIds = new Set(allGroups.flatMap((g) => g.screenIds))

  return (
    <div className="rounded-lg border p-3 mb-3">
      {/* Group header: rename input + delete button */}
      <div className="flex items-center gap-2 mb-2">
        <Input
          value={group.label}
          onChange={(e) => onUpdateGroup({ ...group, label: e.target.value })}
          className="h-8 text-sm font-medium"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => {
            if (group.screenIds.length > 0) {
              setConfirmDelete(true)
            } else {
              onDeleteGroup()
            }
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Screen assignment checkboxes */}
      <div className="space-y-1.5 ml-1">
        <p className="text-xs text-muted-foreground mb-1">Telas neste grupo:</p>
        {screens.map((screen) => {
          const isInThisGroup = group.screenIds.includes(screen.id)
          const isInAnotherGroup = !isInThisGroup && assignedScreenIds.has(screen.id)
          const ownerGroup = isInAnotherGroup
            ? allGroups.find((g) => g.screenIds.includes(screen.id))
            : null

          return (
            <div key={screen.id} className="flex items-center gap-2">
              <Checkbox
                id={`group-${groupIndex}-screen-${screen.id}`}
                checked={isInThisGroup}
                onCheckedChange={(checked) => {
                  onAssignScreen(screen.id, checked === true)
                }}
              />
              <Label
                htmlFor={`group-${groupIndex}-screen-${screen.id}`}
                className={cn(
                  'text-sm cursor-pointer',
                  isInAnotherGroup && 'text-muted-foreground'
                )}
              >
                {screen.title}
                {isInAnotherGroup && ownerGroup && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({ownerGroup.label})
                  </span>
                )}
              </Label>
            </div>
          )
        })}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="mt-2 rounded-md border border-destructive/50 bg-destructive/5 p-2">
          <p className="text-xs text-destructive mb-2">
            Este grupo tem {group.screenIds.length} tela(s). Excluir? As telas ficarao sem grupo.
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                onDeleteGroup()
                setConfirmDelete(false)
              }}
            >
              Excluir
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setConfirmDelete(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
