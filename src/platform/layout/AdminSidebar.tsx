import { NavLink } from 'react-router-dom'
import { Building2, Blocks, Settings, Plug, LayoutDashboard, FileText, Users } from 'lucide-react'
import { cn } from '@shared/utils'
import { Separator } from '@shared/ui/separator'

interface AdminNavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
  disabled?: boolean
}

const adminNavItems: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Tenants', href: '/admin/tenants', icon: Building2 },
  { label: 'Modules', href: '/admin/modules', icon: Blocks },
  { label: 'Connectors', href: '/admin/connectors', icon: Plug },
  { label: 'Product Docs', href: '/admin/product-docs', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50/50 p-6 md:block dark:border-sidebar-border dark:bg-sidebar">
      <nav className="space-y-2">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-sidebar-foreground">
          Admin
        </p>

        <Separator className="mb-4" />

        {adminNavItems.map((item) => {
          const Icon = item.icon

          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-400 dark:text-sidebar-muted-foreground cursor-not-allowed opacity-50"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </div>
            )
          }

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-indigo-50 font-medium text-indigo-600 dark:bg-indigo-950/30 dark:text-sidebar-accent'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-sidebar-muted-foreground dark:hover:bg-sidebar-hover dark:hover:text-sidebar-accent',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
