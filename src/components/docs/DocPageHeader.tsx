import { FileCode } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

type Props = {
  badge?: string
  title: string
  description?: string
  rawContent: string
}

export default function DocPageHeader({ badge, title, description, rawContent }: Props) {
  function openRawInNewTab() {
    const blob = new Blob([rawContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  return (
    <div className="mb-0">
      {badge && (
        <Badge variant="secondary" className="mb-3 text-[10px] uppercase tracking-widest">
          {badge}
        </Badge>
      )}
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}

      <Separator className="my-4" />

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={openRawInNewTab}>
          <FileCode className="mr-1.5 h-3.5 w-3.5" />
          Exibir Markdown
        </Button>
      </div>
    </div>
  )
}
