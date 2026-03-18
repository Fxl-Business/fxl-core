import { supabase } from '@platform/supabase'
import type { Comment } from '../types/comments'
import { resolveProjectId } from './project-resolver'

export async function addComment(params: {
  clientSlug: string
  targetId: string
  authorId: string
  authorName: string
  authorRole: 'operador' | 'cliente'
  text: string
}): Promise<Comment> {
  const projectId = await resolveProjectId(params.clientSlug)

  const { data, error } = await supabase
    .from('comments')
    .insert({
      client_slug: params.clientSlug,
      target_id: params.targetId,
      author_id: params.authorId,
      author_name: params.authorName,
      author_role: params.authorRole,
      text: params.text,
      ...(projectId ? { project_id: projectId } : {}),
    })
    .select()
    .single()

  if (error) throw error
  return data as Comment
}

export async function getCommentsByScreen(
  clientSlug: string,
  screenId: string
): Promise<Comment[]> {
  const projectId = await resolveProjectId(clientSlug)

  // Prefer project_id if available
  if (projectId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('project_id', projectId)
      .like('target_id', `%${screenId}%`)
      .order('created_at', { ascending: true })

    if (!error && data) {
      return (data ?? []) as Comment[]
    }
  }

  // Fallback to client_slug
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('client_slug', clientSlug)
    .like('target_id', `%${screenId}%`)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Comment[]
}

export async function getCommentsForClient(
  clientSlug: string
): Promise<Comment[]> {
  const projectId = await resolveProjectId(clientSlug)

  if (projectId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      return (data ?? []) as Comment[]
    }
  }

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('client_slug', clientSlug)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Comment[]
}

export async function resolveComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .update({ resolved: true })
    .eq('id', commentId)

  if (error) throw error
}
