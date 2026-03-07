import type { ReactNode } from 'react'
import type { Comment } from '../types/comments'
import { toTargetId } from '../types/comments'
import CommentIcon from './CommentIcon'
import CommentBadge from './CommentBadge'

type Props = {
  screenId: string
  sectionIndex: number
  clientSlug: string
  comments: Comment[]
  onOpenComments: (targetId: string, label: string) => void
  children: ReactNode
}

export default function SectionWrapper({
  screenId,
  sectionIndex,
  comments,
  onOpenComments,
  children,
}: Props) {
  const targetId = toTargetId({ type: 'section', screenId, sectionIndex })
  const sectionLabel = `Secao ${sectionIndex + 1}`

  const unresolvedCount = comments.filter(
    (c) => c.target_id === targetId && !c.resolved
  ).length

  return (
    <div className="group relative">
      {children}
      <CommentBadge count={unresolvedCount} />
      <CommentIcon onClick={() => onOpenComments(targetId, sectionLabel)} />
    </div>
  )
}
