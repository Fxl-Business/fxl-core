import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
      <div className="text-sm text-muted-foreground">
        Documento não encontrado: <code>{doc}</code>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-fxl-navy">
          Financeiro Conta Azul
        </span>
        <h1 className="mt-1 text-2xl font-bold text-fxl-navy">{entry.title}</h1>
        <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 font-mono text-xs text-fxl-navy">
          {entry.filename}
        </span>
      </div>
      <div className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {entry.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
