import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Checkbox } from '@shared/ui/checkbox'
import { cn } from '@shared/utils'
import type {
  SidebarGroup,
  BlueprintScreen,
} from '@tools/wireframe-builder/types/blueprint'

type Props = {
  group: SidebarGroup
  screens: BlueprintScreen[]
  allGroups: SidebarGroup[]
  onChange: (updated: SidebarGroup) => void
  onAssignScreen: (screenId: string, checked: boolean) => void
}

export default function SidebarGroupForm({
  group,
  screens,
  allGroups,
  onChange,
  onAssignScreen,
}: Props) {
  const assignedScreenIds = new Set(allGroups.flatMap((g) => g.screenIds))

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="group-label">Nome do Grupo</Label>
        <Input
          id="group-label"
          value={group.label}
          onChange={(e) => onChange({ ...group, label: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Telas neste grupo</Label>
        <div className="mt-2 space-y-2">
          {screens.map((screen) => {
            const isInThisGroup = group.screenIds.includes(screen.id)
            const isInAnotherGroup =
              !isInThisGroup && assignedScreenIds.has(screen.id)
            const ownerGroup = isInAnotherGroup
              ? allGroups.find((g) => g.screenIds.includes(screen.id))
              : null

            return (
              <div key={screen.id} className="flex items-center gap-2">
                <Checkbox
                  id={`sidebar-group-screen-${screen.id}`}
                  checked={isInThisGroup}
                  onCheckedChange={(checked) => {
                    onAssignScreen(screen.id, checked === true)
                  }}
                />
                <Label
                  htmlFor={`sidebar-group-screen-${screen.id}`}
                  className={cn(
                    'text-sm cursor-pointer',
                    isInAnotherGroup && 'text-muted-foreground',
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
      </div>
    </div>
  )
}
