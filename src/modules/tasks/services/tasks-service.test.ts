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
const mockOrder = vi.fn()
const mockFrom = vi.fn()

function wireDefaultMockChain() {
  const chainBase = {
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
    order: mockOrder,
  }

  mockOrder.mockReturnValue(chainBase)
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

vi.mock('@platform/supabase', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}))

// Import after mock setup
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from './tasks-service'
import type { Task } from './tasks-service'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fakeTask: Task = {
  id: 'task-uuid-1',
  title: 'Setup Supabase migrations',
  description: 'Create migration 005 and 006',
  status: 'in_progress',
  priority: 'high',
  client_slug: 'acme',
  due_date: '2026-03-15',
  org_id: 'org_test_123',
  created_by: 'user_clerk_123',
  created_at: '2026-03-12T10:00:00Z',
  updated_at: '2026-03-12T10:00:00Z',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
  })

  it('inserts a row and returns the created task', async () => {
    mockSingle.mockResolvedValue({ data: fakeTask, error: null })

    const selectMock = vi.fn().mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: selectMock })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    const result = await createTask({
      title: 'Setup Supabase migrations',
      description: 'Create migration 005 and 006',
      status: 'in_progress',
      priority: 'high',
      client_slug: 'acme',
      due_date: '2026-03-15',
      created_by: 'user_clerk_123',
      org_id: 'org_test_123',
    })

    expect(mockFrom).toHaveBeenCalledWith('tasks')
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(result).toEqual(fakeTask)
  })

  it('throws when Supabase returns an error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('DB error') })
    const selectMock = vi.fn().mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: selectMock })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    await expect(
      createTask({ title: 'Test task', description: '', org_id: 'org_test_123' })
    ).rejects.toThrow('DB error')
  })

  it('uses default values for optional fields', async () => {
    mockSingle.mockResolvedValue({ data: fakeTask, error: null })
    const selectMock = vi.fn().mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: selectMock })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    await createTask({ title: 'Minimal task', description: '', org_id: 'org_test_123' })

    const insertCall = mockInsert.mock.calls[0] as unknown[]
    const payload = insertCall[0] as Record<string, unknown>
    expect(payload.title).toBe('Minimal task')
  })
})

describe('listTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
  })

  it('returns all tasks when no filters provided', async () => {
    mockOrder.mockResolvedValue({ data: [fakeTask], error: null })
    mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    const results = await listTasks()

    expect(mockFrom).toHaveBeenCalledWith('tasks')
    expect(results).toEqual([fakeTask])
  })

  it('applies status filter via .eq()', async () => {
    const eqMock = vi.fn()
    const orderMock = vi.fn().mockResolvedValue({ data: [fakeTask], error: null })
    eqMock.mockReturnValue({ eq: eqMock, order: orderMock })
    mockSelect.mockReturnValue({ eq: eqMock, order: orderMock })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    await listTasks({ status: 'in_progress' })

    expect(eqMock).toHaveBeenCalledWith('status', 'in_progress')
  })

  it('applies client_slug filter via .eq()', async () => {
    const eqMock = vi.fn()
    const orderMock = vi.fn().mockResolvedValue({ data: [fakeTask], error: null })
    eqMock.mockReturnValue({ eq: eqMock, order: orderMock })
    mockSelect.mockReturnValue({ eq: eqMock, order: orderMock })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    await listTasks({ client_slug: 'acme' })

    expect(eqMock).toHaveBeenCalledWith('client_slug', 'acme')
  })

  it('applies priority filter via .eq()', async () => {
    const eqMock = vi.fn()
    const orderMock = vi.fn().mockResolvedValue({ data: [fakeTask], error: null })
    eqMock.mockReturnValue({ eq: eqMock, order: orderMock })
    mockSelect.mockReturnValue({ eq: eqMock, order: orderMock })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    await listTasks({ priority: 'high' })

    expect(eqMock).toHaveBeenCalledWith('priority', 'high')
  })

  it('throws when Supabase returns an error', async () => {
    mockOrder.mockResolvedValue({ data: null, error: new Error('list error') })
    mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    await expect(listTasks()).rejects.toThrow('list error')
  })
})

describe('getTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
  })

  it('returns task by id', async () => {
    mockSingle.mockResolvedValue({ data: fakeTask, error: null })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    const result = await getTask('task-uuid-1')

    expect(mockEq).toHaveBeenCalledWith('id', 'task-uuid-1')
    expect(mockSingle).toHaveBeenCalledTimes(1)
    expect(result).toEqual(fakeTask)
  })

  it('throws when task not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('not found') })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    await expect(getTask('nonexistent')).rejects.toThrow('not found')
  })
})

describe('updateTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
  })

  it('updates task and returns updated data', async () => {
    const updatedTask = { ...fakeTask, title: 'Updated title' }
    mockSingle.mockResolvedValue({ data: updatedTask, error: null })
    const selectMock = vi.fn().mockReturnValue({ single: mockSingle })
    mockEq.mockReturnValue({ select: selectMock })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    const result = await updateTask('task-uuid-1', { title: 'Updated title' })

    expect(mockFrom).toHaveBeenCalledWith('tasks')
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(result).toEqual(updatedTask)
  })

  it('throws on Supabase error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('update error') })
    const selectMock = vi.fn().mockReturnValue({ single: mockSingle })
    mockEq.mockReturnValue({ select: selectMock })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    await expect(updateTask('task-uuid-1', { title: 'fail' })).rejects.toThrow('update error')
  })
})

describe('updateTaskStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
  })

  it('updates only the status field', async () => {
    const updatedTask = { ...fakeTask, status: 'done' as const }
    mockSingle.mockResolvedValue({ data: updatedTask, error: null })
    const selectMock = vi.fn().mockReturnValue({ single: mockSingle })
    mockEq.mockReturnValue({ select: selectMock })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    const result = await updateTaskStatus('task-uuid-1', 'done')

    expect(mockUpdate).toHaveBeenCalledWith({ status: 'done' })
    expect(mockEq).toHaveBeenCalledWith('id', 'task-uuid-1')
    expect(result).toEqual(updatedTask)
  })

  it('throws on Supabase error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('status error') })
    const selectMock = vi.fn().mockReturnValue({ single: mockSingle })
    mockEq.mockReturnValue({ select: selectMock })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    await expect(updateTaskStatus('task-uuid-1', 'blocked')).rejects.toThrow('status error')
  })
})

describe('deleteTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    wireDefaultMockChain()
  })

  it('calls delete with correct id', async () => {
    mockEq.mockResolvedValue({ error: null })
    mockDelete.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    await deleteTask('task-uuid-1')

    expect(mockFrom).toHaveBeenCalledWith('tasks')
    expect(mockDelete).toHaveBeenCalledTimes(1)
    expect(mockEq).toHaveBeenCalledWith('id', 'task-uuid-1')
  })

  it('throws when delete fails', async () => {
    mockEq.mockResolvedValue({ error: new Error('delete error') })
    mockDelete.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, update: mockUpdate, delete: mockDelete })

    await expect(deleteTask('task-uuid-1')).rejects.toThrow('delete error')
  })
})
