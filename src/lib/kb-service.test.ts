import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

const mockSingle = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockTextSearch = vi.fn()
const mockContains = vi.fn()
const mockOrder = vi.fn()
const mockFrom = vi.fn()

function wireDefaultMockChain() {
  const chainBase = {
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
    contains: mockContains,
    textSearch: mockTextSearch,
    order: mockOrder,
  }

  mockOrder.mockReturnValue(chainBase)
  mockTextSearch.mockReturnValue(chainBase)
  mockContains.mockReturnValue(chainBase)
  mockEq.mockReturnValue(chainBase)
  mockSelect.mockReturnValue(chainBase)
  mockInsert.mockReturnValue({ select: mockSelect, single: mockSingle })
  mockUpdate.mockReturnValue({ eq: mockEq })
  mockDelete.mockReturnValue({ eq: mockEq })
  mockFrom.mockReturnValue({
    insert: mockInsert,
    select: mockSelect,
    update: mockUpdate,
    delete: mockDelete,
  })
}

wireDefaultMockChain()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}))

// Import after mock setup
import {
  createKnowledgeEntry,
  listKnowledgeEntries,
  getKnowledgeEntry,
  updateKnowledgeEntry,
  deleteKnowledgeEntry,
  searchKnowledgeEntries,
} from './kb-service'
import type { KnowledgeEntry } from './kb-service'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fakeEntry: KnowledgeEntry = {
  id: 'entry-uuid-1',
  entry_type: 'decision',
  title: 'Use Clerk for auth',
  body: 'Decided to use Clerk instead of Supabase Auth for better UX.',
  tags: ['auth', 'clerk'],
  client_slug: null,
  created_by: 'user_clerk_123',
  created_at: '2026-03-12T10:00:00Z',
  updated_at: '2026-03-12T10:00:00Z',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createKnowledgeEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
  })

  it('inserts a row and returns the created entry', async () => {
    mockSingle.mockResolvedValue({ data: fakeEntry, error: null })

    // Wire insert -> select -> single chain
    const selectMock = vi.fn().mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: selectMock })

    const result = await createKnowledgeEntry({
      entry_type: 'decision',
      title: 'Use Clerk for auth',
      body: 'Decided to use Clerk instead of Supabase Auth for better UX.',
      tags: ['auth', 'clerk'],
      created_by: 'user_clerk_123',
    })

    expect(mockFrom).toHaveBeenCalledWith('knowledge_entries')
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(result).toEqual(fakeEntry)
  })

  it('throws when Supabase returns an error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('DB error') })

    const selectMock = vi.fn().mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: selectMock })

    await expect(
      createKnowledgeEntry({
        entry_type: 'bug',
        title: 'Test',
        body: 'Test body',
      })
    ).rejects.toThrow('DB error')
  })

  it('does not include search_vec in the insert payload', async () => {
    mockSingle.mockResolvedValue({ data: fakeEntry, error: null })

    const selectMock = vi.fn().mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: selectMock })

    await createKnowledgeEntry({
      entry_type: 'decision',
      title: 'Test',
      body: 'Body text',
    })

    const insertCall = mockInsert.mock.calls[0] as unknown[]
    const payload = insertCall[0] as Record<string, unknown>
    expect(payload).not.toHaveProperty('search_vec')
  })
})

describe('listKnowledgeEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
  })

  it('returns all entries when no filters provided', async () => {
    const chainWithOrder = {
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
      contains: mockContains,
      textSearch: mockTextSearch,
      order: mockOrder,
    }
    mockOrder.mockResolvedValue({ data: [fakeEntry], error: null })
    mockSelect.mockReturnValue(chainWithOrder)
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    const results = await listKnowledgeEntries()

    expect(mockFrom).toHaveBeenCalledWith('knowledge_entries')
    expect(results).toEqual([fakeEntry])
  })

  it('applies entry_type filter via .eq()', async () => {
    const eqMock = vi.fn()
    const orderMock = vi.fn().mockResolvedValue({ data: [fakeEntry], error: null })
    eqMock.mockReturnValue({ eq: eqMock, order: orderMock, contains: vi.fn().mockReturnValue({ order: orderMock }) })
    mockSelect.mockReturnValue({ eq: eqMock, order: orderMock, contains: vi.fn().mockReturnValue({ order: orderMock }) })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    await listKnowledgeEntries({ entry_type: 'decision' })

    expect(eqMock).toHaveBeenCalledWith('entry_type', 'decision')
  })

  it('applies client_slug filter via .eq()', async () => {
    const eqMock = vi.fn()
    const orderMock = vi.fn().mockResolvedValue({ data: [fakeEntry], error: null })
    eqMock.mockReturnValue({ eq: eqMock, order: orderMock, contains: vi.fn().mockReturnValue({ order: orderMock }) })
    mockSelect.mockReturnValue({ eq: eqMock, order: orderMock, contains: vi.fn().mockReturnValue({ order: orderMock }) })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    await listKnowledgeEntries({ client_slug: 'acme' })

    expect(eqMock).toHaveBeenCalledWith('client_slug', 'acme')
  })

  it('applies tag filter via .contains()', async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: [fakeEntry], error: null })
    const containsMock = vi.fn().mockReturnValue({ order: orderMock })
    mockSelect.mockReturnValue({ eq: mockEq, order: orderMock, contains: containsMock })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    await listKnowledgeEntries({ tag: 'auth' })

    expect(containsMock).toHaveBeenCalledWith('tags', ['auth'])
  })

  it('throws when Supabase returns an error', async () => {
    mockOrder.mockResolvedValue({ data: null, error: new Error('list error') })
    mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq, contains: mockContains })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    await expect(listKnowledgeEntries()).rejects.toThrow('list error')
  })
})

