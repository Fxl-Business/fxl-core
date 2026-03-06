import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { buildSearchIndex, type SearchEntry } from '@/lib/search-index'

export default function SearchCommand() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const index = useMemo(() => buildSearchIndex(), [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const grouped = useMemo(() => {
    const groups: Record<string, SearchEntry[]> = {}
    for (const entry of index) {
      const key = entry.badge || 'Outros'
      if (!groups[key]) groups[key] = []
      groups[key].push(entry)
    }
    return groups
  }, [index])

  function handleSelect(href: string) {
    setOpen(false)
    navigate(href)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors w-48 justify-between"
      >
        <span className="flex items-center gap-1.5">
          <FileText className="h-3 w-3" />
          Pesquisar docs...
        </span>
        <kbd className="rounded bg-background border px-1 py-0.5 text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Pesquisar documentacao..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          {Object.entries(grouped).map(([group, entries]) => (
            <CommandGroup key={group} heading={group}>
              {entries.map((entry) => (
                <CommandItem
                  key={entry.href}
                  value={`${entry.title} ${entry.description || ''}`}
                  onSelect={() => handleSelect(entry.href)}
                >
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm">{entry.title}</span>
                    {entry.description && (
                      <span className="text-xs text-muted-foreground">{entry.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
