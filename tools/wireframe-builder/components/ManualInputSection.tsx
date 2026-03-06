type AdjustEntry = {
  id: string
  type: 'receita' | 'despesa'
  month: string
  value: string
  description: string
}

type Props = {
  title?: string
  initialBalance?: string
  entries?: AdjustEntry[]
}

const FIELD_PLACEHOLDER = '—'

export default function ManualInputSection({
  title = 'Simulação de Ajustes Manuais',
  initialBalance,
  entries = [],
}: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 space-y-5">
      <p className="text-sm font-semibold text-gray-700">{title}</p>

      {initialBalance !== undefined && (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Saldo Inicial do Período
          </p>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500 w-52 flex-shrink-0">Saldo inicial (R$)</label>
            <div className="w-48 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500">
              {initialBalance}
            </div>
          </div>
          <p className="mt-1.5 text-xs text-gray-400">Ponto de partida da projeção mensal.</p>
        </div>
      )}

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Adicionar Receita Manual
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {['Valor (R$)', 'Mês', 'Categoria', 'Centro de Custo', 'Descrição'].map((f) => (
            <div key={f} className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400">{f}</label>
              <div className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-300">
                {FIELD_PLACEHOLDER}
              </div>
            </div>
          ))}
        </div>
        <button type="button" disabled className="mt-2 cursor-default rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-400">
          + Adicionar Receita
        </button>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Adicionar Despesa Manual
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {['Valor (R$)', 'Mês', 'Grupo', 'Categoria', 'Descrição'].map((f) => (
            <div key={f} className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400">{f}</label>
              <div className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-300">
                {FIELD_PLACEHOLDER}
              </div>
            </div>
          ))}
        </div>
        <button type="button" disabled className="mt-2 cursor-default rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-400">
          + Adicionar Despesa
        </button>
      </div>

      {entries.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Ajustes Cadastrados
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  {['Tipo', 'Mês', 'Valor (R$)', 'Descrição', 'Ações'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-gray-100">
                    <td className="px-3 py-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${e.type === 'receita' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {e.type === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{e.month}</td>
                    <td className="px-3 py-2 text-right text-gray-600 tabular-nums">{e.value}</td>
                    <td className="px-3 py-2 text-gray-600">{e.description}</td>
                    <td className="px-3 py-2 flex gap-1">
                      <button type="button" disabled className="cursor-default rounded border border-gray-200 px-2 py-0.5 text-gray-400">Editar</button>
                      <button type="button" disabled className="cursor-default rounded border border-red-100 px-2 py-0.5 text-red-300">Remover</button>
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
