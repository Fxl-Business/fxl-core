import { supabase } from '@platform/supabase'
import type { ShareToken } from '../types/comments'

export async function validateToken(
  token: string
): Promise<{ valid: boolean; clientSlug: string | null }> {
  const { data, error } = await supabase
    .from('share_tokens')
    .select('client_slug')
    .eq('token', token)
    .eq('revoked', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) return { valid: false, clientSlug: null }
  return { valid: true, clientSlug: data.client_slug }
}

export async function createShareToken(
  clientSlug: string,
  createdBy: string,
  expiresInDays = 30
): Promise<ShareToken> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  const { data, error } = await supabase
    .from('share_tokens')
    .insert({
      client_slug: clientSlug,
      created_by: createdBy,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data as ShareToken
}

export async function getTokensForClient(
  clientSlug: string
): Promise<ShareToken[]> {
  const { data, error } = await supabase
    .from('share_tokens')
    .select('*')
    .eq('client_slug', clientSlug)
    .eq('revoked', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ShareToken[]
}

export async function revokeToken(tokenId: string): Promise<void> {
  const { error } = await supabase
    .from('share_tokens')
    .update({ revoked: true })
    .eq('id', tokenId)

  if (error) throw error
}
