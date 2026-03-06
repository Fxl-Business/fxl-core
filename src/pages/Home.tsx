import { Link } from 'react-router-dom'
import { ArrowRight, Pencil, Users, Cpu } from 'lucide-react'

const quickActions = [
  {
    icon: Pencil,
    title: 'Evoluir o processo FXL',
    description: 'Criar ou refinar prompts para o Claude Code',
    href: '/operacao/prompt-abertura',
  },
  {
    icon: Users,
    title: 'Trabalhar em um cliente',
    description: 'Acessar knowledge, wireframes e docs de um cliente',
    href: '#clientes',
    isAnchor: true,
  },
  {
    icon: Cpu,
    title: 'Conferir tecnologias',
    description: 'Stack, premissas e decisoes tecnicas do processo',
    href: '/build/tech-radar',
  },
]

const sections = [
  {
    badge: 'Processo',
    title: 'Roteamento do trabalho',
    description: 'Decide qual POP usar, qual fase vem na sequencia e como o processo evolui.',
    href: '/processo/master',
  },
  {
    badge: 'Build',
    title: 'Base tecnica padrao',
    description: 'Consulta obrigatoria para qualquer sprint: stack, banco, seguranca e deploy.',
    href: '/build/index',
  },
  {
    badge: 'Referencias',
    title: 'Bibliotecas e padroes',
    description: 'KPIs, blocos de wireframe e repertorio para acelerar a execucao.',
    href: '/referencias/biblioteca-kpis',
  },
]

const clients = [
  {
    slug: 'financeiro-conta-azul',
    name: 'Financeiro Conta Azul',
    badge: 'BI Personalizado',
    description: 'Dashboard financeiro com dados exportados do Conta Azul.',
    status: 'Em andamento',
    href: '/clients/financeiro-conta-azul',
  },
]

export default function Home() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Nucleo FXL</h1>
        <p className="mt-1 text-sm text-slate-500">
          Processo, knowledge e ferramentas — o nucleo operacional da FXL.
        </p>
      </div>

      {/* Quick actions */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        O que vai fazer hoje?
      </h2>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          const inner = (
            <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-400">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900">{action.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{action.description}</p>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            </div>
          )

          if (action.isAnchor) {
            return (
              <a key={action.href} href={action.href}>
                {inner}
              </a>
            )
          }

          return (
            <Link key={action.href} to={action.href}>
              {inner}
            </Link>
          )
        })}
      </div>

      {/* Documentacao */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Documentacao
      </h2>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            to={s.href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-400"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {s.badge}
            </p>
            <h3 className="mb-1 text-sm font-semibold text-slate-900">{s.title}</h3>
            <p className="text-xs text-slate-500">{s.description}</p>
          </Link>
        ))}
      </div>

      {/* Clientes */}
      <h2 id="clientes" className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Clientes
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <Link
            key={c.slug}
            to={c.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {c.badge}
              </span>
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                {c.status}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">
              {c.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
