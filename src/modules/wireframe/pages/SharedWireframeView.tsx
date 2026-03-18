import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare, Loader2 } from 'lucide-react'
import { validateToken } from '@tools/wireframe-builder/lib/tokens'
import { getCommentsByScreen } from '@tools/wireframe-builder/lib/comments'
import { loadBlueprint as loadBlueprintFromDb } from '@tools/wireframe-builder/lib/blueprint-store'
import {
  resolveBranding,
  getChartPalette,
  getFontLinks,
  brandingToWfOverrides,
  loadBrandingConfig,
} from '@tools/wireframe-builder/lib/branding'
import { WireframeThemeProvider } from '@tools/wireframe-builder/lib/wireframe-theme'
import type { BrandingConfig } from '@tools/wireframe-builder/types/branding'
import { toTargetId } from '@tools/wireframe-builder/types/comments'
import type { Comment } from '@tools/wireframe-builder/types/comments'
import type { BlueprintConfig } from '@tools/wireframe-builder/types/blueprint'
import WireframeHeader from '@tools/wireframe-builder/components/WireframeHeader'
import BlueprintRenderer from '@tools/wireframe-builder/components/BlueprintRenderer'
import CommentOverlay from '@tools/wireframe-builder/components/CommentOverlay'

const STORAGE_KEY_NAME = 'fxl_client_name'
const STORAGE_KEY_ID = 'fxl_client_id'

function getClientId(): string {
  let id = localStorage.getItem(STORAGE_KEY_ID)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY_ID, id)
  }
  return id
}

// Branding is loaded dynamically via loadBrandingConfig (auto-discovers clients/*/wireframe/branding.config.ts)

type ViewState =
  | { step: 'loading' }
  | { step: 'invalid'; message: string }
  | { step: 'name-entry'; clientSlug: string }
  | {
      step: 'wireframe'
      clientSlug: string
      clientName: string
      blueprint: BlueprintConfig
      branding: BrandingConfig
    }

