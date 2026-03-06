import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { DocHeading } from '@/lib/docs-parser'

type Props = {
  headings: DocHeading[]
}

export default function DocTableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    )

    for (const el of elements) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  return (
    <aside className="hidden w-52 flex-shrink-0 xl:block">
      <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Nesta pagina
        </p>
        <nav className="space-y-1">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={cn(
                'block text-xs transition-colors hover:text-foreground',
                h.level === 3 && 'pl-3',
                activeId === h.id
                  ? 'font-medium text-fxl-navy'
                  : 'text-muted-foreground',
              )}
            >
              {h.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}
