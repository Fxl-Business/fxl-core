import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { supabase } from '@platform/supabase'

interface ClientRow {
  id: string
  slug: string
  name: string
  description: string | null
  created_at: string
}

export default function ClientsListPage() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.resolve(
      supabase
        .from('clients')
        .select('id, slug, name, description, created_at')
        .order('name', { ascending: true })
    )
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message)
        } else {
          setClients((data ?? []) as ClientRow[])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-4xl">
      <span className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-400 dark:ring-indigo-400/30">
        Clientes
      </span>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
        Clientes
      </h1>
      <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
        Cadastro de clientes da organizacao.
      </p>

      <div className="mt-8">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}

        {error && !loading && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && clients.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum cliente cadastrado.
          </p>
        )}

        {!loading && !error && clients.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
                  <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">Nome</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">Slug</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">Descricao</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-foreground">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{c.slug}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.description ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
