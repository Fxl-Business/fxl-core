type BankEntry = { label: string; value: string }

type Props = {
  title?: string
  note?: string
  banks: BankEntry[]
  total: string
}

export default function SaldoBancoInput({
  title = 'Saldo Atual por Banco',
  note = 'Informe o saldo atual de cada banco para calcular a projeção do mês.',
  banks,
  total,
}: Props) {
  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-canvas p-5">
      <p className="mb-1 text-sm font-semibold text-wf-heading">{title}</p>
      {note && <p className="mb-4 text-xs text-wf-muted">{note}</p>}
      <div className="space-y-2">
        {banks.map((bank) => (
          <div key={bank.label} className="flex items-center gap-3">
            <label className="w-52 flex-shrink-0 text-xs text-wf-muted">{bank.label}</label>
            <div className="flex-1 rounded-md border border-wf-card-border bg-wf-card px-3 py-1.5 text-xs text-wf-muted cursor-default select-none">
              {bank.value}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3 border-t border-wf-card-border pt-3 mt-3">
          <span className="w-52 flex-shrink-0 text-xs font-semibold text-wf-heading">
            Saldo Consolidado Total
          </span>
          <span className="text-sm font-bold text-wf-heading">{total}</span>
        </div>
      </div>
    </div>
  )
}
