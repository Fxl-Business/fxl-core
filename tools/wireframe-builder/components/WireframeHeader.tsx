import { useState } from 'react'

type PeriodType = 'mensal' | 'anual' | 'none'

type Props = {
  title: string
  periodType?: PeriodType
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const arrowButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--wf-card-border)',
  borderRadius: 4,
  width: 24,
  height: 24,
  fontSize: 16,
  color: 'var(--wf-body)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  outline: 'none',
}

export default function WireframeHeader({ title, periodType = 'mensal' }: Props) {
  const [mensal, setMensal] = useState({ monthIndex: 0, year: 2026 })
  const [anualYear, setAnualYear] = useState(2025)

  function prevMensal() {
    setMensal((prev) => {
      if (prev.monthIndex === 0) return { monthIndex: 11, year: prev.year - 1 }
      return { ...prev, monthIndex: prev.monthIndex - 1 }
    })
  }

  function nextMensal() {
    setMensal((prev) => {
      if (prev.monthIndex === 11) return { monthIndex: 0, year: prev.year + 1 }
      return { ...prev, monthIndex: prev.monthIndex + 1 }
    })
  }

  return (
    <header
      style={{
        height: 56,
        background: 'var(--wf-header-bg)',
        borderBottom: '1px solid var(--wf-header-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--wf-heading)', margin: 0, flex: 1 }}>{title}</h1>

      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {periodType === 'mensal' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={arrowButtonStyle} onClick={prevMensal}>‹</button>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--wf-heading)', minWidth: 130, textAlign: 'center' }}>
              {MESES[mensal.monthIndex]} / {String(mensal.year).slice(2)}
            </span>
            <button style={arrowButtonStyle} onClick={nextMensal}>›</button>
          </div>
        )}

        {periodType === 'anual' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={arrowButtonStyle} onClick={() => setAnualYear((y) => y - 1)}>‹</button>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--wf-heading)', minWidth: 60, textAlign: 'center' }}>
              {anualYear}
            </span>
            <button style={arrowButtonStyle} onClick={() => setAnualYear((y) => y + 1)}>›</button>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />
    </header>
  )
}
