import { useCallback, useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import CommentOverlay from '@tools/wireframe-builder/components/CommentOverlay'
import WireframeHeader from '@tools/wireframe-builder/components/WireframeHeader'
import BlueprintRenderer from '@tools/wireframe-builder/components/BlueprintRenderer'
import blueprint from '@clients/financeiro-conta-azul/wireframe/blueprint.config'
import { useAuth } from '@/contexts/AuthContext'
import { getCommentsByScreen } from '@tools/wireframe-builder/lib/comments'
import { toTargetId } from '@tools/wireframe-builder/types/comments'
import type { Comment } from '@tools/wireframe-builder/types/comments'

const screens = blueprint.screens

export default function FinanceiroWireframeViewer() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeScreen = screens[activeIndex]

  const { user } = useAuth()

  const [comments, setComments] = useState<Comment[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTarget, setDrawerTarget] = useState<{ targetId: string; label: string } | null>(null)

  const fetchComments = useCallback(async () => {
    try {
      const data = await getCommentsByScreen(blueprint.slug, activeScreen.id)
      setComments(data)
    } catch {
      // Silently fail -- comments list stays empty or stale
    }
  }, [activeScreen.id])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  function handleOpenComments(targetId: string, label: string) {
    setDrawerTarget({ targetId, label })
    setDrawerOpen(true)
  }

  function handleOpenScreenComments() {
    const targetId = toTargetId({ type: 'screen', screenId: activeScreen.id })
    handleOpenComments(targetId, activeScreen.title)
  }

  function handleCloseDrawer() {
    setDrawerOpen(false)
    fetchComments()
  }

  const authorName = user?.user_metadata?.name ?? user?.email ?? 'Operador'

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
            clientSlug={blueprint.slug}
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
          clientSlug={blueprint.slug}
          screenId={activeScreen.id}
          targetId={drawerTarget.targetId}
          targetLabel={drawerTarget.label}
          authorName={authorName}
          authorRole="operador"
          open={drawerOpen}
          onClose={handleCloseDrawer}
        />
      )}
    </div>
  )
}
