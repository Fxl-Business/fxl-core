import { supabase } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  client_slug: string | null
  due_date: string | null  // ISO date string — Supabase returns date as string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CreateTaskParams {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  client_slug?: string
  due_date?: string | null
  created_by?: string
}

export interface UpdateTaskParams {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  client_slug?: string
  due_date?: string | null
}

// ---------------------------------------------------------------------------
// CRUD functions
// ---------------------------------------------------------------------------

export async function createTask(params: CreateTaskParams): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: params.title,
      description: params.description ?? '',
      status: params.status ?? 'todo',
      priority: params.priority ?? 'medium',
      client_slug: params.client_slug ?? null,
      due_date: params.due_date ?? null,
      created_by: params.created_by ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function listTasks(filters?: {
  status?: TaskStatus
  client_slug?: string
  priority?: TaskPriority
}): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.client_slug) {
    query = query.eq('client_slug', filters.client_slug)
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Task[]
}

export async function getTask(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Task
}

export async function updateTask(
  id: string,
  params: UpdateTaskParams
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(params)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}
