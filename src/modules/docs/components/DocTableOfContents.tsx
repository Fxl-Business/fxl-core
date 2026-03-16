import { useEffect, useState } from 'react'
import { cn } from '@shared/utils'
import type { DocHeading } from '../services/docs-parser'

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
    <aside className="hidden w-56 flex-shrink-0 xl:block">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-900 dark:text-foreground">
          Nesta pagina
        </p>
        <nav className="space-y-1 border-l border-slate-200 dark:border-slate-700">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={cn(
                'block py-1 text-xs transition-colors',
                h.level === 3 ? 'pl-6' : 'pl-4',
                activeId === h.id
                  ? '-ml-px border-l-2 border-indigo-600 font-medium text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
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
