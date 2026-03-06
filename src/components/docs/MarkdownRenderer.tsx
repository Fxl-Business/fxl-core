import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

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
      <pre
        style={{
          background: '#0f172a',
          borderRadius: '8px',
          padding: '1rem',
          overflowX: 'auto',
          margin: '1rem 0',
        }}
      >
        {children}
      </pre>
    )
  },
  code({ children, className }) {
    const isInline = !className
    if (isInline) {
      return (
        <code
          style={{
            background: '#1e293b',
            color: '#e2e8f0',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '0.85em',
          }}
        >
          {children}
        </code>
      )
    }
    return (
      <code
        className={className}
        style={{
          color: '#e2e8f0',
          background: 'transparent',
          fontSize: '0.875rem',
          lineHeight: '1.7',
        }}
      >
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
