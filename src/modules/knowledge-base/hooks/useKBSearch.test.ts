import { describe, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Wave 0 stub — implementation pending (KB-05)
// Tests define expected behaviors for useKBSearch hook.
// All tests use it.todo() since the hook does not exist yet.
// ---------------------------------------------------------------------------

vi.mock('@/lib/kb-service', () => ({
  searchKBEntries: vi.fn(),
}))

describe('useKBSearch', () => {
  it.todo('returns results for query >= 2 chars')
  it.todo('returns empty results for query < 2 chars without calling searchKBEntries')
  it.todo('sets loading to true while searching')
  it.todo('sets error on failure')
})
