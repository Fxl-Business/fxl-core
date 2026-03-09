import { BlueprintConfigSchema } from './blueprint-schema'
import type { ValidatedBlueprintConfig } from './blueprint-schema'

// ---------------------------------------------------------------------------
// Schema versioning
// ---------------------------------------------------------------------------

export const CURRENT_SCHEMA_VERSION = 1

type Migrator = (config: Record<string, unknown>) => Record<string, unknown>

/**
 * Version-keyed migrator registry.
 * Each key N maps to a function that migrates from version N to N+1.
 *
 * Example for future:
 *   1: (config) => ({ ...config, newField: 'default', schemaVersion: 2 }),
 */
const migrators: Record<number, Migrator> = {
  // v0 -> v1: set schemaVersion to 1 (initial bootstrap)
  0: (config) => ({ ...config, schemaVersion: 1 }),
}

// ---------------------------------------------------------------------------
// Migration function
// ---------------------------------------------------------------------------

/**
 * Migrate a raw blueprint config object to the current schema version.
 *
 * - If schemaVersion is missing or 0, treats as v0 and migrates to v1.
 * - Runs the migration chain (v0->v1, v1->v2, etc.) until current.
 * - Validates the final result via Zod safeParse.
 * - Throws a descriptive error if migration produces invalid config.
 */
export function migrateBlueprint(
  raw: Record<string, unknown>
): ValidatedBlueprintConfig {
  let version = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 0
  let current = { ...raw }

  while (version < CURRENT_SCHEMA_VERSION) {
    const migrator = migrators[version]
    if (!migrator) {
      throw new Error(
        `No migrator for schema version ${version}. ` +
          `Cannot migrate to v${CURRENT_SCHEMA_VERSION}.`
      )
    }
    current = migrator(current)
    version =
      typeof current.schemaVersion === 'number'
        ? current.schemaVersion
        : version + 1
  }

  // Validate final result
  const result = BlueprintConfigSchema.safeParse(current)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')
    throw new Error(
      `Migration to v${CURRENT_SCHEMA_VERSION} produced invalid config: ${issues}`
    )
  }

  return result.data
}
