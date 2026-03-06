import { useState } from 'react'
import CommentOverlay from '@tools/wireframe-builder/components/CommentOverlay'
import WireframeHeader from '@tools/wireframe-builder/components/WireframeHeader'
import DFCScreen from '@clients/financeiro-conta-azul/wireframe/screens/DFCScreen'
import ReceitaScreen from '@clients/financeiro-conta-azul/wireframe/screens/ReceitaScreen'
import DespesasScreen from '@clients/financeiro-conta-azul/wireframe/screens/DespesasScreen'
import CentroCustoScreen from '@clients/financeiro-conta-azul/wireframe/screens/CentroCustoScreen'
import MargensScreen from '@clients/financeiro-conta-azul/wireframe/screens/MargensScreen'
import FluxoMensalScreen from '@clients/financeiro-conta-azul/wireframe/screens/FluxoMensalScreen'
import FluxoAnualScreen from '@clients/financeiro-conta-azul/wireframe/screens/FluxoAnualScreen'
import IndicadoresScreen from '@clients/financeiro-conta-azul/wireframe/screens/IndicadoresScreen'
import UploadScreen from '@clients/financeiro-conta-azul/wireframe/screens/UploadScreen'
import ConfiguracaoScreen from '@clients/financeiro-conta-azul/wireframe/screens/ConfiguracaoScreen'

type ScreenKey =
  | 'Resultado Mensal (DFC)'
  | 'Visão por Receita'
  | 'Visão por Despesas'
  | 'Visão por Centro de Custo'
  | 'Margens Reais da Operação'
  | 'Fluxo de Caixa Mensal'
  | 'Fluxo de Caixa Anual Projetado'
  | 'Indicadores de Desempenho'
  | 'Upload de Relatórios'
  | 'Configurações'

const SCREENS: ScreenKey[] = [
  'Resultado Mensal (DFC)',
  'Visão por Receita',
  'Visão por Despesas',
  'Visão por Centro de Custo',
  'Margens Reais da Operação',
  'Fluxo de Caixa Mensal',
  'Fluxo de Caixa Anual Projetado',
  'Indicadores de Desempenho',
  'Upload de Relatórios',
  'Configurações',
]

const SCREEN_PERIOD_TYPE: Record<ScreenKey, 'mensal' | 'anual' | 'none'> = {
  'Resultado Mensal (DFC)':         'mensal',
  'Visão por Receita':              'mensal',
  'Visão por Despesas':             'mensal',
  'Visão por Centro de Custo':      'mensal',
  'Margens Reais da Operação':      'mensal',
  'Fluxo de Caixa Mensal':          'mensal',
  'Fluxo de Caixa Anual Projetado': 'anual',
  'Indicadores de Desempenho':      'mensal',
  'Upload de Relatórios':           'none',
  'Configurações':                  'none',
}

const SCREEN_COMPONENTS: Record<ScreenKey, React.ComponentType> = {
  'Resultado Mensal (DFC)':         DFCScreen,
  'Visão por Receita':              ReceitaScreen,
  'Visão por Despesas':             DespesasScreen,
  'Visão por Centro de Custo':      CentroCustoScreen,
  'Margens Reais da Operação':      MargensScreen,
  'Fluxo de Caixa Mensal':          FluxoMensalScreen,
  'Fluxo de Caixa Anual Projetado': FluxoAnualScreen,
  'Indicadores de Desempenho':      IndicadoresScreen,
  'Upload de Relatórios':           UploadScreen,
  'Configurações':                  ConfiguracaoScreen,
}

export default function FinanceiroWireframeViewer() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>(SCREENS[0])
  const ActiveComponent = SCREEN_COMPONENTS[activeScreen]

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#F5F5F5' }}>
      {/* Sidebar escura */}
      <aside
        style={{
          width: 240,
          minWidth: 240,
          background: '#212121',
          color: '#FFF',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
        }}
      >
        <div style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: '1px solid #424242',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>FXL</span>
        </div>
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {SCREENS.map((screen) => (
            <button
              key={screen}
              type="button"
              onClick={() => setActiveScreen(screen)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: activeScreen === screen ? 500 : 400,
                color: activeScreen === screen ? '#FFF' : '#BDBDBD',
                background: activeScreen === screen ? '#424242' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {screen}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #424242', fontSize: 11, color: '#757575' }}>
          Desenvolvido por FXL
        </div>
      </aside>

      {/* Área principal */}
      <main style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <WireframeHeader title={activeScreen} periodType={SCREEN_PERIOD_TYPE[activeScreen]} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 32px 32px' }}>
          <ActiveComponent />
        </div>
      </main>

      <CommentOverlay
        screenName={`wireframe-view-${activeScreen.toLowerCase().replace(/\s+/g, '-')}`}
      />
    </div>
  )
}