export default function SharedWireframeView() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [viewState, setViewState] = useState<ViewState>({ step: 'loading' })
  const [nameInput, setNameInput] = useState('')

  // Wireframe-specific state (only used in 'wireframe' step)
  const [activeIndex, setActiveIndex] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTarget, setDrawerTarget] = useState<{
    targetId: string
    label: string
  } | null>(null)

  useEffect(() => {
    async function init() {
      if (!token) {
        setViewState({
          step: 'invalid',
          message:
            'Link invalido ou expirado. Solicite um novo link ao operador.',
        })
        return
      }

      const result = await validateToken(token)
      if (!result.valid || !result.clientSlug) {
        setViewState({
          step: 'invalid',
          message:
            'Link invalido ou expirado. Solicite um novo link ao operador.',
        })
        return
      }

      const clientSlug = result.clientSlug

      // Check for stored name
      const storedName = localStorage.getItem(STORAGE_KEY_NAME)
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
    try {
      const result = await loadBlueprintFromDb(clientSlug)

      if (!result) {
        setViewState({ step: 'invalid', message: 'Blueprint nao encontrado.' })
        return
      }

      // Load branding config (falls back to defaults if not found)
      const brandConfig = await loadBrandingConfig(clientSlug)

      setViewState({
        step: 'wireframe',
        clientSlug,
        clientName,
        blueprint: result.config,
        branding: brandConfig,
      })
    } catch {
      setViewState({
        step: 'invalid',
        message: 'Erro ao carregar wireframe.',
      })
    }
  }

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = nameInput.trim()
    if (!name) return
    if (viewState.step !== 'name-entry') return

    localStorage.setItem(STORAGE_KEY_NAME, name)
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 12,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p style={{ fontSize: 14, color: '#757575' }}>Validando acesso...</p>
      </div>
    )
  }

  if (viewState.step === 'invalid') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 400,
            padding: 32,
            borderRadius: 12,
            border: '1px solid #E0E0E0',
            background: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span style={{ fontSize: 20 }}>!</span>
          </div>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#212121',
              margin: '0 0 8px',
            }}
          >
            Acesso indisponivel
          </h2>
          <p
            style={{
              fontSize: 13,
              color: '#757575',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {viewState.message}
          </p>
        </div>
      </div>
    )
  }

  if (viewState.step === 'name-entry') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <form
          onSubmit={handleNameSubmit}
          style={{
            maxWidth: 400,
            width: '100%',
            padding: 32,
            borderRadius: 12,
            border: '1px solid #E0E0E0',
            background: '#FFFFFF',
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#212121',
              margin: '0 0 4px',
            }}
          >
            Bem-vindo ao wireframe
          </h2>
          <p
            style={{
              fontSize: 13,
              color: '#757575',
              margin: '0 0 20px',
            }}
          >
            Informe seu nome para continuar.
          </p>
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
  const { blueprint: bp, clientSlug, clientName, branding: brandConfig } = viewState
  const clientId = getClientId()
  const screens = bp.screens
  const activeScreen = screens[activeIndex]

  // Resolve branding for rendering
  const resolvedBranding = resolveBranding(brandConfig)
  const sharedChartPalette = getChartPalette(resolvedBranding)

  function handleOpenScreenComments() {
    const targetId = toTargetId({
      type: 'screen',
      screenId: activeScreen.id,
    })
    handleOpenComments(targetId, activeScreen.title)
  }

  return (
    <>
      <WireframeThemeProvider wfOverrides={brandingToWfOverrides(resolvedBranding)}>
        <SharedWireframeShell
          branding={resolvedBranding}
        >
          {/* Sidebar -- uses --wf-sidebar-* tokens with branding overrides */}
          <aside
            style={{
              width: 240,
              minWidth: 240,
              background: 'var(--wf-sidebar-bg)',
              color: 'var(--wf-sidebar-fg)',
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              position: 'fixed',
              left: 0,
              top: 0,
            }}
          >
            <div
              style={{
                height: 56,
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                borderBottom: '1px solid var(--wf-sidebar-border)',
                flexShrink: 0,
              }}
            >
              {resolvedBranding.logoUrl ? (
                <img
                  src={resolvedBranding.logoUrl}
                  alt={bp.label}
                  style={{ maxHeight: 32, maxWidth: 120, objectFit: 'contain' as const }}
                />
              ) : (
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
                  FXL
                </span>
              )}
            </div>
            <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
              {screens.map((screen, i) => {
                const isActive = activeIndex === i
                return (
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
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? 'var(--wf-accent)' : 'var(--wf-sidebar-muted)',
                      background: isActive ? 'var(--wf-accent-muted)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: `${resolvedBranding.bodyFont}, Inter, sans-serif`,
                      transition: 'background 150ms ease, color 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#1e293b'
                        e.currentTarget.style.color = '#fff'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--wf-sidebar-muted)'
                      }
                    }}
                  >
                    {screen.title}
                  </button>
                )
              })}
            </nav>
            <div style={{ padding: 12, margin: '0 12px 12px', borderRadius: 8, border: '1px solid var(--wf-sidebar-border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ height: 8, width: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--wf-sidebar-fg)', lineHeight: 1.3, margin: 0 }}>Sistema Ativo</p>
                  <p style={{ fontSize: 10, color: 'var(--wf-sidebar-muted)', lineHeight: 1.3, margin: 0 }}>Desenvolvido por FXL</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Area principal */}
          <main
            style={{
              flex: 1,
              marginLeft: 240,
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
            }}
          >
            <WireframeHeader
              title={activeScreen.title}
              showPeriodSelector={bp?.header?.showPeriodSelector}
              showUserIndicator={bp?.header?.showUserIndicator}
              actions={bp?.header?.actions}
            />
            <div
              style={{ flex: 1, overflowY: 'auto', padding: '12px 32px 32px' }}
            >
              <BlueprintRenderer
                screen={activeScreen}
                clientSlug={clientSlug}
                comments={comments}
                onOpenComments={handleOpenComments}
                chartColors={sharedChartPalette}
              />
            </div>
          </main>
        </SharedWireframeShell>
      </WireframeThemeProvider>

      {/* App-level overlays -- outside wireframe theme */}
      <button
        type="button"
        onClick={handleOpenScreenComments}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        style={{ background: 'var(--wf-accent)', color: 'var(--wf-accent-fg)' }}
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      {drawerTarget && (
        <CommentOverlay
          clientSlug={clientSlug}
          screenId={activeScreen.id}
          targetId={drawerTarget.targetId}
          targetLabel={drawerTarget.label}
          authorId={clientId}
          authorName={clientName}
          authorRole="cliente"
          open={drawerOpen}
          onClose={handleCloseDrawer}
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Shell wrapper: injects wf override tokens, font loading, and favicon
// ---------------------------------------------------------------------------

function SharedWireframeShell({
  branding: brandingProp,
  children,
}: {
  branding: BrandingConfig
  children: React.ReactNode
}) {
  // Font loading + favicon
  useEffect(() => {
    const fontUrls = getFontLinks(brandingProp)
    const links: HTMLLinkElement[] = []

    for (const url of fontUrls) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url
      document.head.appendChild(link)
      links.push(link)
    }

    if (brandingProp.faviconUrl) {
      const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (icon) icon.href = brandingProp.faviconUrl
    }

    return () => {
      for (const link of links) {
        document.head.removeChild(link)
      }
    }
  }, [brandingProp])

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: `${brandingProp.bodyFont}, Inter, sans-serif`,
        background: 'var(--wf-canvas)',
      }}
    >
      {children}
    </div>
  )
}

