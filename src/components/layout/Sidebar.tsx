import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Home } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

type NavItem = {
  label: string
  href?: string
  children?: NavItem[]
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
        children: [
          { label: 'Visao Geral', href: '/clients/financeiro-conta-azul' },
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

  // Leaf node (no children, has href)
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

  // Parent with href — navigable label + independent chevron toggle
  if (hasChildren && item.href) {
    return (
      <div>
        <div className={cn(
          'flex items-center justify-between rounded-md transition-colors',
          depth === 0
            ? 'text-left text-xs font-semibold uppercase tracking-[0.18em] text-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          childIsActive && depth > 0 && 'text-foreground',
        )}>
          <NavLink
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex-1 truncate px-3 py-1.5 text-xs',
                depth === 0
                  ? 'font-semibold uppercase tracking-[0.18em]'
                  : '',
                isActive && depth > 0
                  ? 'font-medium text-fxl-navy'
                  : '',
              )
            }
          >
            {item.label}
          </NavLink>
          {depth > 0 && (
            <button
              type="button"
              onClick={() => setOpen((c) => !c)}
              className="px-2 py-1.5 text-muted-foreground hover:text-foreground"
            >
              {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          )}
        </div>
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

  // Parent without href — toggle only
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
  const homeItem = navigation[0]
  const rest = navigation.slice(1)

  return (
    <aside className="w-full flex-shrink-0 border-b border-border/80 bg-white/80 backdrop-blur md:w-64 md:border-b-0 md:border-r">
      <nav className="max-h-72 overflow-y-auto p-4 md:max-h-none md:space-y-1">
        {/* Home link with icon */}
        <NavLink
          to={homeItem.href!}
          className={({ isActive }) =>
            cn(
              'flex w-full items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              isActive
                ? 'bg-fxl-navy text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <Home className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
          {homeItem.label}
        </NavLink>

        <Separator className="my-3" />

        {/* Remaining groups */}
        {rest.map((item) => (
          <NavSection key={item.label} item={item} depth={0} />
        ))}
      </nav>
    </aside>
  )
}
