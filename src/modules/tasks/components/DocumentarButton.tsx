import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Button } from '@shared/ui/button'
import type { Task } from '../types'

// ---------------------------------------------------------------------------
// DocumentarButton — cross-module link to KB entry form pre-filled with task title
// Only renders on tasks with status 'done'
// ---------------------------------------------------------------------------

interface DocumentarButtonProps {
  task: Task
}

export function DocumentarButton({ task }: DocumentarButtonProps) {
  const navigate = useNavigate()

  if (task.status !== 'done') return null

  function handleClick() {
    const params = new URLSearchParams({ title: task.title, prefill: 'true' })
    navigate(`/knowledge-base/new?${params.toString()}`)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="w-full text-xs h-7"
    >
      <BookOpen className="h-3.5 w-3.5 mr-1.5" />
      Documentar
    </Button>
  )
}
