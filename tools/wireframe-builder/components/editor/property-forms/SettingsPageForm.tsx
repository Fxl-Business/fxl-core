import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import type { SettingsPageSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: SettingsPageSection
  onChange: (updated: SettingsPageSection) => void
}

type Setting = SettingsPageSection['groups'][number]['settings'][number]
type Group = SettingsPageSection['groups'][number]

const DEFAULT_SETTING: Setting = {
  label: 'Nova opcao',
  inputType: 'toggle',
}

const DEFAULT_GROUP: Group = {
  label: 'Novo grupo',
  settings: [{ ...DEFAULT_SETTING }],
}

export default function SettingsPageForm({ section, onChange }: Props) {
  function updateGroup(gi: number, patch: Partial<Group>) {
    onChange({
      ...section,
      groups: section.groups.map((g, i) =>
        i === gi ? { ...g, ...patch } : g
      ),
    })
  }

  function addGroup() {
    onChange({
      ...section,
      groups: [...section.groups, { ...DEFAULT_GROUP, settings: [{ ...DEFAULT_SETTING }] }],
    })
  }

  function removeGroup(gi: number) {
    onChange({
      ...section,
      groups: section.groups.filter((_, i) => i !== gi),
    })
  }

  function updateSetting(gi: number, si: number, patch: Partial<Setting>) {
    const group = section.groups[gi]
    updateGroup(gi, {
      settings: group.settings.map((s, i) =>
        i === si ? { ...s, ...patch } : s
      ),
    })
  }

  function addSetting(gi: number) {
    const group = section.groups[gi]
    updateGroup(gi, {
      settings: [...group.settings, { ...DEFAULT_SETTING }],
    })
  }

  function removeSetting(gi: number, si: number) {
    const group = section.groups[gi]
    updateGroup(gi, {
      settings: group.settings.filter((_, i) => i !== si),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="settings-title">Titulo</Label>
        <Input
          id="settings-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <Label>Grupos</Label>
        <div className="space-y-3 mt-1">
          {section.groups.map((group, gi) => (
            <div key={gi} className="p-3 rounded-md border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Grupo {gi + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeGroup(gi)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Input
                placeholder="Nome do grupo"
                value={group.label}
                onChange={(e) => updateGroup(gi, { label: e.target.value })}
              />

              <div className="space-y-2 pl-2 border-l">
                {group.settings.map((setting, si) => (
                  <div key={si} className="p-2 rounded border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        Opcao {si + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => removeSetting(gi, si)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Label"
                      value={setting.label}
                      onChange={(e) =>
                        updateSetting(gi, si, { label: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Descricao (opcional)"
                      value={setting.description ?? ''}
                      onChange={(e) =>
                        updateSetting(gi, si, { description: e.target.value || undefined })
                      }
                    />
                    <Select
                      value={setting.inputType}
                      onValueChange={(v) =>
                        updateSetting(gi, si, {
                          inputType: v as Setting['inputType'],
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="toggle">Toggle</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="text">Texto</SelectItem>
                      </SelectContent>
                    </Select>

                    {setting.inputType === 'select' && (
                      <Input
                        placeholder="Opcoes (separadas por virgula)"
                        value={(setting.options ?? []).join(', ')}
                        onChange={(e) =>
                          updateSetting(gi, si, {
                            options: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    )}

                    {(setting.inputType === 'text' || setting.inputType === 'select') && (
                      <Input
                        placeholder="Valor padrao (opcional)"
                        value={setting.value ?? ''}
                        onChange={(e) =>
                          updateSetting(gi, si, { value: e.target.value || undefined })
                        }
                      />
                    )}
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => addSetting(gi)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Opcao
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={addGroup}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Adicionar Grupo
        </Button>
      </div>
    </div>
  )
}
