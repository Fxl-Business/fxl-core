import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Home } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

type NavItem = {
  label: string
  href?: string
  children?: NavItem[]
  external?: boolean
}

const navigation: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Processo',
    href: '/processo/index',
    children: [
      { label: 'Visao Geral', href: '/processo/visao-geral' },
      { label: 'Prompts', href: '/processo/prompts' },
      { label: 'Cliente vs Produto', href: '/processo/cliente-vs-produto' },
      { label: 'Identidade FXL', href: '/processo/identidade' },
      {
        label: 'Fases',
        href: '/processo/fases/index',
        children: [
          { label: 'Fase 1 — Diagnostico', href: '/processo/fases/fase1' },
          { label: 'Fase 2 — Wireframe', href: '/processo/fases/fase2' },
          { label: 'Fase 3 — Desenvolvimento', href: '/processo/fases/fase3' },
          { label: 'Fase 4 — Auditoria', href: '/processo/fases/fase4' },
          { label: 'Fase 5 — Entrega', href: '/processo/fases/fase5' },
          { label: 'Fase 6 — Tutorial', href: '/processo/fases/fase6' },
        ],
      },
      { label: 'Onboarding', href: '/processo/onboarding' },
    ],
  },
  {
    label: 'Padroes',
    href: '/padroes/index',
    children: [
      {
        label: 'Tech Radar',
        href: '/ferramentas/tech-radar',
        children: [
          { label: 'Vite + React + TS', href: '/ferramentas/techs/vite-react-ts' },
          { label: 'Tailwind + shadcn/ui', href: '/ferramentas/techs/tailwind-shadcn' },
          { label: 'Next.js', href: '/ferramentas/techs/nextjs' },
          { label: 'Supabase', href: '/ferramentas/techs/supabase' },
          { label: 'Vercel', href: '/ferramentas/techs/vercel' },
          { label: 'GitHub', href: '/ferramentas/techs/github' },
          { label: 'GitHub Actions', href: '/ferramentas/techs/github-actions' },
          { label: 'Backend — Node.js', href: '/ferramentas/techs/backend-node' },
          { label: 'Backend — Python', href: '/ferramentas/techs/backend-python' },
          { label: 'Docker', href: '/ferramentas/techs/docker' },
          { label: 'Kubernetes', href: '/ferramentas/techs/kubernetes' },
          { label: 'Terraform', href: '/ferramentas/techs/terraform' },
          { label: 'API Gateway', href: '/ferramentas/techs/api-gateway' },
          { label: 'Kafka', href: '/ferramentas/techs/kafka' },
          { label: 'Keycloak', href: '/ferramentas/techs/keycloak' },
        ],
      },
      { label: 'Premissas Gerais', href: '/ferramentas/premissas-gerais' },
      { label: 'Seguranca', href: '/ferramentas/seguranca' },
      { label: 'Testes', href: '/ferramentas/testes' },
    ],
  },
  {
    label: 'Ferramentas',
    href: '/ferramentas/index',
    children: [
      {
        label: 'Wireframe Builder',
        href: '/ferramentas/wireframe-builder',
        children: [
          {
            label: 'Blocos Disponiveis',
            href: '/ferramentas/blocos/index',
            children: [
              { label: 'KpiCard', href: '/ferramentas/blocos/kpi-card' },
              { label: 'KpiCardFull', href: '/ferramentas/blocos/kpi-card-full' },
              { label: 'CalculoCard', href: '/ferramentas/blocos/calculo-card' },
              { label: 'BarLineChart', href: '/ferramentas/blocos/bar-line-chart' },
              { label: 'WaterfallChart', href: '/ferramentas/blocos/waterfall-chart' },
              { label: 'DonutChart', href: '/ferramentas/blocos/donut-chart' },
              { label: 'ParetoChart', href: '/ferramentas/blocos/pareto-chart' },
              { label: 'DataTable', href: '/ferramentas/blocos/data-table' },
              { label: 'DrillDownTable', href: '/ferramentas/blocos/drill-down-table' },
              { label: 'ClickableTable', href: '/ferramentas/blocos/clickable-table' },
              { label: 'ConfigTable', href: '/ferramentas/blocos/config-table' },
              { label: 'WireframeSidebar', href: '/ferramentas/blocos/wireframe-sidebar' },
              { label: 'WireframeHeader', href: '/ferramentas/blocos/wireframe-header' },
              { label: 'WireframeFilterBar', href: '/ferramentas/blocos/wireframe-filter-bar' },
              { label: 'GlobalFilters', href: '/ferramentas/blocos/global-filters' },
              { label: 'WireframeModal', href: '/ferramentas/blocos/wireframe-modal' },
              { label: 'DetailViewSwitcher', href: '/ferramentas/blocos/detail-view-switcher' },
              { label: 'CommentOverlay', href: '/ferramentas/blocos/comment-overlay' },
              { label: 'InputsScreen', href: '/ferramentas/blocos/inputs-screen' },
              { label: 'UploadSection', href: '/ferramentas/blocos/upload-section' },
              { label: 'ManualInputSection', href: '/ferramentas/blocos/manual-input-section' },
              { label: 'SaldoBancoInput', href: '/ferramentas/blocos/saldo-banco-input' },
            ],
          },
          { label: 'Galeria de Componentes', href: '/ferramentas/wireframe-builder/galeria' },
        ],
      },
    ],
  },
  {
    label: 'Clientes',
    children: [
      {
        label: 'Financeiro Conta Azul',
        href: '/clients/financeiro-conta-azul',
        children: [
          { label: 'Briefing', href: '/clients/financeiro-conta-azul/briefing' },
          { label: 'Blueprint', href: '/clients/financeiro-conta-azul/blueprint' },
          { label: 'Wireframe', href: '/clients/financeiro-conta-azul/wireframe', external: true },
          { label: 'Branding', href: '/clients/financeiro-conta-azul/branding' },
          { label: 'Changelog', href: '/clients/financeiro-conta-azul/changelog' },
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
  const homeItem = navigation[0]
  const rest = navigation.slice(1)

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50/50 p-6 md:block dark:border-sidebar-border dark:bg-sidebar">
      <nav className="space-y-8">
        {/* Home link with icon */}
        <NavLink
          to={homeItem.href!}
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
          {homeItem.label}
        </NavLink>

        <Separator className="my-4" />

        {/* Remaining groups */}
        {rest.map((item) => (
          <NavSection key={item.label} item={item} depth={0} />
        ))}
      </nav>
    </aside>
  )
}
