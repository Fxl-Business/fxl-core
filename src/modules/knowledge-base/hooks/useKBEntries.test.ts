import { describe, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Wave 0 stub — implementation pending (KB-02)
// Tests define expected behaviors for useKBEntries hook.
// All tests use it.todo() since the hook does not exist yet.
// ---------------------------------------------------------------------------

vi.mock('@/lib/kb-service', () => ({
  listKBEntries: vi.fn(),
}))

describe('useKBEntries', () => {
  it.todo('returns entries from listKBEntries')
  it.todo('passes type filter to listKBEntries')
  it.todo('passes tags filter to listKBEntries')
  it.todo('passes clientSlug filter to listKBEntries')
  it.todo('sets loading to true while fetching')
  it.todo('sets error on failure')
})
