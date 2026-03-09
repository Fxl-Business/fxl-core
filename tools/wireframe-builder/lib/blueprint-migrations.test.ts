import { describe, it, expect } from 'vitest'
import { migrateBlueprint, CURRENT_SCHEMA_VERSION } from './blueprint-migrations'
import { BlueprintConfigSchema } from './blueprint-schema'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validConfigV1 = {
  slug: 'test-client',
  label: 'Test Client',
  schemaVersion: 1,
  screens: [
    {
      id: 'screen-1',
      title: 'Dashboard',
      periodType: 'mensal',
      filters: [],
      hasCompareSwitch: false,
      sections: [
        { type: 'kpi-grid', items: [{ label: 'Rev', value: 'R$ 100k' }] },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CURRENT_SCHEMA_VERSION', () => {
  it('exports CURRENT_SCHEMA_VERSION equal to 1', () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(1)
  })
})

describe('migrateBlueprint', () => {
  it('returns config unchanged when schemaVersion equals current', () => {
    const result = migrateBlueprint(validConfigV1)
    expect(result.slug).toBe('test-client')
    expect(result.schemaVersion).toBe(1)
  })

  it('applies default schemaVersion 1 when not present', () => {
    const noVersion = {
      slug: 'test-client',
      label: 'Test Client',
      screens: [
        {
          id: 'screen-1',
          title: 'Dashboard',
          periodType: 'mensal',
          filters: [],
          hasCompareSwitch: false,
          sections: [],
        },
      ],
    }
    const result = migrateBlueprint(noVersion)
    expect(result.schemaVersion).toBe(1)
  })

  it('migrates config with schemaVersion 0 to version 1', () => {
    const v0Config = {
      ...validConfigV1,
      schemaVersion: 0,
    }
    const result = migrateBlueprint(v0Config)
    expect(result.schemaVersion).toBe(1)
  })

  it('produces output that passes Zod validation', () => {
    const result = migrateBlueprint(validConfigV1)
    const parsed = BlueprintConfigSchema.safeParse(result)
    expect(parsed.success).toBe(true)
  })

  it('produces output that passes Zod validation even for configs without schemaVersion', () => {
    const noVersion = {
      slug: 'test-client',
      label: 'Test Client',
      screens: [],
    }
    const result = migrateBlueprint(noVersion)
    const parsed = BlueprintConfigSchema.safeParse(result)
    expect(parsed.success).toBe(true)
  })
})
