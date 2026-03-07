export type CommentTarget =
  | { type: 'screen'; screenId: string }
  | { type: 'section'; screenId: string; sectionIndex: number }

export function toTargetId(target: CommentTarget): string {
  if (target.type === 'screen') return `screen:${target.screenId}`
  return `section:${target.screenId}:${target.sectionIndex}`
}

export function parseTargetId(targetId: string): CommentTarget {
  const parts = targetId.split(':')
  if (parts[0] === 'screen') return { type: 'screen', screenId: parts[1] }
  return { type: 'section', screenId: parts[1], sectionIndex: Number(parts[2]) }
}

export type Comment = {
  id: string
  client_slug: string
  target_id: string
  author_id: string
  author_name: string
  author_role: 'operador' | 'cliente'
  text: string
  resolved: boolean
  created_at: string
}

export type ShareToken = {
  id: string
  token: string
  client_slug: string
  created_by: string
  expires_at: string
  revoked: boolean
  created_at: string
}