describe('getKnowledgeEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
  })

  it('returns entry by id', async () => {
    mockSingle.mockResolvedValue({ data: fakeEntry, error: null })
    const eqChain = { single: mockSingle }
    mockEq.mockReturnValue(eqChain)
    mockSelect.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    const result = await getKnowledgeEntry('entry-uuid-1')

    expect(mockEq).toHaveBeenCalledWith('id', 'entry-uuid-1')
    expect(mockSingle).toHaveBeenCalledTimes(1)
    expect(result).toEqual(fakeEntry)
  })

  it('throws when entry not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('not found') })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    await expect(getKnowledgeEntry('nonexistent')).rejects.toThrow('not found')
  })
})

describe('updateKnowledgeEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
  })

  it('updates entry and returns updated data', async () => {
    const updatedEntry = { ...fakeEntry, title: 'Updated title' }
    mockSingle.mockResolvedValue({ data: updatedEntry, error: null })
    const selectMock = vi.fn().mockReturnValue({ single: mockSingle })
    mockEq.mockReturnValue({ select: selectMock })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    const result = await updateKnowledgeEntry('entry-uuid-1', { title: 'Updated title' })

    expect(mockFrom).toHaveBeenCalledWith('knowledge_entries')
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(result).toEqual(updatedEntry)
  })

  it('throws on Supabase error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('update error') })
    const selectMock = vi.fn().mockReturnValue({ single: mockSingle })
    mockEq.mockReturnValue({ select: selectMock })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    await expect(
      updateKnowledgeEntry('entry-uuid-1', { title: 'fail' })
    ).rejects.toThrow('update error')
  })
})

describe('deleteKnowledgeEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
  })

  it('calls delete with correct id', async () => {
    mockEq.mockResolvedValue({ error: null })
    mockDelete.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    await deleteKnowledgeEntry('entry-uuid-1')

    expect(mockFrom).toHaveBeenCalledWith('knowledge_entries')
    expect(mockDelete).toHaveBeenCalledTimes(1)
    expect(mockEq).toHaveBeenCalledWith('id', 'entry-uuid-1')
  })

  it('throws when delete fails', async () => {
    mockEq.mockResolvedValue({ error: new Error('delete error') })
    mockDelete.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    await expect(deleteKnowledgeEntry('entry-uuid-1')).rejects.toThrow('delete error')
  })
})

describe('searchKnowledgeEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
  })

  it('calls textSearch with search_vec column and portuguese config', async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: [fakeEntry], error: null })
    const textSearchMock = vi.fn().mockReturnValue({ order: orderMock })
    mockSelect.mockReturnValue({ textSearch: textSearchMock, order: orderMock })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    await searchKnowledgeEntries('clerk auth')

    expect(textSearchMock).toHaveBeenCalledWith('search_vec', 'clerk auth', { config: 'portuguese' })
  })

  it('returns matching entries', async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: [fakeEntry], error: null })
    const textSearchMock = vi.fn().mockReturnValue({ order: orderMock })
    mockSelect.mockReturnValue({ textSearch: textSearchMock, order: orderMock })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    const results = await searchKnowledgeEntries('clerk')

    expect(results).toEqual([fakeEntry])
  })

  it('throws on Supabase error', async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: null, error: new Error('search error') })
    const textSearchMock = vi.fn().mockReturnValue({ order: orderMock })
    mockSelect.mockReturnValue({ textSearch: textSearchMock, order: orderMock })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate, delete: mockDelete })

    await expect(searchKnowledgeEntries('error')).rejects.toThrow('search error')
  })
})
