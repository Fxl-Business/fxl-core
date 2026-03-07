import { useCallback, useEffect, useState } from 'react'
import { MessageSquare, X, Send } from 'lucide-react'
import { addComment, getCommentsByScreen } from '../lib/comments'
import type { Comment } from '../types/comments'

type Props = {
  clientSlug: string
  screenId: string
  targetId: string
  targetLabel?: string
  authorName: string
  authorRole: 'operador' | 'cliente'
  open: boolean
  onClose: () => void
}

export default function CommentOverlay({
  clientSlug,
  screenId,
  targetId,
  targetLabel,
  authorName,
  authorRole,
  open,
  onClose,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = useCallback(async () => {
    try {
      const all = await getCommentsByScreen(clientSlug, screenId)
      setComments(all.filter((c) => c.target_id === targetId))
    } catch {
      // Silently fail on fetch -- comments will show empty list
    }
  }, [clientSlug, screenId, targetId])

  useEffect(() => {
    if (open && targetId) {
      fetchComments()
    }
  }, [open, targetId, fetchComments])

  async function handleAdd() {
    const text = draft.trim()
    if (!text || submitting) return

    setSubmitting(true)
    try {
      await addComment({ clientSlug, targetId, authorName, authorRole, text })
      setDraft('')
      await fetchComments()
    } catch {
      // Silently fail on submit -- user can retry
    } finally {
      setSubmitting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAdd()
    }
  }

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-500" />
          <p className="truncate text-sm font-semibold text-gray-700">
            {targetLabel ?? 'Comentarios'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400">Nenhum comentario ainda.</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-lg border p-3 ${
                comment.resolved
                  ? 'border-gray-100 bg-gray-50 opacity-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="truncate text-xs font-medium text-gray-700">
                    {comment.author_name}
                  </span>
                  <span
                    className={`inline-flex flex-shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                      comment.author_role === 'operador'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {comment.author_role === 'operador' ? 'Operador' : 'Cliente'}
                  </span>
                </div>
                <span className="flex-shrink-0 text-[10px] text-gray-400">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">{comment.text}</p>
              {comment.resolved && (
                <span className="mt-1 inline-block text-[10px] font-medium text-green-600">
                  Resolvido
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Adicionar comentario..."
          rows={3}
          className="w-full resize-none rounded-md border border-gray-200 p-2.5 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!draft.trim() || submitting}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-fxl-navy px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-fxl-navy-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-3 w-3" />
          {submitting ? 'Enviando...' : 'Comentar'}
        </button>
      </div>
    </div>
  )
}
