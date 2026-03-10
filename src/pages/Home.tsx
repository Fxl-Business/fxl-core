import { Link } from 'react-router-dom'
import { ArrowRight, Pencil, Users, Cpu } from 'lucide-react'

const quickActions = [
  {
    icon: Pencil,
    title: 'Evoluir o processo FXL',
    description: 'Criar ou refinar prompts para o Claude Code',
    href: '/processo/prompts',
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
    href: '/ferramentas/tech-radar',
  },
]

const sections = [
  {
    badge: 'Processo',
    title: 'Roteamento do trabalho',
    description: 'Decide qual POP usar, qual fase vem na sequencia e como o processo evolui.',
    href: '/processo/visao-geral',
  },
  {
    badge: 'Ferramentas',
    title: 'Ferramentas e base tecnica',
    description: 'Stack, premissas, seguranca, deploy e todas as ferramentas do processo.',
    href: '/ferramentas/index',
  },
  {
    badge: 'Padroes',
    title: 'Padroes e decisoes tecnicas',
    description: 'Tech radar, premissas, seguranca, testes e decisoes tecnicas do processo.',
    href: '/padroes/index',
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
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">Nucleo FXL</h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
          Processo, knowledge e ferramentas — o nucleo operacional da FXL.
        </p>
      </div>

      {/* Quick actions */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
        O que vai fazer hoje?
      </h2>
      <div className="mb-8 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          const inner = (
            <div className="flex h-full min-h-[120px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card dark:hover:border-indigo-800">
              <div className="flex flex-1 items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">{action.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{action.description}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
            </div>
          )

          if (action.isAnchor) {
            return (
              <a key={action.href} href={action.href} className="h-full">
                {inner}
              </a>
            )
          }

          return (
            <Link key={action.href} to={action.href} className="h-full">
              {inner}
            </Link>
          )
        })}
      </div>

      {/* Documentacao */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
        Documentacao
      </h2>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            to={s.href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card dark:hover:border-indigo-800"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {s.badge}
            </p>
            <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-foreground">{s.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.description}</p>
          </Link>
        ))}
      </div>

      {/* Clientes */}
      <h2 id="clientes" className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
        Clientes
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <Link
            key={c.slug}
            to={c.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-card"
          >
            <div className="mb-3 flex items-start justify-between">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {c.badge}
              </span>
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                {c.status}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-foreground dark:group-hover:text-indigo-400">
              {c.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
