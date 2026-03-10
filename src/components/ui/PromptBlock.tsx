import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

type PromptBlockProps = {
  label?: string
  prompt: string
  className?: string
}

export default function PromptBlock({ label, prompt, className }: PromptBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('mb-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700', className)}>
      <div className="flex items-center justify-between border-b border-slate-700/50 bg-indigo-50 px-4 py-2.5 dark:bg-indigo-950/30 dark:border-indigo-800/50">
        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
          {label ?? 'Use este prompt para iniciar a conversa'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-600" />
              <span className="text-green-600">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-b-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-300 dark:text-slate-400">
        {prompt}
      </pre>
    </div>
  )
}
