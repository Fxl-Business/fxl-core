import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { validateToken } from '@tools/wireframe-builder/lib/tokens'
import { getCommentsByScreen } from '@tools/wireframe-builder/lib/comments'
import { toTargetId } from '@tools/wireframe-builder/types/comments'
import type { Comment } from '@tools/wireframe-builder/types/comments'
import type { BlueprintConfig } from '@tools/wireframe-builder/types/blueprint'
import WireframeHeader from '@tools/wireframe-builder/components/WireframeHeader'
import BlueprintRenderer from '@tools/wireframe-builder/components/BlueprintRenderer'
import CommentOverlay from '@tools/wireframe-builder/components/CommentOverlay'

const STORAGE_KEY = 'fxl_client_name'

const blueprintMap: Record<string, () => Promise<{ default: BlueprintConfig }>> = {
  'financeiro-conta-azul': () => import('@clients/financeiro-conta-azul/wireframe/blueprint.config'),
}

type ViewState =
  | { step: 'loading' }
  | { step: 'invalid'; message: string }
  | { step: 'name-entry'; clientSlug: string }
  | { step: 'wireframe'; clientSlug: string; clientName: string; blueprint: BlueprintConfig }

export default function SharedWireframeView() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [viewState, setViewState] = useState<ViewState>({ step: 'loading' })
  const [nameInput, setNameInput] = useState('')

  // Wireframe-specific state (only used in 'wireframe' step)
  const [activeIndex, setActiveIndex] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTarget, setDrawerTarget] = useState<{ targetId: string; label: string } | null>(null)

  useEffect(() => {
    async function init() {
      if (!token) {
        setViewState({ step: 'invalid', message: 'Link invalido ou expirado. Solicite um novo link ao operador.' })
        return
      }

      const result = await validateToken(token)
      if (!result.valid || !result.clientSlug) {
        setViewState({ step: 'invalid', message: 'Link invalido ou expirado. Solicite um novo link ao operador.' })
        return
      }

      const clientSlug = result.clientSlug

      // Anonymous sign-in for client auth
      const { error: authError } = await supabase.auth.signInAnonymously()
      if (authError) {
        setViewState({ step: 'invalid', message: 'Erro de autenticacao. Tente novamente.' })
        return
      }

      // Check for stored name
      const storedName = localStorage.getItem(STORAGE_KEY)
      if (storedName) {
        await loadBlueprint(clientSlug, storedName)
      } else {
        setViewState({ step: 'name-entry', clientSlug })
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function loadBlueprint(clientSlug: string, clientName: string) {
    const loader = blueprintMap[clientSlug]
    if (!loader) {
      setViewState({ step: 'invalid', message: 'Cliente nao encontrado.' })
      return
    }

    try {
      const mod = await loader()
      setViewState({ step: 'wireframe', clientSlug, clientName, blueprint: mod.default })
    } catch {
      setViewState({ step: 'invalid', message: 'Erro ao carregar wireframe.' })
    }
  }

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = nameInput.trim()
    if (!name) return
    if (viewState.step !== 'name-entry') return

    localStorage.setItem(STORAGE_KEY, name)
    loadBlueprint(viewState.clientSlug, name)
  }

  // Wireframe comment handlers
  const fetchComments = useCallback(async () => {
    if (viewState.step !== 'wireframe') return
    const screen = viewState.blueprint.screens[activeIndex]
    try {
      const data = await getCommentsByScreen(viewState.clientSlug, screen.id)
      setComments(data)
    } catch {
      // Silently fail -- comments list stays empty or stale
    }
  }, [viewState, activeIndex])

  useEffect(() => {
    if (viewState.step === 'wireframe') {
      fetchComments()
    }
  }, [viewState.step, fetchComments])

  function handleOpenComments(targetId: string, label: string) {
    setDrawerTarget({ targetId, label })
    setDrawerOpen(true)
  }

  function handleCloseDrawer() {
    setDrawerOpen(false)
    fetchComments()
  }

  // --- Render states ---

  if (viewState.step === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12, fontFamily: 'Inter, sans-serif' }}>
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p style={{ fontSize: 14, color: '#757575' }}>Validando acesso...</p>
      </div>
    )
  }

  if (viewState.step === 'invalid') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: 400, padding: 32, borderRadius: 12, border: '1px solid #E0E0E0', background: '#FFFFFF', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ fontSize: 20 }}>!</span>
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#212121', margin: '0 0 8px' }}>Acesso indisponivel</h2>
          <p style={{ fontSize: 13, color: '#757575', margin: 0, lineHeight: 1.5 }}>{viewState.message}</p>
        </div>
      </div>
    )
  }

  if (viewState.step === 'name-entry') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <form onSubmit={handleNameSubmit} style={{ maxWidth: 400, width: '100%', padding: 32, borderRadius: 12, border: '1px solid #E0E0E0', background: '#FFFFFF' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#212121', margin: '0 0 4px' }}>Bem-vindo ao wireframe</h2>
          <p style={{ fontSize: 13, color: '#757575', margin: '0 0 20px' }}>Informe seu nome para continuar.</p>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Seu nome"
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              borderRadius: 8,
              border: '1px solid #E0E0E0',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={!nameInput.trim()}
            style={{
              width: '100%',
              marginTop: 12,
              padding: '10px 0',
              fontSize: 14,
              fontWeight: 600,
              color: '#FFF',
              background: nameInput.trim() ? '#1A237E' : '#BDBDBD',
              border: 'none',
              borderRadius: 8,
              cursor: nameInput.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Comecar
          </button>
        </form>
      </div>
    )
  }

  // viewState.step === 'wireframe'
  const { blueprint: bp, clientSlug, clientName } = viewState
  const screens = bp.screens
  const activeScreen = screens[activeIndex]

  function handleOpenScreenComments() {
    const targetId = toTargetId({ type: 'screen', screenId: activeScreen.id })
    handleOpenComments(targetId, activeScreen.title)
  }

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

      {/* Area principal */}
      <main style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <WireframeHeader title={activeScreen.title} periodType={activeScreen.periodType} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 32px 32px' }}>
          <BlueprintRenderer
            screen={activeScreen}
            clientSlug={clientSlug}
            comments={comments}
            onOpenComments={handleOpenComments}
          />
        </div>
      </main>

      {/* Screen-level comment FAB */}
      <button
        type="button"
        onClick={handleOpenScreenComments}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-fxl-navy shadow-lg transition-transform hover:scale-105"
      >
        <MessageSquare className="h-5 w-5 text-white" />
      </button>

      {/* Comment drawer */}
      {drawerTarget && (
        <CommentOverlay
          clientSlug={clientSlug}
          screenId={activeScreen.id}
          targetId={drawerTarget.targetId}
          targetLabel={drawerTarget.label}
          authorName={clientName}
          authorRole="cliente"
          open={drawerOpen}
          onClose={handleCloseDrawer}
        />
      )}
    </div>
  )
}
