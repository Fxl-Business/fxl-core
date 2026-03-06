import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  type?: 'info' | 'warning'
  content: string
}

const styles = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
}

export default function Callout({ type = 'info', content }: Props) {
  return (
    <div className={`my-4 rounded-lg border p-4 text-sm ${styles[type]}`}>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
