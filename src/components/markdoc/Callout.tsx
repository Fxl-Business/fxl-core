import type { ReactNode } from 'react'

type Props = {
  type?: 'info' | 'warning'
  children: ReactNode
}

export default function Callout({ type = 'info', children }: Props) {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
  }

  return (
    <div className={`my-4 rounded-lg border p-4 text-sm ${styles[type]}`}>
      {children}
    </div>
  )
}
