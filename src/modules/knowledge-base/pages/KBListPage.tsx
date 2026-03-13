import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useKBEntries } from '../hooks/useKBEntries'
import { KBEntryCard } from '../components/KBEntryCard'
import { KBTypeFilter } from '../components/KBTypeFilter'
import type { KBEntryType } from '../types/kb'

// ---------------------------------------------------------------------------
// KBListPage — /knowledge-base
// ---------------------------------------------------------------------------

export default function KBListPage() {
  // ALL hooks before conditional returns (project memory rule)
  const [selectedType, setSelectedType] = useState<KBEntryType | undefined>(undefined)
  const [selectedClient, setSelectedClient] = useState<string | undefined>(undefined)
  const [tagInput, setTagInput] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])

  const { entries, loading, error } = useKBEntries({
    entry_type: selectedType,
    client_slug: selectedClient,
    tags: activeTags.length > 0 ? activeTags : undefined,
  })

  // Derive unique client slugs from entries for the client filter
  const clientSlugs = useMemo(() => {
    const slugs = entries
      .map((e) => e.client_slug)
      .filter((s): s is string => s !== null && s !== '')
    return Array.from(new Set(slugs)).sort()
  }, [entries])

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const tag = tagInput.trim()
      if (tag && !activeTags.includes(tag)) {
        setActiveTags((prev) => [...prev, tag])
      }
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    setActiveTags((prev) => prev.filter((t) => t !== tag))
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
          Base de Conhecimento
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/knowledge-base/search">
              <Search className="h-4 w-4 mr-1.5" />
              Buscar
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/knowledge-base/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Nova entrada
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Type filter pills */}
        <KBTypeFilter value={selectedType} onChange={setSelectedType} />

        {/* Client + Tags filters */}
        <div className="flex flex-wrap gap-3 items-start">
          {/* Client slug filter */}
          <Select
            value={selectedClient ?? '__all__'}
            onValueChange={(val) =>
              setSelectedClient(val === '__all__' ? undefined : val)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos os clientes</SelectItem>
              {clientSlugs.map((slug) => (
                <SelectItem key={slug} value={slug}>
                  {slug}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Tags filter */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <Input
              placeholder="Filtrar por tag (Enter para adicionar)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="max-w-xs"
            />
            {activeTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {activeTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                  >
                    {tag}
                    <span aria-hidden="true">&times;</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/20 dark:text-red-400">
          Erro ao carregar entradas: {error}
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-slate-500">Nenhuma entrada encontrada.</p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link to="/knowledge-base/new">Criar primeira entrada</Link>
          </Button>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <KBEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
