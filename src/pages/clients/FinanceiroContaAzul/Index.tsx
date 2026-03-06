import { Link } from 'react-router-dom'
import PromptBlock from '@/components/ui/PromptBlock'

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
  Pendente:    'bg-gray-100 text-gray-500',
  Iniciado:    'bg-blue-50 text-blue-700',
  Concluído:   'bg-green-50 text-green-700',
  'Em revisão':'bg-orange-50 text-orange-700',
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
  return (
    <div>
      <div className="mb-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-fxl-navy">
          financeiro-conta-azul
        </span>
      </div>
      <h1 className="text-2xl font-bold text-fxl-navy">Financeiro Conta Azul</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dashboard financeiro focado em análise de dados exportados do Conta Azul.
      </p>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Documentos</h2>
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Documento</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Ação</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((item) => (
                <tr key={item.doc} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">{item.label}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[item.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={item.href}
                      className="text-fxl-blue underline-offset-2 hover:underline"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Prompt Master — Claude Project</h2>
        <p className="mb-3 text-xs text-muted-foreground">
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
