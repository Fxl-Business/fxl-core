import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSession } from '@clerk/react'
import { ArrowLeft, Building2, Users, Calendar, Shield, Trash2, Eye, UserPlus, ChevronsUpDown, Check, Archive } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@shared/ui/command'
import { getTenantDetail, archiveTenant, setClerkTokenGetter } from '@platform/services/tenant-service'
import { listOrgMembers, addOrgMember, removeOrgMember, listUsers, setAdminClerkTokenGetter } from '@platform/services/admin-service'
import { useImpersonation } from '@platform/auth/ImpersonationContext'
import { toast } from 'sonner'
import type { TenantDetail } from '@platform/types/tenant'
import type { OrgMember, AdminUser } from '@platform/types/admin'
import TenantModulesSection from './TenantModulesSection'

// ---------------------------------------------------------------------------
// Info card component
// ---------------------------------------------------------------------------

function InfoCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-card">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function TenantDetailPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const navigate = useNavigate()
  const { session } = useSession()

  const [tenant, setTenant] = useState<TenantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<OrgMember[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [membersError, setMembersError] = useState<string | null>(null)

  // Add member state (combobox)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [unaffiliatedUsers, setUnaffiliatedUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Remove confirmation state: maps userId → boolean (true = confirm pending)
  const [confirmRemoveMap, setConfirmRemoveMap] = useState<Map<string, boolean>>(new Map())
  const [removeLoadingMap, setRemoveLoadingMap] = useState<Map<string, boolean>>(new Map())

  // Impersonation
  const { enterImpersonation, isImpersonating, impersonatedOrgId } = useImpersonation()
  const [impersonateLoading, setImpersonateLoading] = useState(false)

  // Archive state
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [archiveError, setArchiveError] = useState<string | null>(null)

  // Register Clerk token getters for both services
  useEffect(() => {
    if (session) {
      setClerkTokenGetter(() => session.getToken({ template: 'supabase' }))
      setAdminClerkTokenGetter(() => session.getToken({ template: 'supabase' }))
    }
  }, [session])

  useEffect(() => {
    if (!orgId) {
      navigate('/admin/tenants', { replace: true })
      return
    }
    if (!session) return

    let cancelled = false

    async function fetchDetail() {
      setLoading(true)
      setError(null)
      try {
        const data = await getTenantDetail(orgId!)
        if (!cancelled) setTenant(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar tenant')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDetail()
    return () => { cancelled = true }
  }, [orgId, session, navigate])

  // Standalone loadMembers — called both from useEffect and after mutations
  async function loadMembers(cancelled?: { value: boolean }) {
    if (!orgId || !session) return
    setMembersLoading(true)
    setMembersError(null)
    try {
      const data = await listOrgMembers(orgId)
      if (!cancelled?.value) setMembers(data.members ?? [])
    } catch (err) {
      console.error('Failed to fetch org members:', err)
      if (!cancelled?.value) {
        setMembers([])
        setMembersError(err instanceof Error ? err.message : 'Erro ao carregar membros')
      }
    } finally {
      if (!cancelled?.value) setMembersLoading(false)
    }
  }

  // Fetch org members on mount
  useEffect(() => {
    if (!orgId || !session) {
      setMembersLoading(false)
      return
    }
    const state = { value: false }
    void loadMembers(state)
    return () => { state.value = true }
  }, [orgId, session]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Unaffiliated users for combobox
  // ---------------------------------------------------------------------------

  async function fetchUnaffiliatedUsers() {
    setUsersLoading(true)
    try {
      const result = await listUsers()
      setUnaffiliatedUsers(
        (result.users ?? []).filter(u => u.organizationMemberships.length === 0)
      )
    } catch (err) {
      console.error('Failed to fetch unaffiliated users:', err)
      setUnaffiliatedUsers([])
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchUnaffiliatedUsers()
    }
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Member management handlers
  // ---------------------------------------------------------------------------

  async function handleAddMember() {
    if (!selectedUser || !orgId) return
    setAddLoading(true)
    setAddError(null)
    try {
      await addOrgMember(orgId, selectedUser.id)
      const userName = [selectedUser.firstName, selectedUser.lastName].filter(Boolean).join(' ') || selectedUser.email
      toast.success(`${userName} adicionado com sucesso`)
      setSelectedUser(null)
      await Promise.allSettled([loadMembers(), fetchUnaffiliatedUsers()])
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Erro ao adicionar membro')
    } finally {
      setAddLoading(false)
    }
  }

  function handleRemoveClick(userId: string) {
    setConfirmRemoveMap(prev => {
      const next = new Map(prev)
      next.set(userId, true)
      return next
    })
  }

  function handleRemoveCancel(userId: string) {
    setConfirmRemoveMap(prev => {
      const next = new Map(prev)
      next.delete(userId)
      return next
    })
  }

  async function handleRemoveConfirm(userId: string) {
    if (!orgId) return
    setRemoveLoadingMap(prev => new Map(prev).set(userId, true))
    try {
      await removeOrgMember(orgId, userId)
      setConfirmRemoveMap(prev => { const n = new Map(prev); n.delete(userId); return n })
      await loadMembers()
    } catch (err) {
      console.error('Failed to remove member:', err)
      setConfirmRemoveMap(prev => { const n = new Map(prev); n.delete(userId); return n })
    } finally {
      setRemoveLoadingMap(prev => { const n = new Map(prev); n.delete(userId); return n })
    }
  }

  async function handleEnterImpersonation() {
    if (!orgId || !tenant) return
    setImpersonateLoading(true)
    try {
      await enterImpersonation(orgId, tenant.name)
      navigate('/')
    } catch (err) {
      console.error('Impersonation failed:', err)
    } finally {
      setImpersonateLoading(false)
    }
  }

  async function handleArchive() {
    if (!orgId) return
    setArchiveLoading(true)
    setArchiveError(null)
    try {
      await archiveTenant(orgId)
      navigate('/admin/tenants')
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : 'Erro ao arquivar tenant')
    } finally {
      setArchiveLoading(false)
    }
  }

  // ----- Loading state -----
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-16 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  // ----- Error state -----
  if (error) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => navigate('/admin/tenants')}
          >
            Voltar para Tenants
          </Button>
        </div>
      </div>
    )
  }

  if (!tenant) return null

  const publicMetadataEmpty =
    !tenant.publicMetadata || Object.keys(tenant.publicMetadata).length === 0

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Back link */}
      <Link
        to="/admin/tenants"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar para Tenants
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {tenant.imageUrl ? (
            <img
              src={tenant.imageUrl}
              alt={tenant.name}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Building2 className="h-8 w-8" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">{tenant.name}</h1>
            {tenant.slug && (
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">/{tenant.slug}</p>
            )}
            <p className="mt-1 font-mono text-xs text-slate-400 dark:text-slate-500">{tenant.id}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Impersonation button — only show when not already impersonating this org */}
          {!(isImpersonating && impersonatedOrgId === orgId) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnterImpersonation}
              disabled={impersonateLoading}
              className="shrink-0 gap-1.5 border-indigo-200 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
            >
              <Eye className="h-3.5 w-3.5" />
              {impersonateLoading ? 'Entrando...' : 'Entrar como esta org'}
            </Button>
          )}

          {/* Archive button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setArchiveConfirmOpen(true)}
            className="shrink-0 gap-1.5 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Archive className="h-3.5 w-3.5" />
            Arquivar
          </Button>
        </div>
      </div>

      {/* Info cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoCard
          label="Membros"
          value={!membersLoading && members.length > 0 ? members.length : tenant.membersCount}
          icon={Users}
        />
        <InfoCard
          label="Criado em"
          value={new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
          icon={Calendar}
        />
        <InfoCard
          label="Max membros"
          value={tenant.maxAllowedMemberships ?? 'Ilimitado'}
          icon={Shield}
        />
      </div>

      {/* Members section */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
          Membros
        </h2>

        {/* Add Member combobox */}
        <div className="flex items-start gap-2">
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={comboboxOpen}
                className="flex-1 justify-between text-sm font-normal"
              >
                {selectedUser ? (
                  <div className="flex items-center gap-2 truncate">
                    {selectedUser.imageUrl ? (
                      <img src={selectedUser.imageUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                        <Users className="h-3 w-3" />
                      </div>
                    )}
                    <span className="truncate">
                      {[selectedUser.firstName, selectedUser.lastName].filter(Boolean).join(' ') || 'Sem nome'}
                    </span>
                    <span className="truncate text-xs text-slate-400">{selectedUser.email}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">
                    {usersLoading ? 'Carregando usuarios...' : 'Buscar usuario sem org...'}
                  </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar por nome ou email..." />
                <CommandList>
                  <CommandEmpty>Nenhum usuario sem org encontrado</CommandEmpty>
                  <CommandGroup>
                    {unaffiliatedUsers.map(user => {
                      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Sem nome'
                      return (
                        <CommandItem
                          key={user.id}
                          value={`${fullName} ${user.email}`}
                          onSelect={() => {
                            setSelectedUser(user)
                            setComboboxOpen(false)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {user.imageUrl ? (
                              <img src={user.imageUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                <Users className="h-3 w-3" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm">{fullName}</p>
                              <p className="truncate text-xs text-slate-400">{user.email}</p>
                            </div>
                            {selectedUser?.id === user.id && <Check className="h-4 w-4 text-indigo-600" />}
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            size="sm"
            disabled={addLoading || !selectedUser}
            className="shrink-0 gap-1.5"
            onClick={() => void handleAddMember()}
          >
            <UserPlus className="h-3.5 w-3.5" />
            {addLoading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
        {addError && (
          <p className="text-xs text-red-600 dark:text-red-400">{addError}</p>
        )}

        {membersLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        )}
        {!membersLoading && membersError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
            <p className="text-sm text-red-700 dark:text-red-400">{membersError}</p>
          </div>
        )}
        {!membersLoading && !membersError && members.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
            <Users className="mx-auto mb-2 h-6 w-6 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum membro encontrado</p>
          </div>
        )}
        {!membersLoading && members.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card">
            {members.map((member, idx) => {
              const fullName = [member.firstName, member.lastName].filter(Boolean).join(' ') || 'Sem nome'
              const isAdmin = member.role === 'admin' || member.role === 'org:admin'
              const isConfirming = confirmRemoveMap.get(member.userId) === true
              const isRemovingThis = removeLoadingMap.get(member.userId) === true
              return (
                <div
                  key={member.userId}
                  className={[
                    'group flex items-center gap-3 px-4 py-3',
                    idx !== 0 ? 'border-t border-slate-100 dark:border-slate-700/50' : '',
                  ].join(' ')}
                >
                  {/* Avatar */}
                  {member.imageUrl ? (
                    <img
                      src={member.imageUrl}
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
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-foreground">
                      {fullName}
                    </p>
                    <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                      {member.email}
                    </p>
                  </div>

                  {/* Role badge */}
                  <span
                    className={[
                      'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                      isAdmin
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                    ].join(' ')}
                  >
                    {isAdmin ? 'Admin' : 'Membro'}
                  </span>

                  {/* Remove button (2-click inline confirm) */}
                  <div className="ml-1 flex shrink-0 items-center gap-1">
                    {isConfirming ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleRemoveConfirm(member.userId)}
                          disabled={isRemovingThis}
                          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          {isRemovingThis ? '...' : 'Confirmar?'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCancel(member.userId)}
                          className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          aria-label="Cancelar remoção"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveClick(member.userId)}
                        className="rounded p-1 text-slate-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 dark:hover:text-red-400"
                        aria-label={`Remover ${fullName}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Public metadata */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
          Metadados
        </h2>
        {publicMetadataEmpty ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum metadado publico</p>
        ) : (
          <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm font-mono text-slate-700 dark:text-slate-300">
            {JSON.stringify(tenant.publicMetadata, null, 2)}
          </pre>
        )}
      </div>

      {/* Modules section */}
      <TenantModulesSection orgId={orgId!} />

      {/* Connectors section (placeholder) */}
      <div className="rounded-xl border border-dashed border-slate-200 p-6 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-foreground">
              Conectores
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Conectores do tenant serao exibidos aqui
            </p>
          </div>
        </div>
      </div>

      {/* Archive confirmation dialog */}
      {archiveConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-card">
            <h3 className="text-lg font-bold text-slate-900 dark:text-foreground">
              Arquivar tenant
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Tem certeza que deseja arquivar <strong>{tenant.name}</strong>?
            </p>
            <ul className="mt-3 space-y-1 text-sm text-slate-500 dark:text-slate-400">
              <li>- Todos os membros serao removidos da organizacao</li>
              <li>- Os dados serao preservados mas ocultos</li>
              <li>- Voce podera restaurar depois</li>
            </ul>
            {archiveError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{archiveError}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setArchiveConfirmOpen(false); setArchiveError(null) }}
                disabled={archiveLoading}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => void handleArchive()}
                disabled={archiveLoading}
                className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                {archiveLoading ? 'Arquivando...' : 'Confirmar arquivamento'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
