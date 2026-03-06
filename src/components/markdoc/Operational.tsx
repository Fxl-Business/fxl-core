import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

type Props = {
  children: ReactNode
}

export default function Operational({ children }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="my-4 rounded-lg border border-slate-200 bg-slate-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Instrucoes operacionais
      </button>
      {open && (
        <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
          {children}
        </div>
      )}
    </div>
  )
}
