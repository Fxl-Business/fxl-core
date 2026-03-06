import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type InfoBlockProps = {
  type?: 'info' | 'warning' | 'success'
  children: ReactNode
  className?: string
}

const config = {
  info: {
    icon: Info,
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    iconColor: 'text-green-500',
  },
}

export default function InfoBlock({ type = 'info', children, className }: InfoBlockProps) {
  const { icon: Icon, bg, text, iconColor } = config[type]

  return (
    <div className={cn('flex gap-3 rounded-lg border p-4 text-sm', bg, className)}>
      <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', iconColor)} />
      <div className={cn(text)}>{children}</div>
    </div>
  )
}
