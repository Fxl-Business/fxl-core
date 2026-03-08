import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
      <pre className="my-4 overflow-x-auto rounded-lg bg-[hsl(var(--code-bg))] p-4 text-[hsl(var(--code-fg))]">
        {children}
      </pre>
    )
  },
  code({ children, className }) {
    const isInline = !className
    if (isInline) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 text-[0.85em] text-primary">
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
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
