import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SettingsPageSection } from '../../types/blueprint'

type Props = {
  section: SettingsPageSection
}

export default function SettingsPageRenderer({ section }: Props) {
  return (
    <div
      className="rounded-lg p-5 space-y-5"
      style={{
        backgroundColor: 'var(--wf-card)',
        borderColor: 'var(--wf-border)',
        border: '1px solid var(--wf-border)',
      }}
    >
      {section.title && (
        <h3
          className="text-base font-semibold"
          style={{ color: 'var(--wf-body)' }}
        >
          {section.title}
        </h3>
      )}

      {section.groups.map((group, gi) => (
        <div key={gi} className="space-y-3">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--wf-muted)' }}
          >
            {group.label}
          </p>

          <div className="space-y-3">
            {group.settings.map((setting, si) => (
              <div
                key={si}
                className="flex items-center justify-between gap-4 py-2"
                style={{
                  borderBottom: '1px solid var(--wf-border)',
                }}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--wf-body)' }}
                  >
                    {setting.label}
                  </p>
                  {setting.description && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--wf-muted)' }}
                    >
                      {setting.description}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 w-40">
                  {setting.inputType === 'toggle' && (
                    <Switch disabled checked={setting.value === 'true'} />
                  )}
                  {setting.inputType === 'select' && (
                    <Select disabled value={setting.value ?? setting.options?.[0] ?? ''}>
                      <SelectTrigger
                        className="h-8 text-xs"
                        style={{
                          borderColor: 'var(--wf-border)',
                          color: 'var(--wf-body)',
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {setting.options?.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {setting.inputType === 'text' && (
                    <Input
                      disabled
                      className="h-8 text-xs"
                      placeholder={setting.value ?? ''}
                      value={setting.value ?? ''}
                      readOnly
                      style={{
                        borderColor: 'var(--wf-border)',
                        color: 'var(--wf-body)',
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {gi < section.groups.length - 1 && (
            <div
              className="my-3"
              style={{
                borderTop: '1px solid var(--wf-border)',
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
