import { useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import MarkdownRenderer from '@/components/docs/MarkdownRenderer'

import briefingRaw from '../../../../clients/financeiro-conta-azul/docs/briefing.md?raw'
import blueprintRaw from '../../../../clients/financeiro-conta-azul/docs/blueprint.md?raw'
import brandingRaw from '../../../../clients/financeiro-conta-azul/docs/branding.md?raw'
import changelogRaw from '../../../../clients/financeiro-conta-azul/docs/changelog.md?raw'

type DocEntry = { title: string; content: string; filename: string }

const docMap: Record<string, DocEntry> = {
  briefing:  { title: 'Briefing',  content: briefingRaw,  filename: 'briefing.md'  },
  blueprint: { title: 'Blueprint', content: blueprintRaw, filename: 'blueprint.md' },
  branding:  { title: 'Branding',  content: brandingRaw,  filename: 'branding.md'  },
  changelog: { title: 'Changelog', content: changelogRaw, filename: 'changelog.md' },
}

export default function DocViewer() {
  const { doc } = useParams<{ doc: string }>()
  const entry = doc ? docMap[doc] : null

  if (!entry) {
    return (
      <div className="mx-auto max-w-4xl text-sm text-slate-500 dark:text-slate-400">
        Documento não encontrado: <code>{doc}</code>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Clientes</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span>Financeiro Conta Azul</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium text-slate-900 dark:text-foreground">{entry.title}</span>
        </nav>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">{entry.title}</h1>
        <span className="mt-2 inline-block rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {entry.filename}
        </span>
      </div>
      <MarkdownRenderer content={entry.content} />
    </div>
  )
}
