import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { BlueprintConfig } from '../types/blueprint'

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

// Supabase's fluent chain uses deep self-referencing types.
// We type mocks loosely via vi.fn() -- return values are wired in wireDefaultMockChain().
const mockMaybeSingle = vi.fn()
const mockSingle = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockUpsert = vi.fn()
const mockUpdate = vi.fn()
const mockFrom = vi.fn()

// Wire default chain returns
function wireDefaultMockChain() {
  const eqReturn = { maybeSingle: mockMaybeSingle, eq: mockEq, select: mockSelect, single: mockSingle }
  mockEq.mockReturnValue(eqReturn)
  mockSelect.mockReturnValue({ eq: mockEq, maybeSingle: mockMaybeSingle })
  mockUpdate.mockReturnValue({ eq: mockEq })
  mockUpsert.mockReturnValue({ error: null })
  mockFrom.mockReturnValue({ select: mockSelect, upsert: mockUpsert, update: mockUpdate })
}

wireDefaultMockChain()

vi.mock('@platform/supabase', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}))

// Mock project-resolver to avoid real Supabase calls during slug->project_id resolution
vi.mock('./project-resolver', () => ({
  resolveProjectId: vi.fn().mockResolvedValue(null),
}))

// Import after mock setup
import { loadBlueprint, saveBlueprint, seedFromFile, checkForUpdates } from './blueprint-store'
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
    wireDefaultMockChain()
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
  const NEW_UPDATED_AT = '2026-03-09T14:00:00.000Z'

  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
    mockMaybeSingle.mockResolvedValue({
      data: { updated_at: NEW_UPDATED_AT },
      error: null,
    })
  })

  it('validates config via Zod parse before writing', async () => {
    // null lastKnownUpdatedAt triggers upsert path
    const result = await saveBlueprint('test-client', validConfigV1, 'user-1', null)

    // Verify upsert was called (i.e., validation passed and write happened)
    expect(mockUpsert).toHaveBeenCalledTimes(1)
    const upsertArgs = mockUpsert.mock.calls[0] as unknown[]
    const upsertArg = upsertArgs[0] as Record<string, unknown>
    expect(upsertArg.client_slug).toBe('test-client')
    expect((upsertArg.config as Record<string, unknown>).slug).toBe('test-client')
    expect(result.success).toBe(true)
    expect(result.conflict).toBe(false)
  })

  it('throws on invalid config (Zod rejection)', async () => {
    const invalidConfig = {
      // Missing required fields
      bad: 'data',
    }

    await expect(
      saveBlueprint('test-client', invalidConfig as unknown as BlueprintConfig, 'user-1', null)
    ).rejects.toThrow()
  })

  it('with matching lastKnownUpdatedAt returns success with new updatedAt', async () => {
    // Simulate successful conditional update
    mockMaybeSingle.mockResolvedValue({
      data: { updated_at: NEW_UPDATED_AT },
      error: null,
    })

    const result = await saveBlueprint(
      'test-client',
      validConfigV1,
      'user-1',
      FAKE_UPDATED_AT,
    )

    expect(result.success).toBe(true)
    expect(result.conflict).toBe(false)
    expect(result.updatedAt).toBe(NEW_UPDATED_AT)
  })

  it('with mismatched lastKnownUpdatedAt returns conflict', async () => {
    // Simulate no row matched (updated_at changed in DB)
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    })

    const result = await saveBlueprint(
      'test-client',
      validConfigV1,
      'user-1',
      FAKE_UPDATED_AT,
    )

    expect(result.success).toBe(false)
    expect(result.conflict).toBe(true)
    expect(result.updatedAt).toBeUndefined()
  })

  it('with null lastKnownUpdatedAt uses upsert without locking', async () => {
    const result = await saveBlueprint('test-client', validConfigV1, 'user-1', null)

    // Should use upsert (not update)
    expect(mockUpsert).toHaveBeenCalledTimes(1)
    expect(result.success).toBe(true)
    expect(result.conflict).toBe(false)
  })
})

describe('checkForUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
  })

  it('returns updated_at when row exists', async () => {
    mockSingle.mockResolvedValue({
      data: { updated_at: FAKE_UPDATED_AT },
      error: null,
    })

    const result = await checkForUpdates('test-client')
    expect(result).toBe(FAKE_UPDATED_AT)
  })

  it('returns null when no row exists', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: null,
    })

    const result = await checkForUpdates('test-client')
    expect(result).toBeNull()
  })
})

describe('seedFromFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
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
