import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, FileText, Search } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { buildSearchIndex, type SearchEntry } from '@/lib/search-index'
import { listKnowledgeEntries, type KnowledgeEntry } from '@/lib/kb-service'

export default function SearchCommand() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState<SearchEntry[]>([])
  const [indexLoaded, setIndexLoaded] = useState(false)
  const [kbEntries, setKbEntries] = useState<KnowledgeEntry[]>([])
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const openRef = useRef(open)

  openRef.current = open

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next === true) {
      if (!indexLoaded) {
        buildSearchIndex().then((entries) => {
          setIndex(entries)
          setIndexLoaded(true)
        }).catch(() => {})
      }
      if (kbEntries.length === 0) {
        listKnowledgeEntries({}).then(setKbEntries).catch(() => {})
      }
    }
    if (next === false) {
      setQuery('')
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        handleOpenChange(!openRef.current)
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
        onClick={() => handleOpenChange(true)}
        className="relative flex w-full max-w-sm items-center rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-10 pr-12 text-sm text-slate-400 transition-colors hover:bg-slate-100 dark:border-border dark:bg-muted/50 dark:text-muted-foreground"
      >
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400 dark:text-muted-foreground" />
        <span>Pesquisar docs...</span>
        <kbd className="absolute right-2 hidden rounded border border-slate-300 bg-white px-1.5 font-sans text-[10px] font-medium text-slate-400 sm:inline-block dark:border-border dark:bg-muted dark:text-muted-foreground">
          Cmd+K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput
          placeholder="Pesquisar documentacao e conhecimento..."
          value={query}
          onValueChange={setQuery}
        />
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
          {query.length > 0 && kbEntries.length > 0 && (
            <CommandGroup heading="Base de Conhecimento">
              {kbEntries.map((entry) => (
                <CommandItem
                  key={entry.id}
                  value={`${entry.title} ${entry.entry_type} ${entry.tags.join(' ')}`}
                  onSelect={() => handleSelect(`/knowledge-base/${entry.id}`)}
                >
                  <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm">{entry.title}</span>
                    <span className="text-xs text-muted-foreground">{entry.entry_type}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
