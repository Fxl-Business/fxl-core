import InputsScreen from '@tools/wireframe-builder/components/InputsScreen'
import CommentOverlay from '@tools/wireframe-builder/components/CommentOverlay'
import WireframeSidebar from '@tools/wireframe-builder/components/WireframeSidebar'

const SCREENS = [
  { label: 'Dashboard Principal' },
  { label: 'Receitas' },
  { label: 'Despesas' },
  { label: 'Fluxo de Caixa' },
  { label: 'Inadimplência' },
  { label: 'Inputs', active: true },
]

export default function Inputs() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="p-4">
        <WireframeSidebar screens={SCREENS} />
      </div>

      <main className="flex-1 p-6 space-y-6">
        <div>
          <p className="text-xs text-gray-400">Financeiro Conta Azul &rsaquo; Inputs</p>
          <h1 className="mt-0.5 text-lg font-bold text-gray-800">Inputs</h1>
        </div>

        <InputsScreen
          fieldName="Importar exportação do Conta Azul"
          acceptedFormats={['.csv', '.xlsx']}
          instructions="Exporte os lançamentos pelo menu Financeiro → Lançamentos → Exportar no Conta Azul e faça o upload aqui."
        />
      </main>

      <CommentOverlay screenName="inputs" />
    </div>
  )
}
