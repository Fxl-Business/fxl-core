// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mock kb-service — vi.hoisted() ensures mock refs are available after hoisting
// ---------------------------------------------------------------------------

const { mockSearchKnowledgeEntries } = vi.hoisted(() => ({
  mockSearchKnowledgeEntries: vi.fn(),
}))

vi.mock('@/lib/kb-service', () => ({
  searchKnowledgeEntries: mockSearchKnowledgeEntries,
}))

// Import after mock setup
import { useKBSearch } from './useKBSearch'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sampleResults = [
  {
    id: '1',
    entry_type: 'bug' as const,
    title: 'Auth bug',
    body: 'Authentication issue',
    tags: ['auth'],
    client_slug: null,
    created_by: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useKBSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchKnowledgeEntries.mockResolvedValue(sampleResults)
  })

  it('returns results for query >= 2 chars', async () => {
    const { result } = renderHook(() => useKBSearch('auth'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSearchKnowledgeEntries).toHaveBeenCalledWith('auth')
    expect(result.current.results).toEqual(sampleResults)
  })

  it('returns empty for query < 2 chars without fetching', async () => {
    const { result } = renderHook(() => useKBSearch('a'))

    // Should not fetch — results empty immediately
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSearchKnowledgeEntries).not.toHaveBeenCalled()
    expect(result.current.results).toEqual([])
  })

  it('returns empty for empty query without fetching', async () => {
    const { result } = renderHook(() => useKBSearch(''))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSearchKnowledgeEntries).not.toHaveBeenCalled()
    expect(result.current.results).toEqual([])
  })

  it('sets error on failure', async () => {
    mockSearchKnowledgeEntries.mockRejectedValue(new Error('Search error'))

    const { result } = renderHook(() => useKBSearch('auth'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Search error')
    expect(result.current.results).toEqual([])
  })
})
