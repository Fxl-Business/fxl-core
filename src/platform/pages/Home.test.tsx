import { describe, it, expect } from 'vitest'
import { sortActivityItems, type ActivityItem } from '@platform/services/activity-feed'

describe('Home page', () => {
  describe('MODULE_REGISTRY grid (HOME-01)', () => {
    it.todo('renders a card for each module in MODULE_REGISTRY')
  })

  describe('Activity feed sort (HOME-02)', () => {
    it('sorts task items by updated_at descending', () => {
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
        {
          id: 'task-4',
          title: 'Task 4',
          type: 'task',
          subtype: 'in_progress',
          client_slug: null,
          updated_at: '2026-03-10T10:00:00Z',
          href: '/tarefas',
        },
        {
          id: 'task-5',
          title: 'Task 5',
          type: 'task',
          subtype: 'todo',
          client_slug: null,
          updated_at: '2026-03-08T09:00:00Z',
          href: '/tarefas',
        },
        {
          id: 'task-6',
          title: 'Task 6',
          type: 'task',
          subtype: 'done',
          client_slug: null,
          updated_at: '2026-03-06T08:00:00Z',
          href: '/tarefas',
        },
      ]

      const result = sortActivityItems(taskItems)

      // Result must be sorted by updated_at descending
      expect(result[0].id).toBe('task-1')  // 2026-03-11
      expect(result[1].id).toBe('task-4')  // 2026-03-10
      expect(result[2].id).toBe('task-2')  // 2026-03-09
      expect(result[3].id).toBe('task-5')  // 2026-03-08
      expect(result[4].id).toBe('task-3')  // 2026-03-07
      expect(result[5].id).toBe('task-6')  // 2026-03-06

      // Total length is <= 10
      expect(result.length).toBeLessThanOrEqual(10)
      expect(result.length).toBe(6)
    })

    it('limits output to 10 items when more than 10 are provided', () => {
      const makeItems = (count: number): ActivityItem[] =>
        Array.from({ length: count }, (_, i) => ({
          id: `task-${i}`,
          title: `Task ${i}`,
          type: 'task' as const,
          updated_at: `2026-03-${String(count - i).padStart(2, '0')}T00:00:00Z`,
          href: '/tarefas',
        }))

      const taskItems = makeItems(15)

      const result = sortActivityItems(taskItems)
      expect(result.length).toBe(10)
    })
  })
})
