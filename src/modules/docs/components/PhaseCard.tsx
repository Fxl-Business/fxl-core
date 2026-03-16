import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@shared/utils'

type PhaseCardProps = {
  number: number
  title: string
  description: string
  href: string
  prazo?: string
  className?: string
}

export default function PhaseCard({
  number,
  title,
  description,
  href,
  prazo,
  className,
}: PhaseCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        'group flex items-start gap-4 rounded-lg border border-border bg-card/80 p-4 transition-all hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm',
        className,
      )}
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {number}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {prazo && <span className="text-xs italic text-muted-foreground">{prazo}</span>}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
    </Link>
  )
}
