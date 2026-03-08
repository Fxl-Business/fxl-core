import { Link } from 'react-router-dom'
import SearchCommand from './SearchCommand'
import { ThemeToggle } from './ThemeToggle'

export default function TopNav() {
  return (
    <header className="sticky top-0 z-20 flex h-14 flex-shrink-0 items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur md:px-6">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
          <span className="text-xs font-bold leading-none text-primary-foreground">FXL</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Nucleo FXL</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            fxl-core
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <SearchCommand />
        <ThemeToggle />
      </div>
    </header>
  )
}
