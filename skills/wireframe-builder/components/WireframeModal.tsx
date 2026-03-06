import { useEffect } from 'react'
import { X } from 'lucide-react'

type Props = {
  title: string
  open: boolean
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'md' | 'lg' | 'xl'
}

const SIZES = { md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl' }

export default function WireframeModal({ title, open, onClose, children, footer, size = 'lg' }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`relative w-full ${SIZES[size]} max-h-[88vh] flex flex-col rounded-xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">{children}</div>
        {footer && (
          <div className="flex-shrink-0 flex flex-wrap items-center gap-4 border-t border-gray-200 bg-gray-50 px-6 py-3 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
