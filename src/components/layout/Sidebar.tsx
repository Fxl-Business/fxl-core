import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Home } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { MODULE_REGISTRY, type NavItem } from '@/modules/registry'

const navigationFromRegistry: NavItem[] = MODULE_REGISTRY
  .filter(m => m.status !== 'coming-soon')
  .flatMap(m => m.navChildren ?? [])

function hasActiveChild(navItem: NavItem, pathname: string): boolean {
  if (navItem.href && pathname === navItem.href) {
    return true
  }

  if (!navItem.children) {
    return false
  }

  return navItem.children.some((child) => hasActiveChild(child, pathname))
}

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

export default function Sidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50/50 p-6 md:block dark:border-sidebar-border dark:bg-sidebar">
      <nav className="space-y-8">
        {/* Home link with icon — hardcoded, not a module */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 text-sm font-medium transition-colors',
              isActive
                ? 'text-indigo-600 dark:text-sidebar-accent'
                : 'text-slate-600 hover:text-indigo-600 dark:text-sidebar-muted-foreground dark:hover:text-sidebar-accent',
            )
          }
        >
          <Home className="h-4 w-4" />
          Home
        </NavLink>

        <Separator className="my-4" />

        {/* Navigation from MODULE_REGISTRY */}
        {navigationFromRegistry.map((item) => (
          <NavSection key={item.label} item={item} depth={0} />
        ))}
      </nav>
    </aside>
  )
}
