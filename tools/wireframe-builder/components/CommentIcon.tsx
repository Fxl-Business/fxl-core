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
      className="absolute bottom-2 right-2 z-10 flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 shadow-sm opacity-60 transition-opacity group-hover:opacity-100 hover:bg-gray-50"
      aria-label="Abrir comentarios"
    >
      <MessageSquare className="h-4 w-4 text-gray-500" />
    </button>
  )
}
