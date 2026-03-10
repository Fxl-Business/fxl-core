import { useCallback, useEffect, useState } from 'react'
import { MessageSquare, Loader2 } from 'lucide-react'
import { useUser } from '@clerk/react'
import { arrayMove } from '@dnd-kit/sortable'
import CommentOverlay from '@tools/wireframe-builder/components/CommentOverlay'
import CommentManager from '@tools/wireframe-builder/components/CommentManager'
import WireframeHeader from '@tools/wireframe-builder/components/WireframeHeader'
import BlueprintRenderer from '@tools/wireframe-builder/components/BlueprintRenderer'
import AdminToolbar from '@tools/wireframe-builder/components/editor/AdminToolbar'
import ShareModal from '@tools/wireframe-builder/components/editor/ShareModal'
import PropertyPanel from '@tools/wireframe-builder/components/editor/PropertyPanel'
import ScreenManager from '@tools/wireframe-builder/components/editor/ScreenManager'
import { toast } from 'sonner'
import brandingConfigSeed from '@clients/financeiro-conta-azul/wireframe/branding.config'
import {
  loadBlueprint as loadBlueprintFromDb,
  saveBlueprint as saveBlueprintToDb,
  checkForUpdates,
} from '@tools/wireframe-builder/lib/blueprint-store'
import {
  resolveBranding,
  getChartPalette,
  getFontLinks,
} from '@tools/wireframe-builder/lib/branding'
import { WireframeThemeProvider } from '@tools/wireframe-builder/lib/wireframe-theme'
import { sectionsToRows, getCellCount } from '@tools/wireframe-builder/lib/grid-layouts'
import { getCommentsByScreen } from '@tools/wireframe-builder/lib/comments'
import { toTargetId } from '@tools/wireframe-builder/types/comments'
import type { Comment } from '@tools/wireframe-builder/types/comments'
import type {
  BlueprintConfig,
  BlueprintScreen,
  BlueprintSection,
} from '@tools/wireframe-builder/types/blueprint'
import type { EditModeState, GridLayout, ScreenRow } from '@tools/wireframe-builder/types/editor'

const CLIENT_SLUG = 'financeiro-conta-azul'

// Resolve branding once at module level (static import, no async needed)
const branding = resolveBranding(brandingConfigSeed)
const chartPalette = getChartPalette(branding)

