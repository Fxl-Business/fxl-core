import { supabase } from '@platform/supabase'
import { MODULE_IDS } from '@platform/module-loader/module-ids'
import type { ModuleId } from '@platform/module-loader/registry'

const STORAGE_KEY = 'fxl-enabled-modules'
const MIGRATION_FLAG_PREFIX = 'fxl_modules_migrated_'

const ALL_MODULE_IDS: ModuleId[] = Object.values(MODULE_IDS)

/**
 * One-time migration: reads localStorage module toggles and inserts them
 * into the tenant_modules table for the given org.
 *
 * Only runs once per org (tracked via localStorage flag).
 * Only runs in org mode — caller is responsible for checking auth mode.
 */
export async function migrateLocalModulesToTenantModules(orgId: string): Promise<void> {
  const flagKey = `${MIGRATION_FLAG_PREFIX}${orgId}`

  // Already migrated for this org
  if (localStorage.getItem(flagKey) === 'true') {
    return
  }

  // Check if tenant_modules already has entries for this org
  const { data: existing, error: checkError } = await supabase
    .from('tenant_modules')
    .select('module_id')
    .eq('org_id', orgId)
    .limit(1)

  if (checkError) {
    console.warn('[migrate-local-modules] Error checking tenant_modules:', checkError.message)
    return
  }

  // If org already has entries, skip migration (data already exists)
  if (existing && existing.length > 0) {
    localStorage.setItem(flagKey, 'true')
    return
  }

  // Read localStorage module state
  let enabledSet: Set<string>
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      // No localStorage data — all modules enabled, nothing to migrate
      localStorage.setItem(flagKey, 'true')
      return
    }
    const parsed = JSON.parse(stored) as string[]
    enabledSet = new Set(parsed)
  } catch {
    // Corrupt localStorage — skip migration
    localStorage.setItem(flagKey, 'true')
    return
  }

  // Build rows for all known modules
  const rows = ALL_MODULE_IDS.map(moduleId => ({
    org_id: orgId,
    module_id: moduleId,
    enabled: enabledSet.has(moduleId),
  }))

  const { error: insertError } = await supabase
    .from('tenant_modules')
    .insert(rows)

  if (insertError) {
    console.warn('[migrate-local-modules] Error inserting tenant_modules:', insertError.message)
    return
  }

  // Mark migration done
  localStorage.setItem(flagKey, 'true')
}
