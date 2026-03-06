import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  href?: string
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    label: 'Documentação',
    children: [
      {
        label: 'Processo',
        children: [
          { label: 'POP — BI Personalizado', href: '/docs/process/pop-bi-personalizado' },
          { label: 'POP — Produto FXL', href: '/docs/process/pop-produto' },
          { label: 'Pacote de Cliente', href: '/docs/process/pacote-cliente' },
          { label: 'Prompt Master', href: '/docs/process/prompt-master' },
        ],
      },
      {
        label: 'Wireframe',
        children: [
          { label: 'Blocos Disponíveis', href: '/docs/wireframe/blocos-disponiveis' },
        ],
      },
      {
        label: 'Suporte',
        children: [
          { label: 'Biblioteca de KPIs', href: '/docs/suporte/biblioteca-kpis' },
        ],
      },
    ],
  },
  {
    label: 'Clientes',
    children: [
      {
        label: 'Financeiro Conta Azul',
        children: [
          { label: 'Visão Geral', href: '/clients/financeiro-conta-azul' },
          { label: 'Briefing', href: '/clients/financeiro-conta-azul/briefing' },
          { label: 'Blueprint', href: '/clients/financeiro-conta-azul/blueprint' },
          { label: 'Branding', href: '/clients/financeiro-conta-azul/branding' },
          { label: 'Changelog', href: '/clients/financeiro-conta-azul/changelog' },
          { label: 'Wireframe', href: '/clients/financeiro-conta-azul/wireframe' },
        ],
      },
    ],
  },
]

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

  if (!hasChildren && item.href) {
    return (
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          cn(
            'flex w-full items-center rounded-md px-3 py-1.5 text-xs transition-colors',
            depth === 2 && 'pl-6',
            depth === 3 && 'pl-9',
            isActive
              ? 'bg-fxl-navy text-white font-medium shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )
        }
      >
        {item.label}
      </NavLink>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs transition-colors',
          depth === 0
            ? 'text-left text-xs font-semibold uppercase tracking-[0.18em] text-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          childIsActive && depth > 0 && 'text-foreground',
        )}
      >
        {item.label}
        {depth > 0 &&
          (open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />)}
      </button>
      {(open || depth === 0) && item.children && (
        <div className={cn('mt-0.5 space-y-0.5', depth === 0 && 'mb-4')}>
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
    <aside className="w-full flex-shrink-0 border-b border-border/80 bg-white/80 backdrop-blur md:w-64 md:border-b-0 md:border-r">
      <nav className="max-h-72 overflow-y-auto p-4 md:max-h-none md:space-y-1">
        {navigation.map((item) => (
          <NavSection key={item.label} item={item} depth={0} />
        ))}
      </nav>
    </aside>
  )
}
