import { Upload } from 'lucide-react'

type Props = {
  acceptedFormats: string[]
  instructions?: string
  fieldName?: string
}

export default function InputsScreen({ acceptedFormats, instructions, fieldName = 'arquivo' }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {fieldName && (
        <p className="mb-3 text-sm font-semibold text-gray-700">{fieldName}</p>
      )}
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-8 py-12">
        <Upload className="mb-3 h-8 w-8 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">
          Arraste e solte ou{' '}
          <span className="text-gray-600 underline cursor-default">selecione um arquivo</span>
        </p>
        <p className="mt-1.5 text-xs text-gray-400">
          Formatos aceitos: {acceptedFormats.join(', ')}
        </p>
        {instructions && (
          <p className="mt-3 max-w-sm text-center text-xs text-gray-400">{instructions}</p>
        )}
        <button
          type="button"
          disabled
          className="mt-4 cursor-default rounded-md bg-gray-200 px-4 py-2 text-xs font-medium text-gray-500"
        >
          Selecionar arquivo
        </button>
      </div>
    </div>
  )
}
