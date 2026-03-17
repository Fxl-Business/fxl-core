import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@clerk/react'
import { Users, RefreshCw } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { listUsers, setAdminClerkTokenGetter } from '@platform/services/admin-service'
import type { AdminUser } from '@platform/types/admin'

export default function UsersPage() {
  const { session } = useSession()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Register Clerk token getter for the service
  useEffect(() => {
    if (session) {
      setAdminClerkTokenGetter(() => session.getToken({ template: 'supabase' }))
    }
  }, [session])

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      const result = await listUsers()
      setUsers(result.users)
      setTotalCount(result.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">Usuarios</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Todos os usuarios registrados na plataforma Nexo
        </p>
      </div>

      {/* Stats bar */}
      {!loading && !error && (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
            {totalCount} {totalCount === 1 ? 'usuario' : 'usuarios'}
          </span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-16 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-2"
            onClick={fetchUsers}
          >
            <RefreshCw className="h-3 w-3" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && users.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-700">
          <Users className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum usuario encontrado</p>
        </div>
      )}

      {/* User list */}
      {!loading && !error && users.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card">
          {users.map((user, idx) => {
            const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Sem nome'
            return (
              <div
                key={user.id}
                className={[
                  'flex w-full items-center gap-4 px-5 py-4',
                  idx !== 0 ? 'border-t border-slate-100 dark:border-slate-700/50' : '',
                ].join(' ')}
              >
                {/* Avatar */}
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={fullName}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Users className="h-4 w-4" />
                  </div>
                )}

                {/* Name + Email */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-foreground">
                    {fullName}
                  </p>
                  <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                    {user.email}
                  </p>
                </div>

                {/* Org badges */}
                <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                  {user.organizationMemberships.length === 0 && (
                    <span className="rounded-full bg-slate-50 px-2 py-0.5 text-xs text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      Sem org
                    </span>
                  )}
                  {user.organizationMemberships.map((mem) => (
                    <Link
                      key={mem.orgId}
                      to={`/admin/tenants/${mem.orgId}`}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400"
                    >
                      {mem.orgName || mem.orgId}
                    </Link>
                  ))}
                </div>

                {/* Last sign-in date */}
                <span className="hidden shrink-0 text-sm text-slate-400 dark:text-slate-500 md:block">
                  {user.lastSignInAt
                    ? new Date(user.lastSignInAt).toLocaleDateString('pt-BR')
                    : 'Nunca'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
