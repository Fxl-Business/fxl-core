import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Components } from 'react-markdown'
import { cn } from '@/lib/utils'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

function childrenToString(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(childrenToString).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    return childrenToString((children as { props: { children: ReactNode } }).props.children)
  }
  return ''
}

const components: Components = {
  h2({ children }) {
    const id = slugify(childrenToString(children))
    return <h2 id={id}>{children}</h2>
  },
  h3({ children }) {
    const id = slugify(childrenToString(children))
    return <h3 id={id}>{children}</h3>
  },
  pre({ children }) {
    return (
      <div className="group relative my-6 overflow-hidden rounded-xl bg-slate-900 shadow-lg dark:bg-[hsl(var(--code-bg))] [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-sm [&_code]:font-normal [&_code]:text-slate-200 [&_code]:rounded-none">
        <div className="flex items-center gap-1.5 border-b border-slate-700/50 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          {children}
        </pre>
      </div>
    )
  },
  code({ children, className }) {
    const isInline = !className
    if (isInline) {
      return (
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.85em] font-medium text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
          {children}
        </code>
      )
    }
    return (
      <code className={cn(className, 'bg-transparent text-sm leading-[1.7] text-[hsl(var(--code-fg))]')}>
        {children}
      </code>
    )
  },
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
