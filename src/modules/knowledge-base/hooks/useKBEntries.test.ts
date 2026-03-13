// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mock kb-service — vi.hoisted() ensures mock refs are available after hoisting
// ---------------------------------------------------------------------------

const { mockListKnowledgeEntries } = vi.hoisted(() => ({
  mockListKnowledgeEntries: vi.fn(),
}))

vi.mock('@/lib/kb-service', () => ({
  listKnowledgeEntries: mockListKnowledgeEntries,
}))

// Import after mock setup
import { useKBEntries } from './useKBEntries'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sampleEntries = [
  {
    id: '1',
    entry_type: 'bug' as const,
    title: 'Auth loop bug',
    body: 'Users get stuck in login loop',
    tags: ['auth', 'bug'],
    client_slug: 'acme',
    created_by: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    entry_type: 'decision' as const,
    title: 'Use Clerk for auth',
    body: '## Context\n\nWe need auth.\n\n## Decision\n\nUse Clerk.',
    tags: ['auth', 'clerk'],
    client_slug: null,
    created_by: null,
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useKBEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListKnowledgeEntries.mockResolvedValue(sampleEntries)
  })

  it('returns entries when filters are empty', async () => {
    const { result } = renderHook(() => useKBEntries({}))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.entries).toEqual(sampleEntries)
    expect(mockListKnowledgeEntries).toHaveBeenCalledWith({})
  })

  it('filters by type', async () => {
    mockListKnowledgeEntries.mockResolvedValue([sampleEntries[0]])

    const { result } = renderHook(() => useKBEntries({ entry_type: 'bug' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockListKnowledgeEntries).toHaveBeenCalledWith({ entry_type: 'bug' })
    expect(result.current.entries).toHaveLength(1)
  })

  it('filters by tags with serialized dependency', async () => {
    mockListKnowledgeEntries.mockResolvedValue([sampleEntries[0]])

    const { result } = renderHook(() => useKBEntries({ tags: ['supabase'] }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockListKnowledgeEntries).toHaveBeenCalledWith({ tag: 'supabase' })
  })

  it('sets error on failure', async () => {
    mockListKnowledgeEntries.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useKBEntries({}))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.entries).toEqual([])
  })
})