export default function FinanceiroWireframeViewer() {
  const { user } = useUser()

  // Data loading
  const [config, setConfig] = useState<BlueprintConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  // Tracks DB row timestamp for optimistic locking
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)

  // Conflict resolution
  const [conflictOpen, setConflictOpen] = useState(false)
  const [staleWarning, setStaleWarning] = useState(false)

  // Edit mode
  const [editMode, setEditMode] = useState<EditModeState>({
    active: false,
    dirty: false,
    saving: false,
    selectedSection: null,
  })
  const [workingConfig, setWorkingConfig] = useState<BlueprintConfig | null>(null)
  const [pendingExitEdit, setPendingExitEdit] = useState(false)

  // Screen navigation
  const [activeIndex, setActiveIndex] = useState(0)

  // Share modal
  const [shareOpen, setShareOpen] = useState(false)

  // Comments
  const [comments, setComments] = useState<Comment[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTarget, setDrawerTarget] = useState<{
    targetId: string
    label: string
  } | null>(null)
  const [managerOpen, setManagerOpen] = useState(false)

  // --- Data loading ---

  useEffect(() => {
    async function init() {
      try {
        const result = await loadBlueprintFromDb(CLIENT_SLUG)
        if (!result) {
          setLoadError('Blueprint nao encontrado no banco de dados.')
          return
        }
        setConfig(result.config)
        setLastUpdatedAt(result.updatedAt)
      } catch (err) {
        console.error('Failed to load blueprint:', err)
        const message = err instanceof Error ? err.message : 'Erro ao carregar wireframe.'
        toast.error('Erro ao carregar blueprint', { description: message })
        setLoadError(message)
      } finally {
        setLoading(false)
      }
    }
    init()
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Font loading ---

  useEffect(() => {
    const fontUrls = getFontLinks(branding)
    const links: HTMLLinkElement[] = []

    for (const url of fontUrls) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url
      document.head.appendChild(link)
      links.push(link)
    }

    // Favicon override
    if (branding.faviconUrl) {
      const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (icon) icon.href = branding.faviconUrl
    }

    return () => {
      for (const link of links) {
        document.head.removeChild(link)
      }
    }
  }, [])

  // --- Stale data polling (active in edit mode only) ---

  useEffect(() => {
    if (!editMode.active || !lastUpdatedAt) return

    const interval = setInterval(async () => {
      try {
        const remoteUpdatedAt = await checkForUpdates(CLIENT_SLUG)
        if (remoteUpdatedAt && remoteUpdatedAt !== lastUpdatedAt) {
          setStaleWarning(true)
        }
      } catch {
        // Polling failure is non-critical -- silently ignore
      }
    }, 30_000)

    return () => clearInterval(interval)
  }, [editMode.active, lastUpdatedAt])

  // --- Derived state ---

  const activeConfig =
    editMode.active && workingConfig ? workingConfig : config
  const screens = activeConfig?.screens ?? []
  const safeActiveIndex = Math.min(activeIndex, Math.max(screens.length - 1, 0))
  const activeScreen: BlueprintScreen | undefined = screens[safeActiveIndex]

  // Compute rows for active screen
  const rows: ScreenRow[] = activeScreen
    ? activeScreen.rows ?? sectionsToRows(activeScreen.sections)
    : []

  // Find selected section data for property panel
  const selectedSectionData: BlueprintSection | null =
    editMode.selectedSection && activeScreen
      ? (() => {
          const { rowIndex, cellIndex } = editMode.selectedSection
          const r = rows[rowIndex]
          return r?.sections[cellIndex] ?? null
        })()
      : null

  // --- Comments ---

  const fetchComments = useCallback(async () => {
    if (!config || !activeScreen) return
    try {
      const data = await getCommentsByScreen(
        config.slug,
        activeScreen.id,
      )
      setComments(data)
    } catch {
      // Silently fail -- comments list stays empty or stale
    }
  }, [config, activeScreen])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  function handleOpenComments(targetId: string, label: string) {
    setManagerOpen(false)
    setDrawerTarget({ targetId, label })
    setDrawerOpen(true)
  }

  function handleOpenScreenComments() {
    if (!activeScreen) return
    const targetId = toTargetId({
      type: 'screen',
      screenId: activeScreen.id,
    })
    handleOpenComments(targetId, activeScreen.title)
  }

  function handleCloseDrawer() {
    setDrawerOpen(false)
    fetchComments()
  }

  function handleOpenManager() {
    setDrawerOpen(false)
    setManagerOpen(true)
  }

  function handleCloseManager() {
    setManagerOpen(false)
    fetchComments()
  }

  // --- Edit mode ---

  function handleToggleEdit() {
    if (editMode.active) {
      // Exiting edit mode
      if (editMode.dirty) {
        setPendingExitEdit(true)
        return
      }
      exitEditMode()
    } else {
      // Entering edit mode
      if (!config) return
      setWorkingConfig(structuredClone(config))
      setEditMode({
        active: true,
        dirty: false,
        saving: false,
        selectedSection: null,
      })
    }
  }

  function exitEditMode() {
    setWorkingConfig(null)
    setStaleWarning(false)
    setEditMode({
      active: false,
      dirty: false,
      saving: false,
      selectedSection: null,
    })
    setPendingExitEdit(false)
  }

  function confirmExitEdit() {
    exitEditMode()
  }

  function cancelExitEdit() {
    setPendingExitEdit(false)
  }

  async function handleSave() {
    if (!workingConfig || !user) return
    setEditMode((prev) => ({ ...prev, saving: true }))
    try {
      const result = await saveBlueprintToDb(
        CLIENT_SLUG,
        workingConfig,
        user.id,
        lastUpdatedAt,
      )

      if (result.conflict) {
        setConflictOpen(true)
        setEditMode((prev) => ({ ...prev, saving: false }))
        return
      }

      setConfig(structuredClone(workingConfig))
      if (result.updatedAt) {
        setLastUpdatedAt(result.updatedAt)
      }
      setStaleWarning(false)
      toast.success('Blueprint salvo com sucesso')
      setEditMode((prev) => ({ ...prev, dirty: false, saving: false }))
    } catch (err) {
      console.error('Failed to save blueprint:', err)
      const message = err instanceof Error ? err.message : 'Erro ao salvar blueprint.'
      toast.error('Erro ao salvar', { description: message })
      setEditMode((prev) => ({ ...prev, saving: false }))
    }
  }

  // --- Conflict resolution handlers ---

  async function handleConflictReload() {
    // "Recarregar" -- discard local edits, fetch fresh from DB
    setConflictOpen(false)
    try {
      const result = await loadBlueprintFromDb(CLIENT_SLUG)
      if (result) {
        setConfig(result.config)
        setLastUpdatedAt(result.updatedAt)
        setWorkingConfig(structuredClone(result.config))
        setStaleWarning(false)
        toast.info('Blueprint recarregado do banco de dados')
        setEditMode((prev) => ({ ...prev, dirty: false }))
      }
    } catch {
      toast.error('Erro ao recarregar blueprint')
    }
  }

  async function handleConflictOverwrite() {
    // "Sobrescrever" -- force save with null lastKnownUpdatedAt (upsert)
    setConflictOpen(false)
    if (!workingConfig || !user) return
    setEditMode((prev) => ({ ...prev, saving: true }))
    try {
      const result = await saveBlueprintToDb(
        CLIENT_SLUG,
        workingConfig,
        user.id,
        null, // null = force upsert, bypasses locking
      )
      setConfig(structuredClone(workingConfig))
      if (result.updatedAt) {
        setLastUpdatedAt(result.updatedAt)
      }
      setStaleWarning(false)
      toast.success('Blueprint sobrescrito com sucesso')
      setEditMode((prev) => ({ ...prev, dirty: false, saving: false }))
    } catch (err) {
      console.error('Failed to overwrite blueprint:', err)
      toast.error('Erro ao sobrescrever')
      setEditMode((prev) => ({ ...prev, saving: false }))
    }
  }

  // --- Working config mutation helpers ---

  function updateWorkingScreen(
    updater: (screen: BlueprintScreen) => BlueprintScreen,
  ) {
    setWorkingConfig((prev) => {
      if (!prev) return prev
      const newScreens = [...prev.screens]
      const screen = newScreens[safeActiveIndex]
      if (!screen) return prev
      newScreens[safeActiveIndex] = updater(screen)
      return { ...prev, screens: newScreens }
    })
    setEditMode((prev) => ({ ...prev, dirty: true }))
  }

  function getScreenRows(screen: BlueprintScreen): ScreenRow[] {
    return screen.rows ?? sectionsToRows(screen.sections)
  }

  function setScreenRows(
    screen: BlueprintScreen,
    newRows: ScreenRow[],
  ): BlueprintScreen {
    return {
      ...screen,
      rows: newRows,
      sections: newRows.flatMap((r) => r.sections),
    }
  }

  // --- Section operations ---

  function handleSelectSection(rowIndex: number, cellIndex: number) {
    setEditMode((prev) => ({
      ...prev,
      selectedSection: { rowIndex, cellIndex },
    }))
  }

  function handleDeleteSection(rowIndex: number, cellIndex: number) {
    updateWorkingScreen((screen) => {
      const currentRows = getScreenRows(screen)
      const newRows = [...currentRows]
      const row = { ...newRows[rowIndex] }
      const newSections = [...row.sections]
      newSections.splice(cellIndex, 1)

      if (newSections.length === 0) {
        // Remove the entire row
        newRows.splice(rowIndex, 1)
      } else {
        row.sections = newSections
        newRows[rowIndex] = row
      }

      return setScreenRows(screen, newRows)
    })
    // Clear selection if deleted section was selected
    if (
      editMode.selectedSection?.rowIndex === rowIndex &&
      editMode.selectedSection?.cellIndex === cellIndex
    ) {
      setEditMode((prev) => ({ ...prev, selectedSection: null }))
    }
  }

  function handleAddSection(afterRowIndex: number, section: BlueprintSection) {
    updateWorkingScreen((screen) => {
      const currentRows = getScreenRows(screen)
      const newRow: ScreenRow = {
        id: crypto.randomUUID(),
        layout: '1',
        sections: [section],
      }

      const newRows = [...currentRows]
      const insertIndex = afterRowIndex + 1
      newRows.splice(insertIndex, 0, newRow)

      return setScreenRows(screen, newRows)
    })
  }

  function handleAddToCell(rowIndex: number, cellIndex: number, section: BlueprintSection) {
    updateWorkingScreen((screen) => {
      const currentRows = getScreenRows(screen)
      const newRows = [...currentRows]
      const row = { ...newRows[rowIndex] }
      const newSections = [...row.sections]

      // Insert at the specific cell index
      newSections.splice(cellIndex, 0, section)
      row.sections = newSections
      newRows[rowIndex] = row

      return setScreenRows(screen, newRows)
    })
  }

  function handleReorderRows(oldIndex: number, newIndex: number) {
    updateWorkingScreen((screen) => {
      const currentRows = getScreenRows(screen)
      const reordered = arrayMove(currentRows, oldIndex, newIndex)
      return setScreenRows(screen, reordered)
    })
  }

  function handleChangeLayout(rowIndex: number, layout: GridLayout) {
    updateWorkingScreen((screen) => {
      const currentRows = getScreenRows(screen)
      const newRows = [...currentRows]
      const row = { ...newRows[rowIndex] }
      const newCellCount = getCellCount(layout)
      const oldCellCount = row.sections.length

      if (newCellCount < oldCellCount) {
        // Move excess sections to new rows below
        const kept = row.sections.slice(0, newCellCount)
        const excess = row.sections.slice(newCellCount)
        row.sections = kept
        row.layout = layout
        newRows[rowIndex] = row

        // Create new single-column rows for overflow
        const overflowRows: ScreenRow[] = excess.map((s) => ({
          id: crypto.randomUUID(),
          layout: '1' as GridLayout,
          sections: [s],
        }))
        newRows.splice(rowIndex + 1, 0, ...overflowRows)
      } else {
        row.layout = layout
        newRows[rowIndex] = row
      }

      return setScreenRows(screen, newRows)
    })
  }

  function handlePropertyChange(updated: BlueprintSection) {
    if (!editMode.selectedSection) return
    const { rowIndex, cellIndex } = editMode.selectedSection

    updateWorkingScreen((screen) => {
      const currentRows = getScreenRows(screen)
      const newRows = [...currentRows]
      const row = { ...newRows[rowIndex] }
      const newSections = [...row.sections]
      newSections[cellIndex] = updated
      row.sections = newSections
      newRows[rowIndex] = row
      return setScreenRows(screen, newRows)
    })
  }

  // --- Screen management ---

  function handleScreenSelect(index: number) {
    setActiveIndex(index)
    setEditMode((prev) => ({ ...prev, selectedSection: null }))
  }

  function handleAddScreen(screen: BlueprintScreen) {
    setWorkingConfig((prev) => {
      if (!prev) return prev
      return { ...prev, screens: [...prev.screens, screen] }
    })
    setEditMode((prev) => ({ ...prev, dirty: true }))
  }

  function handleDeleteScreen(index: number) {
    setWorkingConfig((prev) => {
      if (!prev) return prev
      const newScreens = prev.screens.filter((_, i) => i !== index)
      return { ...prev, screens: newScreens }
    })
    if (safeActiveIndex >= screens.length - 1) {
      setActiveIndex(Math.max(0, screens.length - 2))
    }
    setEditMode((prev) => ({
      ...prev,
      dirty: true,
      selectedSection: null,
    }))
  }

  function handleRenameScreen(index: number, title: string) {
    setWorkingConfig((prev) => {
      if (!prev) return prev
      const newScreens = [...prev.screens]
      newScreens[index] = { ...newScreens[index], title }
      return { ...prev, screens: newScreens }
    })
    setEditMode((prev) => ({ ...prev, dirty: true }))
  }

  function handleReorderScreens(reorderedScreens: BlueprintScreen[]) {
    setWorkingConfig((prev) => {
      if (!prev) return prev
      return { ...prev, screens: reorderedScreens }
    })
    setEditMode((prev) => ({ ...prev, dirty: true }))
  }

  // --- Auth info ---
  const authorId = user?.id ?? 'unknown'
  const authorName =
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    'Operador'

  // --- Render: loading/error states ---

  if (loading) {
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
        <p style={{ fontSize: 14, color: '#757575' }}>
          Carregando wireframe...
        </p>
      </div>
    )
  }

  if (loadError || !config || !activeScreen) {
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
          <p style={{ fontSize: 14, color: '#757575' }}>
            {loadError ?? 'Wireframe nao encontrado.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <WireframeThemeProvider>
        <div
          style={{
            display: 'flex',
            height: '100vh',
            fontFamily: `${branding.bodyFont}, Inter, sans-serif`,
            background: 'var(--wf-canvas)',
          }}
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
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={config.label}
                  style={{ maxHeight: 32, maxWidth: 120, objectFit: 'contain' as const }}
                />
              ) : (
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
                  FXL
                </span>
              )}
            </div>
            <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
              <ScreenManager
                screens={screens}
                activeIndex={safeActiveIndex}
                editMode={editMode.active}
                onSelectScreen={handleScreenSelect}
                onAddScreen={handleAddScreen}
                onDeleteScreen={handleDeleteScreen}
                onRenameScreen={handleRenameScreen}
                onReorderScreens={handleReorderScreens}
              />
            </nav>
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--wf-sidebar-border)',
              }}
            >
              <button
                type="button"
                onClick={handleOpenManager}
                style={{
                  display: 'block',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  marginBottom: 8,
                  fontSize: 11,
                  color: 'var(--wf-sidebar-muted)',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--wf-sidebar-fg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--wf-sidebar-muted)'
                }}
              >
                Gerenciar
              </button>
              <span style={{ fontSize: 11, color: 'var(--wf-sidebar-muted)' }}>
                Desenvolvido por FXL
              </span>
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
            {user && (
              <AdminToolbar
                screenTitle={activeScreen.title}
                editMode={editMode.active}
                dirty={editMode.dirty}
                saving={editMode.saving}
                onToggleEdit={handleToggleEdit}
                onSave={handleSave}
                onOpenComments={handleOpenScreenComments}
                onOpenShare={() => setShareOpen(true)}
              />
            )}
            {staleWarning && (
              <div className="mx-4 mt-2 flex items-center justify-between rounded-md border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
                <span>Este blueprint foi atualizado externamente. Suas edicoes podem causar conflito ao salvar.</span>
                <button
                  type="button"
                  onClick={async () => {
                    const result = await loadBlueprintFromDb(CLIENT_SLUG)
                    if (result) {
                      setConfig(result.config)
                      setWorkingConfig(structuredClone(result.config))
                      setLastUpdatedAt(result.updatedAt)
                      setStaleWarning(false)
                      setEditMode((prev) => ({ ...prev, dirty: false }))
                      toast.info('Blueprint recarregado')
                    }
                  }}
                  className="ml-4 whitespace-nowrap rounded border border-yellow-300 px-3 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-100"
                >
                  Recarregar
                </button>
              </div>
            )}
            <WireframeHeader
              title={activeScreen.title}
              periodType={activeScreen.periodType}
            />
            <div
              style={{ flex: 1, overflowY: 'auto', padding: '12px 32px 32px' }}
            >
              <BlueprintRenderer
                screen={activeScreen}
                clientSlug={activeConfig?.slug}
                comments={comments}
                onOpenComments={handleOpenComments}
                chartColors={chartPalette}
                editMode={editMode.active}
                selectedSection={editMode.selectedSection}
                onSelectSection={handleSelectSection}
                onDeleteSection={handleDeleteSection}
                onAddSection={handleAddSection}
                onAddToCell={handleAddToCell}
                onReorderRows={handleReorderRows}
                onChangeLayout={handleChangeLayout}
                rows={rows}
              />
            </div>
          </main>
        </div>
      </WireframeThemeProvider>

      {/* App-level overlays -- outside wireframe theme */}
      <PropertyPanel
        open={editMode.selectedSection !== null}
        section={selectedSectionData}
        onClose={() =>
          setEditMode((prev) => ({ ...prev, selectedSection: null }))
        }
        onChange={handlePropertyChange}
      />

      {pendingExitEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
            <h3 className="text-base font-semibold text-foreground">
              Alteracoes nao salvas
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Voce tem alteracoes nao salvas. Deseja sair sem salvar?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelExitEdit}
                className="rounded-md border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Continuar editando
              </button>
              <button
                type="button"
                onClick={confirmExitEdit}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Sair sem salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {conflictOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
            <h3 className="text-base font-semibold text-foreground">
              Conflito detectado
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Este blueprint foi modificado por outra sessao desde a ultima leitura.
              Escolha como deseja prosseguir.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConflictReload}
                className="rounded-md border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Recarregar
              </button>
              <button
                type="button"
                onClick={handleConflictOverwrite}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Sobrescrever
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        clientSlug={CLIENT_SLUG}
        userId={user?.id ?? ''}
      />

      {drawerTarget && (
        <CommentOverlay
          clientSlug={config.slug}
          screenId={activeScreen.id}
          targetId={drawerTarget.targetId}
          targetLabel={drawerTarget.label}
          authorId={authorId}
          authorName={authorName}
          authorRole="operador"
          open={drawerOpen}
          onClose={handleCloseDrawer}
        />
      )}

      <CommentManager
        clientSlug={config.slug}
        open={managerOpen}
        onClose={handleCloseManager}
      />

      <button
        type="button"
        onClick={handleOpenScreenComments}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        style={{ background: 'var(--wf-accent)', color: 'var(--wf-accent-fg)' }}
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    </>
  )
}
