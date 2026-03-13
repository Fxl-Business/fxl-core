import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import type { SidebarWidget } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  widget: SidebarWidget
  onChange: (updated: SidebarWidget) => void
}

export default function SidebarWidgetForm({ widget, onChange }: Props) {
  if (widget.type === 'workspace-switcher') {
    return <WorkspaceSwitcherForm widget={widget} onChange={onChange} />
  }
  return <UserMenuForm widget={widget} onChange={onChange} />
}

// --- Workspace Switcher ---

function WorkspaceSwitcherForm({
  widget,
  onChange,
}: {
  widget: Extract<SidebarWidget, { type: 'workspace-switcher' }>
  onChange: (updated: SidebarWidget) => void
}) {
  const [newWorkspace, setNewWorkspace] = useState('')
  const workspaces = widget.workspaces ?? []

  function addWorkspace() {
    const trimmed = newWorkspace.trim()
    if (!trimmed) return
    onChange({
      ...widget,
      workspaces: [...workspaces, trimmed],
    })
    setNewWorkspace('')
  }

  function removeWorkspace(index: number) {
    onChange({
      ...widget,
      workspaces: workspaces.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ws-label">Label</Label>
        <Input
          id="ws-label"
          value={widget.label ?? ''}
          onChange={(e) => onChange({ ...widget, label: e.target.value })}
          placeholder="Minha Empresa"
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Workspaces</Label>
        <div className="mt-2 space-y-1.5">
          {workspaces.map((ws, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={ws}
                onChange={(e) => {
                  const updated = [...workspaces]
                  updated[idx] = e.target.value
                  onChange({ ...widget, workspaces: updated })
                }}
                className="h-8 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeWorkspace(idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Input
            value={newWorkspace}
            onChange={(e) => setNewWorkspace(e.target.value)}
            placeholder="Novo workspace..."
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addWorkspace()
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0"
            onClick={addWorkspace}
            disabled={!newWorkspace.trim()}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- User Menu ---

function UserMenuForm({
  widget,
  onChange,
}: {
  widget: Extract<SidebarWidget, { type: 'user-menu' }>
  onChange: (updated: SidebarWidget) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="um-name">Nome</Label>
        <Input
          id="um-name"
          value={widget.name ?? ''}
          onChange={(e) => onChange({ ...widget, name: e.target.value })}
          placeholder="Operador"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="um-role">Cargo</Label>
        <Input
          id="um-role"
          value={widget.role ?? ''}
          onChange={(e) => onChange({ ...widget, role: e.target.value })}
          placeholder="Admin"
          className="mt-1"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="um-show-role" className="text-sm">
          Exibir cargo
        </Label>
        <Switch
          id="um-show-role"
          checked={widget.showRole !== false}
          onCheckedChange={(checked) =>
            onChange({ ...widget, showRole: checked })
          }
        />
      </div>
    </div>
  )
}
