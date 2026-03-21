import { useState, useEffect, useCallback } from 'react'
import { useSession } from '@clerk/react'
import { ScrollText, RefreshCw, Download, ChevronLeft, ChevronRight, X, ChevronsUpDown, Check } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Badge } from '@shared/ui/badge'
import { Checkbox } from '@shared/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@shared/ui/command'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@shared/ui/sheet'
import { queryAuditLogs } from '@platform/services/audit-service'
import { listTenants, setClerkTokenGetter } from '@platform/services/tenant-service'
import { toast } from 'sonner'
import { cn } from '@shared/utils'
import type { AuditLogRow, AuditAction, AuditResourceType, AuditQueryParams } from '@platform/types/audit'
import type { Tenant } from '@platform/types/tenant'

const ALL_ACTIONS: AuditAction[] = [
  'create', 'update', 'delete', 'archive', 'restore',
  'sign_in', 'sign_out', 'impersonate', 'add_member', 'remove_member',
]

const ALL_RESOURCE_TYPES: AuditResourceType[] = [
  'tenant', 'user', 'task', 'tenant_module', 'session', 'org_member',
]

const PAGE_SIZES = [25, 50, 100] as const

const DATE_PRESETS = [
  { label: 'Today', value: () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString() } },
  { label: '7d', value: () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString() } },
  { label: '30d', value: () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString() } },
  { label: '90d', value: () => { const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString() } },
]

