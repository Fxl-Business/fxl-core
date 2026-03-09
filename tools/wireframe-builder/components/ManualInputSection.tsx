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
    <div className="rounded-lg border border-wf-card-border bg-wf-canvas p-5 space-y-5">
      <p className="text-sm font-semibold text-wf-heading">{title}</p>

      {initialBalance !== undefined && (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-wf-muted">
            Saldo Inicial do Período
          </p>
          <div className="flex items-center gap-3">
            <label className="text-xs text-wf-muted w-52 flex-shrink-0">Saldo inicial (R$)</label>
            <div className="w-48 rounded-md border border-wf-card-border bg-wf-card px-3 py-1.5 text-xs text-wf-muted">
              {initialBalance}
            </div>
          </div>
          <p className="mt-1.5 text-xs text-wf-muted">Ponto de partida da projeção mensal.</p>
        </div>
      )}

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-wf-muted">
          Adicionar Receita Manual
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {['Valor (R$)', 'Mês', 'Categoria', 'Centro de Custo', 'Descrição'].map((f) => (
            <div key={f} className="flex flex-col gap-1">
              <label className="text-[10px] text-wf-muted">{f}</label>
              <div className="rounded-md border border-wf-card-border bg-wf-card px-2.5 py-1.5 text-xs text-wf-muted">
                {FIELD_PLACEHOLDER}
              </div>
            </div>
          ))}
        </div>
        <button type="button" disabled className="mt-2 cursor-default rounded-md bg-wf-card px-3 py-1.5 text-xs font-medium text-wf-muted border border-wf-card-border">
          + Adicionar Receita
        </button>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-wf-muted">
          Adicionar Despesa Manual
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {['Valor (R$)', 'Mês', 'Grupo', 'Categoria', 'Descrição'].map((f) => (
            <div key={f} className="flex flex-col gap-1">
              <label className="text-[10px] text-wf-muted">{f}</label>
              <div className="rounded-md border border-wf-card-border bg-wf-card px-2.5 py-1.5 text-xs text-wf-muted">
                {FIELD_PLACEHOLDER}
              </div>
            </div>
          ))}
        </div>
        <button type="button" disabled className="mt-2 cursor-default rounded-md bg-wf-card px-3 py-1.5 text-xs font-medium text-wf-muted border border-wf-card-border">
          + Adicionar Despesa
        </button>
      </div>

      {entries.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-wf-muted">
            Ajustes Cadastrados
          </p>
          <div className="overflow-x-auto rounded-lg border border-wf-card-border bg-wf-card">
            <table className="w-full text-xs">
              <thead className="bg-wf-table-header">
                <tr>
                  {['Tipo', 'Mês', 'Valor (R$)', 'Descrição', 'Ações'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-wf-table-header-fg">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-wf-card-border">
                    <td className="px-3 py-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: e.type === 'receita'
                            ? 'color-mix(in srgb, var(--wf-positive) 10%, transparent)'
                            : 'color-mix(in srgb, var(--wf-negative) 10%, transparent)',
                          color: e.type === 'receita' ? 'var(--wf-positive)' : 'var(--wf-negative)',
                        }}
                      >
                        {e.type === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-wf-body">{e.month}</td>
                    <td className="px-3 py-2 text-right text-wf-body tabular-nums">{e.value}</td>
                    <td className="px-3 py-2 text-wf-body">{e.description}</td>
                    <td className="px-3 py-2 flex gap-1">
                      <button type="button" disabled className="cursor-default rounded border border-wf-card-border px-2 py-0.5 text-wf-muted">Editar</button>
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
