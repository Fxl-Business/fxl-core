import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useKBSearch } from '../hooks/useKBSearch'
import { KBEntryCard } from '../components/KBEntryCard'

// ---------------------------------------------------------------------------
// KBSearchPage — /knowledge-base/search
// ---------------------------------------------------------------------------

export default function KBSearchPage() {
  // ALL hooks before conditional returns (project memory rule)
  const [inputValue, setInputValue] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')

  const { results, loading, error } = useKBSearch(submittedQuery)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSubmittedQuery(inputValue.trim())
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/knowledge-base"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para a lista
        </Link>
      </div>

      {/* Page title */}
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground mb-6">
        Buscar na Base de Conhecimento
      </h1>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Digite um termo para buscar na base de conhecimento"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={inputValue.trim().length < 2}>
          Buscar
        </Button>
      </form>

      {/* No query yet */}
      {!submittedQuery && (
        <p className="text-sm text-slate-500 text-center py-12">
          Digite um termo para buscar na base de conhecimento
        </p>
      )}

      {/* Loading */}
      {submittedQuery && loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {submittedQuery && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/20 dark:text-red-400">
          Erro ao buscar: {error}
        </div>
      )}

      {/* No results */}
      {submittedQuery && !loading && !error && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-slate-500">
            Nenhum resultado encontrado para &ldquo;{submittedQuery}&rdquo;.
          </p>
        </div>
      )}

      {/* Results */}
      {submittedQuery && !loading && !error && results.length > 0 && (
        <>
          <p className="text-sm text-slate-500 mb-4">
            {results.length} resultado{results.length !== 1 ? 's' : ''} para &ldquo;{submittedQuery}&rdquo;
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((entry) => (
              <KBEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
