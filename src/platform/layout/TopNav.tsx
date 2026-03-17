import { Link } from 'react-router-dom'
import SearchCommand from './SearchCommand'
import { ThemeToggle } from './ThemeToggle'
import { OrgPicker } from '@platform/tenants/OrgPicker'

export default function TopNav() {
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
        <SearchCommand />
        <ThemeToggle />
      </div>
    </header>
  )
}
