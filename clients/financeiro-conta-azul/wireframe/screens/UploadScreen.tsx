import UploadSection from '@tools/wireframe-builder/components/UploadSection'

const HISTORY_RECEITAS = [
  { id: 'h1', date: '04/03/2026', type: 'Contas a Receber', period: 'Fev/2026', records: 342, status: 'success' as const },
  { id: 'h2', date: '02/02/2026', type: 'Contas a Receber', period: 'Jan/2026', records: 318, status: 'success' as const },
  { id: 'h3', date: '05/01/2026', type: 'Contas a Receber', period: 'Dez/2025', records: 295, status: 'warning' as const },
]

const HISTORY_DESPESAS = [
  { id: 'h4', date: '04/03/2026', type: 'Contas a Pagar', period: 'Fev/2026', records: 218, status: 'success' as const },
  { id: 'h5', date: '02/02/2026', type: 'Contas a Pagar', period: 'Jan/2026', records: 201, status: 'error' as const },
  { id: 'h6', date: '05/01/2026', type: 'Contas a Pagar', period: 'Dez/2025', records: 198, status: 'success' as const },
]

const HISTORY_EXTRATO = [
  { id: 'h7', date: '04/03/2026', type: 'Extrato Bancário', period: 'Fev/2026', records: 540, status: 'success' as const },
  { id: 'h8', date: '02/02/2026', type: 'Extrato Bancário', period: 'Jan/2026', records: 512, status: 'success' as const },
]

export default function UploadScreen() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-xs font-semibold text-blue-700">Como exportar do Conta Azul:</p>
        <ol className="mt-1.5 space-y-1 pl-4 text-xs text-blue-600 list-decimal">
          <li>Acesse Financeiro → Contas a Receber / Contas a Pagar</li>
          <li>Filtre pelo período desejado (mês completo)</li>
          <li>Clique em "Exportar" → formato XLS ou CSV</li>
          <li>Faça o upload do arquivo abaixo na aba correspondente</li>
        </ol>
      </div>

      <UploadSection
        label="Contas a Receber (Receitas)"
        acceptedFormats={['XLS', 'XLSX', 'CSV']}
        successMessage="286 registros encontrados — Fev/2026. Verifique antes de confirmar."
        history={HISTORY_RECEITAS}
      />

      <UploadSection
        label="Contas a Pagar (Despesas)"
        acceptedFormats={['XLS', 'XLSX', 'CSV']}
        errorMessages={[
          'Coluna "Centro de Custo" não encontrada — verifique o template',
          '3 registros com data inválida na linha 45, 67, 89',
        ]}
        history={HISTORY_DESPESAS}
      />

      <UploadSection
        label="Extrato Bancário (Conciliação)"
        acceptedFormats={['XLS', 'XLSX', 'OFX', 'CSV']}
        history={HISTORY_EXTRATO}
      />
    </div>
  )
}