function formatRelativeTime(isoString: string): string {
  const delta = Date.now() - new Date(isoString).getTime()
  const seconds = Math.floor(delta / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(isoString).toLocaleDateString('pt-BR')
}

function isoToDateInput(iso: string): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

function dateInputToIso(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toISOString()
}

function DiffView({ before, after }: { before: Record<string, unknown>; after: Record<string, unknown> }) {
  const allKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])).sort()
  const changedKeys = allKeys.filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k]))

  if (changedKeys.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No changes detected</p>
  }

  return (
    <div className="space-y-2">
      {changedKeys.map(key => (
        <div key={key} className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-xs font-medium text-slate-600 dark:text-slate-400">
            {key}
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
            <div className="px-3 py-2 bg-red-50/50 dark:bg-red-950/10">
              <pre className="text-xs text-red-700 dark:text-red-400 whitespace-pre-wrap break-all">
                {before[key] !== undefined ? JSON.stringify(before[key], null, 2) : '(not set)'}
              </pre>
            </div>
            <div className="px-3 py-2 bg-green-50/50 dark:bg-green-950/10">
              <pre className="text-xs text-green-700 dark:text-green-400 whitespace-pre-wrap break-all">
                {after[key] !== undefined ? JSON.stringify(after[key], null, 2) : '(not set)'}
              </pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AuditLogsPage() {
  const { session } = useSession()

  // Data state
  const [logs, setLogs] = useState<AuditLogRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [pageSize, setPageSize] = useState(25)
  const [currentPage, setCurrentPage] = useState(0)

  // Filter state
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedActions, setSelectedActions] = useState<AuditAction[]>([])
  const [selectedResourceType, setSelectedResourceType] = useState<AuditResourceType | ''>('')
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const [actorSearch, setActorSearch] = useState('')

  // UI state
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [orgComboOpen, setOrgComboOpen] = useState(false)
  const [actionsPopoverOpen, setActionsPopoverOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null)
  const [rawJsonExpanded, setRawJsonExpanded] = useState(false)

  // Active date preset tracking
  const [activePreset, setActivePreset] = useState<string | null>(null)

  // Register Clerk token getter
  useEffect(() => {
    if (session) {
      setClerkTokenGetter(() => session.getToken({ template: 'supabase' }))
    }
  }, [session])

  // Fetch tenants once for org combobox
  useEffect(() => {
    if (!session) return
    async function loadTenants() {
      try {
        const result = await listTenants()
        setTenants(result.tenants ?? [])
      } catch {
        setTenants([])
      }
    }
    void loadTenants()
  }, [session])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: AuditQueryParams = {
        limit: pageSize,
        offset: currentPage * pageSize,
        org_id: selectedOrgId || undefined,
        actor_id: actorSearch || undefined,
        action: selectedActions.length === 1 ? selectedActions[0] : undefined,
        resource_type: selectedResourceType || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }

      const response = await queryAuditLogs(params)

      // Client-side filter when multiple actions selected
      const filteredData =
        selectedActions.length > 1
          ? response.data.filter((log) => selectedActions.includes(log.action))
          : response.data

      setLogs(filteredData)
      setTotal(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar logs de auditoria')
    } finally {
      setLoading(false)
    }
  }, [pageSize, currentPage, selectedOrgId, actorSearch, selectedActions, selectedResourceType, dateFrom, dateTo])

  // Fetch logs on pagination change
  useEffect(() => {
    if (session) {
      void fetchLogs()
    }
  }, [session, fetchLogs])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0)
  }, [selectedActions, selectedResourceType, selectedOrgId, dateFrom, dateTo])

  const hasActiveFilters =
    dateFrom !== '' ||
    dateTo !== '' ||
    selectedActions.length > 0 ||
    selectedResourceType !== '' ||
    selectedOrgId !== '' ||
    actorSearch !== ''

  function clearFilters() {
    setDateFrom('')
    setDateTo('')
    setSelectedActions([])
    setSelectedResourceType('')
    setSelectedOrgId('')
    setActorSearch('')
    setActivePreset(null)
    setCurrentPage(0)
  }

  function toggleAction(action: AuditAction) {
    setSelectedActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action],
    )
  }

  function handleActorKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      void fetchLogs()
    }
  }

  const totalPages = Math.ceil(total / pageSize)
  const showingFrom = total > 0 ? currentPage * pageSize + 1 : 0
  const showingTo = Math.min((currentPage + 1) * pageSize, total)

  const selectedOrgName = tenants.find((t) => t.id === selectedOrgId)?.name ?? ''

  function exportCSV() {
    if (logs.length === 0) return

    const headers = ['id', 'created_at', 'actor_email', 'actor_id', 'actor_type', 'action', 'resource_type', 'resource_id', 'resource_label', 'org_id', 'ip_address', 'user_agent', 'metadata']
    const csvRows = [headers.join(',')]

    for (const log of logs) {
      const row = headers.map(h => {
        const val = log[h as keyof AuditLogRow]
        if (val === null || val === undefined) return ''
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`
        const str = String(val)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`
        return str
      })
      csvRows.push(row.join(','))
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`${logs.length} logs exported`)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">Audit Logs</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Historico de operacoes criticas da plataforma
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" disabled={logs.length === 0} onClick={exportCSV}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date presets */}
        {DATE_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant={activePreset === preset.label ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              setDateFrom(preset.value())
              setDateTo('')
              setActivePreset(preset.label)
            }}
          >
            {preset.label}
          </Button>
        ))}

        {/* Date from */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">De</span>
          <Input
            type="date"
            className="h-8 w-36 text-sm"
            value={isoToDateInput(dateFrom)}
            onChange={(e) => {
              setDateFrom(e.target.value ? dateInputToIso(e.target.value) : '')
              setActivePreset(null)
            }}
          />
        </div>

        {/* Date to */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">Ate</span>
          <Input
            type="date"
            className="h-8 w-36 text-sm"
            value={isoToDateInput(dateTo)}
            onChange={(e) => {
              setDateTo(e.target.value ? dateInputToIso(e.target.value) : '')
              setActivePreset(null)
            }}
          />
        </div>

        {/* Action multi-select */}
        <Popover open={actionsPopoverOpen} onOpenChange={setActionsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              Actions
              {selectedActions.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {selectedActions.length}
                </Badge>
              )}
              <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2" align="start">
            <div className="space-y-1">
              {ALL_ACTIONS.map((action) => (
                <label
                  key={action}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Checkbox
                    checked={selectedActions.includes(action)}
                    onCheckedChange={() => toggleAction(action)}
                  />
                  {action}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Resource type select */}
        <Select
          value={selectedResourceType}
          onValueChange={(val) => setSelectedResourceType(val === '_all' ? '' : (val as AuditResourceType))}
        >
          <SelectTrigger className="h-8 w-40 text-sm">
            <SelectValue placeholder="Resource type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All</SelectItem>
            {ALL_RESOURCE_TYPES.map((rt) => (
              <SelectItem key={rt} value={rt}>
                {rt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Org combobox */}
        <Popover open={orgComboOpen} onOpenChange={setOrgComboOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              role="combobox"
              aria-expanded={orgComboOpen}
              className="h-8 w-44 justify-between text-xs"
            >
              {selectedOrgName || 'Org'}
              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search org..." className="h-9" />
              <CommandList>
                <CommandEmpty>No org found.</CommandEmpty>
                <CommandGroup>
                  {selectedOrgId && (
                    <CommandItem
                      value="_clear"
                      onSelect={() => {
                        setSelectedOrgId('')
                        setOrgComboOpen(false)
                      }}
                    >
                      <X className="mr-2 h-3 w-3" />
                      Clear
                    </CommandItem>
                  )}
                  {tenants.map((tenant) => (
                    <CommandItem
                      key={tenant.id}
                      value={tenant.name}
                      onSelect={() => {
                        setSelectedOrgId(tenant.id)
                        setOrgComboOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-3 w-3',
                          selectedOrgId === tenant.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {tenant.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Actor search */}
        <Input
          placeholder="Actor ID or email..."
          className="h-8 w-48 text-sm"
          value={actorSearch}
          onChange={(e) => setActorSearch(e.target.value)}
          onBlur={() => void fetchLogs()}
          onKeyDown={handleActorKeyDown}
        />

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={clearFilters}>
            <X className="h-3 w-3" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedActions.map((action) => (
            <Badge key={action} variant="secondary" className="gap-1">
              action: {action}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleAction(action)}
              />
            </Badge>
          ))}
          {selectedResourceType && (
            <Badge variant="secondary" className="gap-1">
              resource: {selectedResourceType}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedResourceType('')}
              />
            </Badge>
          )}
          {selectedOrgId && (
            <Badge variant="secondary" className="gap-1">
              org: {selectedOrgName || selectedOrgId}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedOrgId('')}
              />
            </Badge>
          )}
          {actorSearch && (
            <Badge variant="secondary" className="gap-1">
              actor: {actorSearch}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setActorSearch('')}
              />
            </Badge>
          )}
          {dateFrom && (
            <Badge variant="secondary" className="gap-1">
              from: {isoToDateInput(dateFrom)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => { setDateFrom(''); setActivePreset(null) }}
              />
            </Badge>
          )}
          {dateTo && (
            <Badge variant="secondary" className="gap-1">
              to: {isoToDateInput(dateTo)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setDateTo('')}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800"
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
            onClick={() => void fetchLogs()}
          >
            <RefreshCw className="h-3 w-3" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && logs.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-700">
          <ScrollText className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum log de auditoria encontrado
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && !error && logs.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/50">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/50">
                      Actor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/50">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/50">
                      Resource
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/50">
                      Org
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/50">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t border-slate-100 hover:bg-slate-50/50 cursor-pointer dark:border-slate-700/50 dark:hover:bg-slate-800/30"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        <span title={new Date(log.created_at).toLocaleString('pt-BR')}>
                          {formatRelativeTime(log.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        <div className="flex items-center">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mr-2">
                            {log.actor_email?.[0]?.toUpperCase() ?? '?'}
                          </span>
                          <span className="truncate max-w-[180px] inline-block" title={log.actor_email}>
                            {log.actor_email}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {log.resource_type}
                        {log.resource_label && (
                          <span className="ml-1 text-slate-400">/ {log.resource_label}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="truncate max-w-[120px] inline-block text-xs text-slate-500">
                          {log.org_id}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="text-xs text-slate-400">
                          {log.ip_address ?? '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing {showingFrom}-{showingTo} of {total} logs
            </span>

            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val))
                setCurrentPage(0)
              }}
            >
              <SelectTrigger className="h-8 w-20 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {currentPage + 1} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Sheet open={selectedLog !== null} onOpenChange={(open) => { if (!open) { setSelectedLog(null); setRawJsonExpanded(false) } }}>
        <SheetContent side="right" className="w-[480px] overflow-y-auto sm:max-w-[480px]">
          {selectedLog && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Badge variant="outline">{selectedLog.action}</Badge>
                  {selectedLog.resource_type}
                </SheetTitle>
                <SheetDescription>
                  {new Date(selectedLog.created_at).toLocaleString('pt-BR')}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                {([
                  ['ID', selectedLog.id],
                  ['Org ID', selectedLog.org_id],
                  ['Actor', selectedLog.actor_email],
                  ['Actor ID', selectedLog.actor_id],
                  ['Actor Type', selectedLog.actor_type],
                  ['Action', selectedLog.action],
                  ['Resource Type', selectedLog.resource_type],
                  ['Resource ID', selectedLog.resource_id],
                  ['Resource Label', selectedLog.resource_label ?? '-'],
                  ['IP Address', selectedLog.ip_address ?? '-'],
                  ['User Agent', selectedLog.user_agent ?? '-'],
                  ['Timestamp', new Date(selectedLog.created_at).toLocaleString('pt-BR')],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
                    <span className="text-sm text-slate-900 dark:text-foreground text-right break-all">{value}</span>
                  </div>
                ))}

                {selectedLog.action === 'update' && selectedLog.metadata && (
                  <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground">Changes</h4>
                    <div className="grid grid-cols-2 gap-0 mb-2">
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">Before</span>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">After</span>
                    </div>
                    <DiffView
                      before={(selectedLog.metadata.before as Record<string, unknown>) ?? {}}
                      after={(selectedLog.metadata.after as Record<string, unknown>) ?? {}}
                    />
                  </div>
                )}

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground">Metadata</h4>
                    {Object.entries(selectedLog.metadata)
                      .filter(([k]) => k !== 'before' && k !== 'after')
                      .map(([key, val]) => (
                        <div key={key} className="flex items-start justify-between gap-4">
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{key}</span>
                          <span className="text-sm text-slate-900 dark:text-foreground text-right break-all">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '-')}
                          </span>
                        </div>
                      ))}

                    <button
                      type="button"
                      onClick={() => setRawJsonExpanded(!rawJsonExpanded)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mt-2"
                    >
                      {rawJsonExpanded ? 'Hide raw JSON' : 'Show raw JSON'}
                    </button>
                    {rawJsonExpanded && (
                      <pre className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-xs text-slate-700 dark:text-slate-300 overflow-x-auto max-h-64 overflow-y-auto">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
