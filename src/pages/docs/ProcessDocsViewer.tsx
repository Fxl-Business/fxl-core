import { useParams } from 'react-router-dom'
import MarkdownRenderer from '@/components/docs/MarkdownRenderer'
import PromptBlock from '@/components/ui/PromptBlock'

// Process
import popBiRaw from '../../../docs/process/POP_BI_PERSONALIZADO.md?raw'
import popProdutoRaw from '../../../docs/process/POP_PRODUTO.md?raw'
import pacoteClienteRaw from '../../../docs/process/pacote_cliente.md?raw'
import promptMasterRaw from '../../../docs/process/prompt_master.md?raw'

// Wireframe
import blocosRaw from '../../../docs/wireframe/blocos_disponiveis.md?raw'

// Suporte
import kpisRaw from '../../../docs/suporte/biblioteca_kpis.md?raw'

type DocEntry = {
  title: string
  content: string
  filename: string
  section: string
  promptBlock?: { label: string; sectionHeading: string }
}

const docMap: Record<string, DocEntry> = {
  'pop-bi-personalizado': {
    title: 'POP — BI Personalizado',
    content: popBiRaw,
    filename: 'POP_BI_PERSONALIZADO.md',
    section: 'Processo',
  },
  'pop-produto': {
    title: 'POP — Produto FXL',
    content: popProdutoRaw,
    filename: 'POP_PRODUTO.md',
    section: 'Processo',
  },
  'pacote-cliente': {
    title: 'Pacote de Cliente',
    content: pacoteClienteRaw,
    filename: 'pacote_cliente.md',
    section: 'Processo',
  },
  'prompt-master': {
    title: 'Prompt Master',
    content: promptMasterRaw,
    filename: 'prompt_master.md',
    section: 'Processo',
    promptBlock: {
      label: 'Prompt Master — copie e adapte os campos entre colchetes',
      sectionHeading: '## Prompt Master (copie e adapte)',
    },
  },
  'blocos-disponiveis': {
    title: 'Blocos Disponíveis',
    content: blocosRaw,
    filename: 'blocos_disponiveis.md',
    section: 'Wireframe',
  },
  'biblioteca-kpis': {
    title: 'Biblioteca de KPIs',
    content: kpisRaw,
    filename: 'biblioteca_kpis.md',
    section: 'Suporte',
  },
}

type SplitContent = {
  before: string
  prompt: string
  after: string
}

function splitPromptBlock(raw: string, sectionHeading: string): SplitContent | null {
  const headingIndex = raw.indexOf(sectionHeading)
  if (headingIndex === -1) return null

  const afterHeading = raw.slice(headingIndex + sectionHeading.length)
  const firstSep = afterHeading.indexOf('\n---\n')
  if (firstSep === -1) return null

  const afterFirstSep = afterHeading.slice(firstSep + 5)
  const secondSep = afterFirstSep.indexOf('\n---\n')

  const prompt = (secondSep === -1 ? afterFirstSep : afterFirstSep.slice(0, secondSep)).trim()
  const after = secondSep === -1 ? '' : afterFirstSep.slice(secondSep + 5).trim()
  const before = raw.slice(0, headingIndex + sectionHeading.length).trim()

  return { before, prompt, after }
}

function Markdown({ content }: { content: string }) {
  return <MarkdownRenderer content={content} />
}

export default function ProcessDocsViewer() {
  const { slug } = useParams<{ slug: string }>()
  const key = slug ?? ''
  const entry = docMap[key]

  if (!entry) {
    return (
      <div className="mx-auto max-w-4xl text-sm text-muted-foreground">
        Documento não encontrado: <code>{slug}</code>
      </div>
    )
  }

  const split =
    entry.promptBlock ? splitPromptBlock(entry.content, entry.promptBlock.sectionHeading) : null

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          {entry.section}
        </span>
        <h1 className="mt-1 text-2xl font-bold text-foreground">{entry.title}</h1>
        <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {entry.filename}
        </span>
      </div>

      {split ? (
        <>
          <Markdown content={split.before} />
          <PromptBlock label={entry.promptBlock!.label} prompt={split.prompt} />
          {split.after && <Markdown content={split.after} />}
        </>
      ) : (
        <Markdown content={entry.content} />
      )}
    </div>
  )
}
