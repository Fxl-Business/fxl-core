import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useOrganizationList } from '@clerk/react'
import { Loader2 } from 'lucide-react'
import { isOrgMode } from '@platform/auth/auth-config'
import { useActiveOrg } from '@platform/tenants/useActiveOrg'

export default function CriarEmpresa() {
  const navigate = useNavigate()
  const { createOrganization, setActive, isLoaded } = useOrganizationList()
  const { orgs } = useActiveOrg()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Not applicable outside org mode
  if (!isOrgMode()) {
    return <Navigate to="/" replace />
  }

  // Already has an org — skip onboarding
  if (orgs.length > 0) {
    return <Navigate to="/" replace />
  }

  // Clerk SDK not yet loaded
  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <p style={{ fontSize: 14, color: '#757575' }}>Carregando...</p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!createOrganization || !setActive) return

    setSubmitting(true)
    setError(null)

    try {
      const org = await createOrganization({
        name: name.trim(),
        slug: slug.trim() || undefined,
      })
      await setActive({ organization: org.id })
      navigate('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar empresa. Tente novamente.'
      setError(message)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 dark:bg-background">
      {/* Nexo logo block */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">Nexo</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Plataforma operacional interna</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 w-full max-w-md shadow-sm dark:bg-card dark:border-border">
        <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">Criar sua empresa</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure sua organização para acessar o Nexo
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Company name */}
          <div>
            <label
              htmlFor="org-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Nome da empresa
            </label>
            <input
              id="org-name"
              type="text"
              required
              minLength={2}
              placeholder="Ex: Acme Ltda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-foreground dark:placeholder-slate-500 dark:focus:border-indigo-600 dark:focus:ring-indigo-900/40"
            />
          </div>

          {/* Optional slug */}
          <div>
            <label
              htmlFor="org-slug"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Identificador (slug)
            </label>
            <input
              id="org-slug"
              type="text"
              placeholder="acme-ltda"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-foreground dark:placeholder-slate-500 dark:focus:border-indigo-600 dark:focus:ring-indigo-900/40"
            />
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Gerado automaticamente se vazio
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || name.trim().length < 2}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-card"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar empresa
          </button>
        </form>
      </div>
    </div>
  )
}
