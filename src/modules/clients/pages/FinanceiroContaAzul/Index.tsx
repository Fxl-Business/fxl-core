import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import PromptBlock from '@shared/ui/PromptBlock'
import { listKnowledgeEntries, type KnowledgeEntry } from '@/lib/kb-service'

type DocStatus = {
  doc: string
  label: string
  status: string
  href: string
}

const docs: DocStatus[] = [
  { doc: 'briefing',   label: 'Briefing',   status: 'Concluído',   href: '/clients/financeiro-conta-azul/briefing' },
  { doc: 'blueprint',  label: 'Blueprint',  status: 'Concluído',   href: '/clients/financeiro-conta-azul/blueprint' },
  { doc: 'wireframe',  label: 'Wireframe',  status: 'Em revisão',  href: '/clients/financeiro-conta-azul/wireframe' },
  { doc: 'branding',   label: 'Branding',   status: 'Pendente',    href: '/clients/financeiro-conta-azul/branding' },
  { doc: 'changelog',  label: 'Changelog',  status: 'Iniciado',    href: '/clients/financeiro-conta-azul/changelog' },
]

const STATUS_COLORS: Record<string, string> = {
  Rascunho:    'bg-yellow-50 text-yellow-700',
  Pendente:    'bg-muted text-muted-foreground',
  Iniciado:    'bg-blue-50 text-blue-700',
  Concluído:   'bg-green-50 text-green-700',
  'Em revisão':'bg-orange-50 text-orange-700',
}

const ENTRY_TYPE_COLORS: Record<string, string> = {
  bug:      'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  decision: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  pattern:  'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  lesson:   'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
}

const PROMPT_MASTER = `Olá. Vamos trabalhar no projeto Financeiro Conta Azul.
---
Antes de começar qualquer tarefa, leia todos os arquivos disponíveis no knowledge deste Project.
---
Slug do cliente: financeiro-conta-azul
Repositório alvo: fxl-core
Subpasta do cliente: clients/financeiro-conta-azul/
---
⚠️ REGRA DE ESCOPO
Todo prompt gerado para o Claude Code deve especificar explicitamente o slug do cliente.
O Claude Code nunca deve alterar a subpasta de outro cliente.
---
Meu objetivo nesta conversa é: [descrever a tarefa]`

export default function FinanceiroIndex() {
  const [kbEntries, setKbEntries] = useState<KnowledgeEntry[]>([])
  const [kbLoading, setKbLoading] = useState(true)

  useEffect(() => {
    listKnowledgeEntries({ client_slug: 'financeiro-conta-azul' })
      .then((entries) => {
        setKbEntries(entries)
        setKbLoading(false)
      })
      .catch(() => setKbLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-4xl">
      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>Clientes</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-medium text-slate-900 dark:text-foreground">Financeiro Conta Azul</span>
      </nav>
      <span className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-400 dark:ring-indigo-400/30">
        Clientes
      </span>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
        Financeiro Conta Azul
      </h1>
      <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
        Dashboard financeiro focado em analise de dados exportados do Conta Azul.
      </p>

      <div className="mt-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">Documentos</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">Documento</th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">Acao</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((item) => (
                <tr key={item.doc} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-foreground">{item.label}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[item.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.doc === 'wireframe' ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline dark:text-indigo-400"
                      >
                        Abrir
                      </a>
                    ) : (
                      <Link
                        to={item.href}
                        className="text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline dark:text-indigo-400"
                      >
                        Abrir
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">Conhecimento</h2>
        {kbLoading ? (
          <p className="text-sm text-slate-400">Carregando...</p>
        ) : kbEntries.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum conhecimento registrado para este cliente.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {kbEntries.map((entry) => (
              <Link
                key={entry.id}
                to={`/knowledge-base/${entry.id}`}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-card dark:hover:border-indigo-600/50 dark:hover:bg-indigo-950/20"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${ENTRY_TYPE_COLORS[entry.entry_type] ?? 'bg-muted text-muted-foreground'}`}>
                    {entry.entry_type}
                  </span>
                </div>
                <p className="mb-2 text-sm font-semibold text-slate-900 group-hover:text-indigo-700 dark:text-foreground dark:group-hover:text-indigo-400">
                  {entry.title}
                </p>
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">Prompt Master — Claude Project</h2>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Abra o Claude Project do cliente e cole este prompt como primeira mensagem.
        </p>
        <PromptBlock
          label="Prompt Master — copie e adapte o campo entre colchetes"
          prompt={PROMPT_MASTER}
        />
      </div>
    </div>
  )
}
