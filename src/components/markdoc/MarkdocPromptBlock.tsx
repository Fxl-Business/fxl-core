import { useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'

type Props = {
  label: string
  children: ReactNode
}

export default function MarkdocPromptBlock({ label, children }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = extractText(children)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-4 rounded-lg border border-slate-300 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <div className="px-4 py-3 text-sm text-slate-700">{children}</div>
    </div>
  )
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (!node) return ''
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (typeof node === 'object' && 'props' in node) {
    return extractText((node as { props: { children?: ReactNode } }).props.children)
  }
  return ''
}
