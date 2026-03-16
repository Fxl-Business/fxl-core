import { describe, it, expect } from 'vitest'
import { mergeAndSortActivityItems, type ActivityItem } from '@platform/services/activity-feed'

describe('Home page', () => {
  describe('MODULE_REGISTRY grid (HOME-01)', () => {
    it.todo('renders a card for each module in MODULE_REGISTRY')
  })

  describe('Activity feed merge/sort (HOME-02)', () => {
    it('merges and sorts kb_entry and task items by updated_at descending', () => {
      const kbItems: ActivityItem[] = [
        {
          id: 'kb-1',
          title: 'KB Entry 1',
          type: 'kb_entry',
          subtype: 'sop',
          client_slug: 'financeiro-conta-azul',
          updated_at: '2026-03-10T10:00:00Z',
          href: '/knowledge-base/kb-1',
        },
        {
          id: 'kb-2',
          title: 'KB Entry 2',
          type: 'kb_entry',
          subtype: 'reference',
          client_slug: null,
          updated_at: '2026-03-08T09:00:00Z',
          href: '/knowledge-base/kb-2',
        },
        {
          id: 'kb-3',
          title: 'KB Entry 3',
          type: 'kb_entry',
          subtype: 'sop',
          client_slug: 'financeiro-conta-azul',
          updated_at: '2026-03-06T08:00:00Z',
          href: '/knowledge-base/kb-3',
        },
      ]

      const taskItems: ActivityItem[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          type: 'task',
          subtype: 'done',
          client_slug: 'financeiro-conta-azul',
          updated_at: '2026-03-11T15:00:00Z',
          href: '/tarefas',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          type: 'task',
          subtype: 'in_progress',
          client_slug: null,
          updated_at: '2026-03-09T12:00:00Z',
          href: '/tarefas',
        },
        {
          id: 'task-3',
          title: 'Task 3',
          type: 'task',
          subtype: 'todo',
          client_slug: 'financeiro-conta-azul',
          updated_at: '2026-03-07T11:00:00Z',
          href: '/tarefas',
        },
      ]

      const result = mergeAndSortActivityItems(kbItems, taskItems)

      // Result must be sorted by updated_at descending
      expect(result[0].id).toBe('task-1')  // 2026-03-11
      expect(result[1].id).toBe('kb-1')    // 2026-03-10
      expect(result[2].id).toBe('task-2')  // 2026-03-09
      expect(result[3].id).toBe('kb-2')    // 2026-03-08
      expect(result[4].id).toBe('task-3')  // 2026-03-07
      expect(result[5].id).toBe('kb-3')    // 2026-03-06

      // Total length is <= 10
      expect(result.length).toBeLessThanOrEqual(10)
      expect(result.length).toBe(6)
    })

    it('limits output to 10 items when more than 10 are provided', () => {
      const makeItems = (prefix: string, count: number, type: 'kb_entry' | 'task'): ActivityItem[] =>
        Array.from({ length: count }, (_, i) => ({
          id: `${prefix}-${i}`,
          title: `${prefix} ${i}`,
          type,
          updated_at: `2026-03-${String(count - i).padStart(2, '0')}T00:00:00Z`,
          href: type === 'task' ? '/tarefas' : `/knowledge-base/${prefix}-${i}`,
        }))

      const kbItems = makeItems('kb', 8, 'kb_entry')
      const taskItems = makeItems('task', 8, 'task')

      const result = mergeAndSortActivityItems(kbItems, taskItems)
      expect(result.length).toBe(10)
    })
  })
})
