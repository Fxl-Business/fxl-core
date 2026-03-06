import { CheckCircle2, XCircle, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

type HistoryEntry = {
  id: string
  date: string
  type: string
  period: string
  records: number
  status: 'success' | 'warning' | 'error'
}

type Props = {
  label: string
  acceptedFormats?: string[]
  successMessage?: string
  errorMessages?: string[]
  history?: HistoryEntry[]
}

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-green-50 text-green-700',
  warning: 'bg-yellow-50 text-yellow-700',
  error:   'bg-red-50 text-red-700',
}
const STATUS_LABEL: Record<string, string> = {
  success: '✅ Sucesso',
  warning: '⚠️ Com alertas',
  error:   '❌ Com erros',
}

export default function UploadSection({
  label, acceptedFormats = ['XLS', 'XLSX', 'CSV'],
  successMessage, errorMessages, history,
}: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-gray-700">{label}</p>

      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-8 py-10 cursor-default">
        <Upload className="mb-3 h-8 w-8 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">
          Arraste o arquivo aqui ou{' '}
          <span className="underline text-gray-600">clique para selecionar</span>
        </p>
        <p className="mt-1.5 text-xs text-gray-400">
          Formatos aceitos: {acceptedFormats.join(', ')}
        </p>
      </div>

      {successMessage && (
        <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-green-50 border border-green-200 p-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-green-700">{successMessage}</p>
          </div>
          <button
            type="button"
            disabled
            className="cursor-default rounded-md bg-green-700 px-3 py-1 text-[11px] font-medium text-white"
          >
            Confirmar Import
          </button>
        </div>
      )}

      {errorMessages && errorMessages.length > 0 && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <p className="text-xs font-semibold text-red-700">
              {errorMessages.length} erro{errorMessages.length > 1 ? 's' : ''} encontrado{errorMessages.length > 1 ? 's' : ''}:
            </p>
          </div>
          <ul className="space-y-1 pl-2">
            {errorMessages.map((msg, i) => (
              <li key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                <span className="mt-0.5 text-red-400">•</span>
                <span>{msg}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {history && history.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Histórico de Importações
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {['Data', 'Tipo', 'Período', 'Registros', 'Status', 'Ação'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{h.date}</td>
                    <td className="px-3 py-2 text-gray-600">{h.type}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{h.period}</td>
                    <td className="px-3 py-2 text-right text-gray-600 tabular-nums">{h.records}</td>
                    <td className="px-3 py-2">
                      <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', STATUS_STYLES[h.status])}>
                        {STATUS_LABEL[h.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button type="button" disabled className="cursor-default rounded border border-gray-200 px-2 py-0.5 text-gray-400">
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
