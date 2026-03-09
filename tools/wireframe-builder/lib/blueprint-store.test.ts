import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { BlueprintConfig } from '../types/blueprint'

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

const mockMaybeSingle = vi.fn()
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }))
const mockUpsert = vi.fn(() => ({ error: null }))
const mockFrom = vi.fn((_table: string) => ({
  select: mockSelect,
  upsert: mockUpsert,
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}))

// Import after mock setup
import { loadBlueprint, saveBlueprint, seedFromFile } from './blueprint-store'
import { CURRENT_SCHEMA_VERSION } from './blueprint-migrations'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validConfigV1: BlueprintConfig = {
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

const FAKE_UPDATED_AT = '2026-03-09T12:00:00.000Z'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('loadBlueprint', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset chain: from -> select -> eq -> maybeSingle
    mockFrom.mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
    })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle })
  })

  it('returns { config, updatedAt } tuple for valid data', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { config: validConfigV1, updated_at: FAKE_UPDATED_AT },
      error: null,
    })

    const result = await loadBlueprint('test-client')

    expect(result).not.toBeNull()
    expect(result!.config.slug).toBe('test-client')
    expect(result!.config.schemaVersion).toBe(1)
    expect(result!.updatedAt).toBe(FAKE_UPDATED_AT)
  })

  it('returns Zod-parsed config (not unsafe cast)', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { config: validConfigV1, updated_at: FAKE_UPDATED_AT },
      error: null,
    })

    const result = await loadBlueprint('test-client')
    // If Zod parsing works, schemaVersion will be populated even if not in source
    expect(result).not.toBeNull()
    expect(result!.config.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
  })

  it('returns null when no row found', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })

    const result = await loadBlueprint('nonexistent')
    expect(result).toBeNull()
  })

  it('returns null when Zod validation fails (malformed config)', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        config: { bad: 'data' }, // missing slug, label, screens
        updated_at: FAKE_UPDATED_AT,
      },
      error: null,
    })

    const result = await loadBlueprint('test-client')
    expect(result).toBeNull()
  })

  it('calls migrateBlueprint when schemaVersion < CURRENT_SCHEMA_VERSION', async () => {
    const v0Config = {
      slug: 'test-client',
      label: 'Test Client',
      // no schemaVersion => treated as v0, triggers migration
      screens: [
        {
          id: 'screen-1',
          title: 'Dashboard',
          periodType: 'mensal' as const,
          filters: [],
          hasCompareSwitch: false,
          sections: [],
        },
      ],
    }

    mockMaybeSingle.mockResolvedValue({
      data: { config: v0Config, updated_at: FAKE_UPDATED_AT },
      error: null,
    })

    // Mock the save-back after migration
    mockUpsert.mockReturnValue({ error: null })

    const result = await loadBlueprint('test-client')
    expect(result).not.toBeNull()
    expect(result!.config.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
  })
})

describe('saveBlueprint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
    })
    mockUpsert.mockReturnValue({ error: null })
  })

  it('validates config via Zod parse before writing', async () => {
    await saveBlueprint('test-client', validConfigV1, 'user-1')

    // Verify upsert was called (i.e., validation passed and write happened)
    expect(mockUpsert).toHaveBeenCalledTimes(1)
    const upsertArgs = mockUpsert.mock.calls[0] as unknown[]
    const upsertArg = upsertArgs[0] as Record<string, unknown>
    expect(upsertArg.client_slug).toBe('test-client')
    expect((upsertArg.config as Record<string, unknown>).slug).toBe('test-client')
  })

  it('throws on invalid config (Zod rejection)', async () => {
    const invalidConfig = {
      // Missing required fields
      bad: 'data',
    }

    await expect(
      saveBlueprint('test-client', invalidConfig as unknown as BlueprintConfig, 'user-1')
    ).rejects.toThrow()
  })
})

describe('seedFromFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockFrom.mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
    })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle })
    mockUpsert.mockReturnValue({ error: null })
  })

  it('does not seed if data already exists', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { config: validConfigV1, updated_at: FAKE_UPDATED_AT },
      error: null,
    })

    await seedFromFile('test-client', validConfigV1, 'seeder')

    // loadBlueprint is called (from -> select), but upsert should NOT be called
    // because data already exists
    expect(mockUpsert).not.toHaveBeenCalled()
  })
})
