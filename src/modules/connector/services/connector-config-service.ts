/**
 * Connector config service — CRUD for connector configurations stored in tenant_modules.
 *
 * Each connector is stored as a row in tenant_modules with:
 *   module_id = 'connector:<appId>'
 *   config = { appId, appName, baseUrl, apiKey }
 *   enabled = true/false
 *
 * This uses the existing tenant_modules table from migration 008.
 */

import { supabase } from '@platform/supabase'
import type { ConnectorConfig } from '../types'

const CONNECTOR_PREFIX = 'connector:'

/** Build the module_id for a connector */
function toModuleId(appId: string): string {
  return `${CONNECTOR_PREFIX}${appId}`
}

/** Check if a module_id is a connector */
function isConnectorModuleId(moduleId: string): boolean {
  return moduleId.startsWith(CONNECTOR_PREFIX)
}

/** Extract appId from module_id */
function fromModuleId(moduleId: string): string {
  return moduleId.slice(CONNECTOR_PREFIX.length)
}

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

/** Fetch all connector configs for the current org */
export async function listConnectorConfigs(): Promise<ConnectorConfig[]> {
  const { data, error } = await supabase
    .from('tenant_modules')
    .select('module_id, config, enabled')
    .like('module_id', `${CONNECTOR_PREFIX}%`)
    .eq('enabled', true)

  if (error) {
    console.error('Failed to fetch connector configs:', error)
    return []
  }

  return (data ?? [])
    .filter(row => isConnectorModuleId(row.module_id))
    .map(row => {
      const cfg = row.config as Record<string, unknown>
      return {
        appId: (cfg.appId as string) ?? fromModuleId(row.module_id),
        appName: (cfg.appName as string) ?? '',
        baseUrl: (cfg.baseUrl as string) ?? '',
        apiKey: (cfg.apiKey as string) ?? '',
      }
    })
    .filter(c => c.baseUrl) // skip entries without baseUrl
}

/** Fetch all connector configs (including disabled) for admin UI */
export async function listAllConnectorConfigs(): Promise<
  Array<ConnectorConfig & { enabled: boolean }>
> {
  const { data, error } = await supabase
    .from('tenant_modules')
    .select('module_id, config, enabled')
    .like('module_id', `${CONNECTOR_PREFIX}%`)

  if (error) {
    console.error('Failed to fetch connector configs:', error)
    return []
  }

  return (data ?? [])
    .filter(row => isConnectorModuleId(row.module_id))
    .map(row => {
      const cfg = row.config as Record<string, unknown>
      return {
        appId: (cfg.appId as string) ?? fromModuleId(row.module_id),
        appName: (cfg.appName as string) ?? '',
        baseUrl: (cfg.baseUrl as string) ?? '',
        apiKey: (cfg.apiKey as string) ?? '',
        enabled: row.enabled as boolean,
      }
    })
}

// ---------------------------------------------------------------------------
// Write operations
// ---------------------------------------------------------------------------

/** Create or update a connector config */
export async function upsertConnectorConfig(
  config: ConnectorConfig,
  enabled = true,
  orgId = 'org_fxl_default',
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('tenant_modules')
    .upsert(
      {
        org_id: orgId,
        module_id: toModuleId(config.appId),
        enabled,
        config: {
          appId: config.appId,
          appName: config.appName,
          baseUrl: config.baseUrl,
          apiKey: config.apiKey,
        },
      },
      { onConflict: 'org_id,module_id' },
    )

  if (error) {
    console.error('Failed to upsert connector config:', error)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

/** Delete a connector config */
export async function deleteConnectorConfig(
  appId: string,
  orgId = 'org_fxl_default',
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('tenant_modules')
    .delete()
    .eq('org_id', orgId)
    .eq('module_id', toModuleId(appId))

  if (error) {
    console.error('Failed to delete connector config:', error)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

/** Toggle connector enabled/disabled */
export async function toggleConnectorEnabled(
  appId: string,
  enabled: boolean,
  orgId = 'org_fxl_default',
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('tenant_modules')
    .update({ enabled })
    .eq('org_id', orgId)
    .eq('module_id', toModuleId(appId))

  if (error) {
    console.error('Failed to toggle connector:', error)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
