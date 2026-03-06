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
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
      <p className="mb-1 text-sm font-semibold text-gray-700">{title}</p>
      {note && <p className="mb-4 text-xs text-gray-400">{note}</p>}
      <div className="space-y-2">
        {banks.map((bank) => (
          <div key={bank.label} className="flex items-center gap-3">
            <label className="w-52 flex-shrink-0 text-xs text-gray-500">{bank.label}</label>
            <div className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 cursor-default select-none">
              {bank.value}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3 border-t border-gray-200 pt-3 mt-3">
          <span className="w-52 flex-shrink-0 text-xs font-semibold text-gray-700">
            Saldo Consolidado Total
          </span>
          <span className="text-sm font-bold text-gray-800">{total}</span>
        </div>
      </div>
    </div>
  )
}
