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
    bg: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800',
    text: 'text-indigo-800 dark:text-indigo-200',
    iconColor: 'text-indigo-500 dark:text-indigo-400',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-200',
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    iconColor: 'text-green-500 dark:text-green-400',
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
