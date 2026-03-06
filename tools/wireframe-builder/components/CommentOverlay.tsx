import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'

type Comment = {
  id: string
  author: string
  text: string
  timestamp: string
  resolved?: boolean
}

type Props = {
  screenName: string
  comments?: Comment[]
}

export default function CommentOverlay({ screenName: _screenName, comments: initialComments = [] }: Props) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [draft, setDraft] = useState('')

  const activeCount = comments.filter((c) => !c.resolved).length

  function handleAdd() {
    if (!draft.trim()) return
    setComments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        author: 'FXL',
        text: draft.trim(),
        timestamp: new Date().toLocaleDateString('pt-BR'),
      },
    ])
    setDraft('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-fxl-navy shadow-lg transition-transform hover:scale-105"
      >
        <MessageSquare className="h-5 w-5 text-white" />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <p className="text-sm font-semibold text-gray-700">Comentários</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhum comentário ainda.</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`rounded-lg border p-3 ${comment.resolved ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">{comment.author}</span>
                    <span className="text-[10px] text-gray-400">{comment.timestamp}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 p-4">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Adicionar comentário..."
              rows={3}
              className="w-full resize-none rounded-md border border-gray-200 p-2.5 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="mt-2 w-full rounded-md bg-fxl-navy px-3 py-2 text-xs font-medium text-white hover:bg-fxl-navy-light"
            >
              Comentar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
