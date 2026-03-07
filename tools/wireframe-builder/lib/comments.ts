import { supabase } from '@/lib/supabase'
import type { Comment } from '../types/comments'

export async function addComment(params: {
  clientSlug: string
  targetId: string
  authorName: string
  authorRole: 'operador' | 'cliente'
  text: string
}): Promise<Comment> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('comments')
    .insert({
      client_slug: params.clientSlug,
      target_id: params.targetId,
      author_id: user.id,
      author_name: params.authorName,
      author_role: params.authorRole,
      text: params.text,
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
