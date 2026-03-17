import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '@platform/supabase'
import { Switch } from '@shared/ui/switch'
import { Input } from '@shared/ui/input'
import { Button } from '@shared/ui/button'
import { Loader2, Save, Settings } from 'lucide-react'

interface PlatformSetting {
  key: string
  value: string
  description: string
  updated_at: string
}

function isBooleanSetting(value: string): boolean {
  return value === 'true' || value === 'false'
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<PlatformSetting[]>([])
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set())

  async function fetchSettings() {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('platform_settings')
      .select('*')
      .order('key')

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const rows = (data ?? []) as PlatformSetting[]
    setSettings(rows)
    setEditedValues(
      Object.fromEntries(rows.map(s => [s.key, s.value]))
    )
    setLoading(false)
  }

  useEffect(() => { fetchSettings() }, [])

  async function updateSetting(key: string, newValue: string) {
    const previousValue = editedValues[key]
    setEditedValues(prev => ({ ...prev, [key]: newValue }))
    setSavingKeys(prev => new Set(prev).add(key))

    const { error: updateError } = await supabase
      .from('platform_settings')
      .update({ value: newValue, updated_at: new Date().toISOString() })
      .eq('key', key)

    setSavingKeys(prev => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })

    if (updateError) {
      toast.error('Erro ao atualizar configuracao')
      setEditedValues(prev => ({ ...prev, [key]: previousValue }))
      return
    }

    toast.success('Configuracao atualizada')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchSettings}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">
            Configuracoes
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Feature flags e configuracoes globais da plataforma.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Settings className="h-3.5 w-3.5" />
          {settings.length}
        </span>
      </div>

      {/* Settings list */}
      <div className="space-y-3">
        {settings.map(setting => {
          const isBoolean = isBooleanSetting(setting.value)
          const currentValue = editedValues[setting.key] ?? setting.value
          const isSaving = savingKeys.has(setting.key)
          const hasChanged = !isBoolean && currentValue !== setting.value

          return (
            <div
              key={setting.key}
              className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 dark:bg-card dark:border-slate-700"
            >
              <div className="min-w-0 flex-1">
                <span className="font-mono text-sm text-slate-900 dark:text-foreground">
                  {setting.key}
                </span>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {setting.description}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {isBoolean ? (
                  <Switch
                    checked={currentValue === 'true'}
                    disabled={isSaving}
                    onCheckedChange={checked =>
                      updateSetting(setting.key, checked ? 'true' : 'false')
                    }
                  />
                ) : (
                  <>
                    <Input
                      className="h-8 w-32 text-sm"
                      value={currentValue}
                      onChange={e =>
                        setEditedValues(prev => ({
                          ...prev,
                          [setting.key]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!hasChanged || isSaving}
                      onClick={() => updateSetting(setting.key, currentValue)}
                    >
                      {isSaving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
