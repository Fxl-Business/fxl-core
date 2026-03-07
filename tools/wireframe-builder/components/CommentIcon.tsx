import { MessageSquare } from 'lucide-react'

type Props = {
  onClick: () => void
}

export default function CommentIcon({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="absolute top-2 right-2 z-10 flex items-center justify-center rounded-full border border-gray-200 bg-white p-1.5 shadow-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-50"
      aria-label="Abrir comentarios"
    >
      <MessageSquare className="h-3.5 w-3.5 text-gray-500" />
    </button>
  )
}
