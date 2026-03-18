import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@shared/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover'
import {
  MODULE_REGISTRY,
  type ModuleDefinition,
  type NavItem,
  type UseNavItemsResult,
} from '@platform/module-loader/registry'
import { useModuleEnabled } from '@platform/module-loader/hooks/useModuleEnabled'

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function hasActiveChild(navItem: NavItem, pathname: string): boolean {
  if (navItem.href && pathname === navItem.href) {
    return true
  }
  if (!navItem.children) {
    return false
  }
  return navItem.children.some((child) => hasActiveChild(child, pathname))
}

/**
 * Determine which module is active based on current pathname.
 * Matches the module whose `route` prefix best fits the current path.
 */
function detectActiveModule(
  pathname: string,
  enabledModules: ModuleDefinition[],
): ModuleDefinition | null {
  // Build candidates with their route prefix for matching
  const candidates = enabledModules.map((m) => {
    // Normalise route to a prefix (strip trailing /index, etc.)
    const prefix = m.route.replace(/\/index$/, '')
    return { module: m, prefix }
  })

  // Sort by prefix length descending so longer (more specific) prefixes match first
  candidates.sort((a, b) => b.prefix.length - a.prefix.length)

  for (const { module: mod, prefix } of candidates) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return mod
    }
  }

  // Fallback: if on home ("/"), return first enabled module
  return null
}

// ---------------------------------------------------------------------------
// NavSection — renders a single nav item with optional children
// ---------------------------------------------------------------------------

