import { useState } from 'react'
import CommentOverlay from '@tools/wireframe-builder/components/CommentOverlay'
import WireframeHeader from '@tools/wireframe-builder/components/WireframeHeader'
import BlueprintRenderer from '@tools/wireframe-builder/components/BlueprintRenderer'
import blueprint from '@clients/financeiro-conta-azul/wireframe/blueprint.config'

const screens = blueprint.screens

export default function FinanceiroWireframeViewer() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeScreen = screens[activeIndex]

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
          {screens.map((screen, i) => (
            <button
              key={screen.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: activeIndex === i ? 500 : 400,
                color: activeIndex === i ? '#FFF' : '#BDBDBD',
                background: activeIndex === i ? '#424242' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {screen.title}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #424242', fontSize: 11, color: '#757575' }}>
          Desenvolvido por FXL
        </div>
      </aside>

      {/* Área principal */}
      <main style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <WireframeHeader title={activeScreen.title} periodType={activeScreen.periodType} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 32px 32px' }}>
          <BlueprintRenderer screen={activeScreen} />
        </div>
      </main>

      <CommentOverlay
        screenName={`wireframe-view-${activeScreen.id}`}
      />
    </div>
  )
}
