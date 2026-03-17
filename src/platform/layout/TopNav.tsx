import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import SearchCommand from './SearchCommand'
import { ThemeToggle } from './ThemeToggle'
import { OrgPicker } from '@platform/tenants/OrgPicker'
import { useAdminMode } from '@platform/hooks/useAdminMode'
import { cn } from '@shared/utils'

export default function TopNav() {
  const { isSuperAdmin, isAdminRoute, toggleMode } = useAdminMode()

  return (
    <header className="sticky top-0 z-50 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-border dark:bg-background/80">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <span className="text-xs font-bold leading-none text-primary-foreground">FXL</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-foreground">Nexo</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-muted-foreground">
              FXL-CORE
            </span>
          </div>
        </Link>
        <OrgPicker />
      </div>

      <div className="flex flex-1 items-center justify-end gap-4 px-8">
        {isSuperAdmin && (
          <button
            type="button"
            onClick={toggleMode}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
              isAdminRoute
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-950/70'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
            )}
            title={isAdminRoute ? 'Voltar ao modo Operador' : 'Modo Admin'}
          >
            <Shield className="h-3.5 w-3.5" />
            {isAdminRoute ? 'Operator' : 'Admin'}
          </button>
        )}
        <SearchCommand />
        <ThemeToggle />
      </div>
    </header>
  )
}
