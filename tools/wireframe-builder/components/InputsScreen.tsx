import { Upload } from 'lucide-react'

type Props = {
  acceptedFormats: string[]
  instructions?: string
  fieldName?: string
}

export default function InputsScreen({ acceptedFormats, instructions, fieldName = 'arquivo' }: Props) {
  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card p-6">
      {fieldName && (
        <p className="mb-3 text-sm font-semibold text-wf-heading">{fieldName}</p>
      )}
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-wf-card-border bg-wf-canvas px-8 py-12">
        <Upload className="mb-3 h-8 w-8 text-wf-muted" />
        <p className="text-sm font-medium text-wf-muted">
          Arraste e solte ou{' '}
          <span className="text-wf-body underline cursor-default">selecione um arquivo</span>
        </p>
        <p className="mt-1.5 text-xs text-wf-muted">
          Formatos aceitos: {acceptedFormats.join(', ')}
        </p>
        {instructions && (
          <p className="mt-3 max-w-sm text-center text-xs text-wf-muted">{instructions}</p>
        )}
        <button
          type="button"
          disabled
          className="mt-4 cursor-default rounded-md bg-wf-canvas px-4 py-2 text-xs font-medium text-wf-muted border border-wf-card-border"
        >
          Selecionar arquivo
        </button>
      </div>
    </div>
  )
}
