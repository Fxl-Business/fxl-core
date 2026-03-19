import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@clerk/react'
import { Users, RefreshCw, Link2 } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@shared/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { listUsers, setAdminClerkTokenGetter, addOrgMember } from '@platform/services/admin-service'
import { listTenants, setClerkTokenGetter } from '@platform/services/tenant-service'
import { toast } from 'sonner'
import type { AdminUser } from '@platform/types/admin'
import type { Tenant } from '@platform/types/tenant'

export default function UsersPage() {
  const { session } = useSession()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unaffiliated' | 'affiliated'>('all')

  // Org assignment dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assigningUser, setAssigningUser] = useState<AdminUser | null>(null)
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [tenantsLoading, setTenantsLoading] = useState(false)
  const [assignLoading, setAssignLoading] = useState(false)

  // Register Clerk token getter for both services
  useEffect(() => {
    if (session) {
      setAdminClerkTokenGetter(() => session.getToken({ template: 'supabase' }))
      setClerkTokenGetter(() => session.getToken({ template: 'supabase' }))
    }
  }, [session])

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      const result = await listUsers()
      setUsers(result.users ?? [])
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

  // Computed filtered lists
  const unaffiliatedUsers = users.filter(u => u.organizationMemberships.length === 0)
  const affiliatedUsers = users.filter(u => u.organizationMemberships.length > 0)
  const filteredUsers = filter === 'all' ? users : filter === 'unaffiliated' ? unaffiliatedUsers : affiliatedUsers
  const counts = { all: users.length, unaffiliated: unaffiliatedUsers.length, affiliated: affiliatedUsers.length }

  // Org assignment functions
  async function fetchTenants() {
    setTenantsLoading(true)
    try {
      const result = await listTenants()
      setTenants(result.tenants ?? [])
    } catch (err) {
      console.error('Failed to fetch tenants:', err)
      setTenants([])
    } finally {
      setTenantsLoading(false)
    }
  }

  function openAssignDialog(user: AdminUser) {
    setAssigningUser(user)
    setSelectedOrgId('')
    setAssignDialogOpen(true)
    fetchTenants()
  }

  async function handleAssign() {
    if (!assigningUser || !selectedOrgId) return
    setAssignLoading(true)
    try {
      await addOrgMember(selectedOrgId, assigningUser.id)
      toast.success('Usuario vinculado com sucesso')
      setAssignDialogOpen(false)
      setAssigningUser(null)
      setSelectedOrgId('')
      await fetchUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao vincular usuario')
    } finally {
      setAssignLoading(false)
    }
  }

  const filterOptions: { key: 'all' | 'unaffiliated' | 'affiliated'; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'unaffiliated', label: 'Sem org' },
    { key: 'affiliated', label: 'Com org' },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">Usuarios</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Todos os usuarios registrados na plataforma Nexo
        </p>
      </div>

      {/* Segmented filter */}
      {!loading && !error && (
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 gap-0.5 dark:border-slate-700">
          {filterOptions.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFilter(opt.key)}
              className={[
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                filter === opt.key
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-card dark:text-slate-400 dark:hover:bg-slate-800',
              ].join(' ')}
            >
              {opt.label} ({counts[opt.key]})
            </button>
          ))}
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
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-700">
          <Users className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filter === 'all' ? 'Nenhum usuario encontrado' : filter === 'unaffiliated' ? 'Nenhum usuario sem organizacao' : 'Nenhum usuario com organizacao'}
          </p>
        </div>
      )}

      {/* User list */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card">
          {filteredUsers.map((user, idx) => {
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

                {/* Vincular button for unaffiliated users */}
                {user.organizationMemberships.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5 text-xs"
                    onClick={() => openAssignDialog(user)}
                  >
                    <Link2 className="h-3 w-3" />
                    Vincular
                  </Button>
                )}

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

      {/* Org Assignment Dialog */}
      <Dialog
        open={assignDialogOpen}
        onOpenChange={(open) => {
          setAssignDialogOpen(open)
          if (!open) {
            setSelectedOrgId('')
            setAssigningUser(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular usuario a organizacao</DialogTitle>
            <DialogDescription>
              {assigningUser
                ? `${[assigningUser.firstName, assigningUser.lastName].filter(Boolean).join(' ') || 'Sem nome'} (${assigningUser.email})`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Organizacao
            </label>
            {tenantsLoading ? (
              <div className="h-10 w-full animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
            ) : (
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar organizacao..." />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={!selectedOrgId || assignLoading}
              onClick={() => void handleAssign()}
              className="gap-1.5"
            >
              <Link2 className="h-3.5 w-3.5" />
              {assignLoading ? 'Vinculando...' : 'Vincular'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