function NavSection({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const location = useLocation()
  const hasChildren = Boolean(item.children?.length)
  const childIsActive = hasActiveChild(item, location.pathname)
  const [open, setOpen] = useState(() => childIsActive)

  useEffect(() => {
    if (childIsActive) {
      setOpen(true)
    }
  }, [childIsActive])

  // Leaf node (no children, has href)
  if (!hasChildren && item.href) {
    if (item.external) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm transition-colors text-slate-500 hover:text-indigo-600 dark:text-sidebar-muted-foreground dark:hover:text-sidebar-accent"
        >
          {item.label}
        </a>
      )
    }
    return (
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          cn(
            'block text-sm transition-colors',
            isActive
              ? '-ml-px border-l-2 border-indigo-600 pl-[15px] font-medium text-indigo-600 dark:border-sidebar-accent dark:text-sidebar-accent'
              : 'text-slate-500 hover:text-indigo-600 dark:text-sidebar-muted-foreground dark:hover:text-sidebar-accent',
          )
        }
      >
        {item.label}
      </NavLink>
    )
  }

  // Parent with href — navigable label + independent chevron toggle
  if (hasChildren && item.href) {
    return (
      <div>
        <div className={cn(
          'flex items-center justify-between',
          depth === 0
            ? 'mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-sidebar-foreground'
            : 'text-sm',
        )}>
          <NavLink
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex-1 truncate text-sm transition-colors',
                depth === 0
                  ? 'text-xs font-bold uppercase tracking-wider'
                  : '',
                isActive
                  ? 'font-medium text-indigo-600 dark:text-sidebar-accent'
                  : 'text-slate-500 hover:text-indigo-600 dark:text-sidebar-muted-foreground dark:hover:text-sidebar-accent',
                childIsActive && !isActive && 'text-slate-700 dark:text-sidebar-foreground',
              )
            }
          >
            {item.label}
          </NavLink>
          {depth > 0 && (
            <button
              type="button"
              onClick={() => setOpen((c) => !c)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:text-sidebar-muted-foreground dark:hover:text-sidebar-foreground"
            >
              {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          )}
        </div>
        {(open || depth === 0) && item.children && (
          <div className={cn(
            depth === 0
              ? 'mt-2 space-y-3 border-l border-slate-200 ml-1 pl-4 text-sm dark:border-sidebar-border'
              : 'mt-2 space-y-2 border-l border-slate-200 ml-1 pl-4 dark:border-sidebar-border',
          )}>
            {item.children.map((child) => (
              <NavSection key={child.label} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Parent without href — toggle only
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          depth === 0
            ? 'flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-sidebar-foreground'
            : 'flex w-full items-center justify-between text-sm text-slate-500 hover:text-indigo-600 dark:text-sidebar-muted-foreground dark:hover:text-sidebar-accent',
          childIsActive && depth > 0 && 'text-slate-700 dark:text-sidebar-foreground',
        )}
      >
        {item.label}
        {depth > 0 &&
          (open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />)}
      </button>
      {(open || depth === 0) && item.children && (
        <div className={cn(
          depth === 0
            ? 'mt-2 space-y-3 border-l border-slate-200 ml-1 pl-4 text-sm dark:border-sidebar-border'
            : 'mt-2 space-y-2 border-l border-slate-200 ml-1 pl-4 dark:border-sidebar-border',
        )}>
          {item.children.map((child) => (
            <NavSection key={child.label} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ModuleNavContent — calls the module's useNavItems hook or falls back to static
// ---------------------------------------------------------------------------

/**
 * Wrapper component that calls a module's useNavItems hook.
 * Must be a component (not inline) so the hook is called unconditionally
 * at the top level of a React component.
 */
function DynamicNavContent({ useNavItems }: { useNavItems: () => UseNavItemsResult }) {
  const { items, isLoading } = useNavItems()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-sidebar-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Carregando...
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="text-xs text-slate-400 dark:text-sidebar-muted-foreground">
        Nenhum item ainda.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <NavSection key={item.label + (item.href ?? '')} item={item} depth={0} />
      ))}
    </div>
  )
}

function StaticNavContent({ navChildren }: { navChildren: NavItem[] }) {
  if (navChildren.length === 0) {
    return (
      <p className="text-xs text-slate-400 dark:text-sidebar-muted-foreground">
        Nenhum item ainda.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {navChildren.map((item) => (
        <NavSection key={item.label + (item.href ?? '')} item={item} depth={0} />
      ))}
    </div>
  )
}

/**
 * Renders the nav content for the active module.
 * Delegates to DynamicNavContent (hook-based) or StaticNavContent (navChildren).
 */
function ModuleNavContent({ module: mod }: { module: ModuleDefinition }) {
  if (mod.useNavItems) {
    return <DynamicNavContent useNavItems={mod.useNavItems} />
  }
  return <StaticNavContent navChildren={mod.navChildren ?? []} />
}

// ---------------------------------------------------------------------------
// ModuleSwitcher — dropdown at the top of the sidebar
// ---------------------------------------------------------------------------

function ModuleSwitcher({
  activeModule,
  enabledModules,
  onSelect,
}: {
  activeModule: ModuleDefinition | null
  enabledModules: ModuleDefinition[]
  onSelect: (mod: ModuleDefinition) => void
}) {
  const [open, setOpen] = useState(false)

  const Icon = activeModule?.icon
  const label = activeModule?.label ?? 'Selecionar Modulo'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'bg-slate-100 text-slate-800 hover:bg-slate-200',
            'dark:bg-sidebar-accent/10 dark:text-sidebar-foreground dark:hover:bg-sidebar-accent/20',
          )}
        >
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          <span className="flex-1 truncate text-left">{label}</span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[var(--radix-popover-trigger-width)] p-1"
      >
        {enabledModules.map((mod) => {
          const ModIcon = mod.icon
          const isActive = mod.id === activeModule?.id
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => {
                onSelect(mod)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700',
              )}
            >
              <ModIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{mod.label}</span>
              {mod.status === 'beta' && (
                <span className="ml-auto rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  Beta
                </span>
              )}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Sidebar — main export
// ---------------------------------------------------------------------------

export default function Sidebar() {
  const { isEnabled } = useModuleEnabled()
  const location = useLocation()
  const navigate = useNavigate()

  // Build the list of enabled, non-coming-soon modules
  const enabledModules = useMemo(
    () =>
      MODULE_REGISTRY
        .filter((m) => m.status !== 'coming-soon')
        .filter((m) => isEnabled(m.id)),
    [isEnabled],
  )

  // Detect active module from current route
  const activeModule = useMemo(
    () => detectActiveModule(location.pathname, enabledModules),
    [location.pathname, enabledModules],
  )

  // Hide sidebar entirely when no module is active (e.g. home page)
  if (!activeModule) {
    return null
  }

  function handleModuleSelect(mod: ModuleDefinition) {
    navigate(mod.route)
  }

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50/50 md:flex dark:border-sidebar-border dark:bg-sidebar">
      {/* Top: Module Switcher */}
      <div className="p-4 pb-2">
        <ModuleSwitcher
          activeModule={activeModule}
          enabledModules={enabledModules}
          onSelect={handleModuleSelect}
        />
      </div>

      {/* Middle: Scrollable nav area */}
      <nav className="flex-1 overflow-y-auto px-6 py-4">
        <ModuleNavContent key={activeModule.id} module={activeModule} />
      </nav>
    </aside>
  )
}
