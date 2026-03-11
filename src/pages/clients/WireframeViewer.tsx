import { useCallback, useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { MessageSquare, Loader2, PanelLeft } from 'lucide-react'
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
import { getIconComponent } from '@tools/wireframe-builder/components/editor/IconPicker'
import { toast } from 'sonner'
import {
  loadBlueprint as loadBlueprintFromDb,
  saveBlueprint as saveBlueprintToDb,
  checkForUpdates,
} from '@tools/wireframe-builder/lib/blueprint-store'
import {
  resolveBranding,
  getChartPalette,
  getFontLinks,
  brandingToWfOverrides,
} from '@tools/wireframe-builder/lib/branding'
import { DEFAULT_BRANDING } from '@tools/wireframe-builder/types/branding'
import type { BrandingConfig } from '@tools/wireframe-builder/types/branding'
import { WireframeThemeProvider } from '@tools/wireframe-builder/lib/wireframe-theme'
import { sectionsToRows, getCellCount } from '@tools/wireframe-builder/lib/grid-layouts'
import { getCommentsByScreen } from '@tools/wireframe-builder/lib/comments'
import { toTargetId } from '@tools/wireframe-builder/types/comments'
import type { Comment } from '@tools/wireframe-builder/types/comments'
import type {
  BlueprintConfig,
  BlueprintScreen,
  BlueprintSection,
  SidebarGroup,
} from '@tools/wireframe-builder/types/blueprint'
import type { EditModeState, GridLayout, ScreenRow } from '@tools/wireframe-builder/types/editor'

// Dynamic branding import map (extend as clients are added)
const brandingMap: Record<string, () => Promise<{ default: BrandingConfig }>> = {
  'financeiro-conta-azul': () => import('@clients/financeiro-conta-azul/wireframe/branding.config'),
}

// ---------------------------------------------------------------------------
// partitionScreensByGroups -- module-level helper for group rendering
// ---------------------------------------------------------------------------

type ScreenGroup = {
  label: string | null
  screens: { screen: BlueprintScreen; originalIndex: number }[]
}

function partitionScreensByGroups(
  screens: BlueprintScreen[],
  groups?: SidebarGroup[],
): ScreenGroup[] {
  if (!groups || groups.length === 0) {
    return [{ label: null, screens: screens.map((s, i) => ({ screen: s, originalIndex: i })) }]
  }
  const grouped: ScreenGroup[] = groups.map((g) => ({
    label: g.label,
    screens: g.screenIds
      .map((id) => {
        const idx = screens.findIndex((s) => s.id === id)
        return idx !== -1 ? { screen: screens[idx], originalIndex: idx } : null
      })
      .filter((x): x is { screen: BlueprintScreen; originalIndex: number } => x !== null),
  }))
  const groupedIds = new Set(groups.flatMap((g) => g.screenIds))
  const ungrouped = screens
    .map((s, i) => ({ screen: s, originalIndex: i }))
    .filter(({ screen }) => !groupedIds.has(screen.id))
  if (ungrouped.length > 0) grouped.push({ label: null, screens: ungrouped })
  return grouped.filter((g) => g.screens.length > 0)
}

/**
 * Generic parametric wireframe viewer.
 * Resolves blueprint + branding from Supabase by :clientSlug route param.
 */
export default function WireframeViewer({ clientSlug: clientSlugProp }: { clientSlug?: string }) {
  const params = useParams<{ clientSlug: string }>()
  const clientSlug = clientSlugProp ?? params.clientSlug

  if (!clientSlug) {
    return <Navigate to="/" replace />
  }

  return <WireframeViewerInner clientSlug={clientSlug} />
}

// ---------------------------------------------------------------------------
// Inner component receives guaranteed clientSlug string -- no hook ordering issues
// ---------------------------------------------------------------------------

function WireframeViewerInner({ clientSlug }: { clientSlug: string }) {
  const { user } = useUser()

  // Dynamic branding resolution
  const [branding, setBranding] = useState<BrandingConfig | null>(null)
  const [chartPalette, setChartPalette] = useState<string[]>([])

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

  // Sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const SIDEBAR_EXPANDED = 240
  const SIDEBAR_COLLAPSED = 52
  // Auto-expand when edit mode is active (DnD handles require visible items)
  const effectiveSidebarCollapsed = sidebarCollapsed && !editMode.active
  const sidebarWidth = effectiveSidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

  // Comments
  const [comments, setComments] = useState<Comment[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTarget, setDrawerTarget] = useState<{
    targetId: string
    label: string
  } | null>(null)
  const [managerOpen, setManagerOpen] = useState(false)

  // --- Dynamic branding resolution ---

  useEffect(() => {
    async function loadBranding() {
      const brandLoader = brandingMap[clientSlug]
      if (brandLoader) {
        try {
          const brandMod = await brandLoader()
          const resolved = resolveBranding(brandMod.default)
          setBranding(resolved)
          setChartPalette(getChartPalette(resolved))
        } catch {
          // Branding load failed -- use defaults silently
          const resolved = resolveBranding(DEFAULT_BRANDING)
          setBranding(resolved)
          setChartPalette(getChartPalette(resolved))
        }
      } else {
        // No custom branding for this client -- use defaults
        const resolved = resolveBranding(DEFAULT_BRANDING)
        setBranding(resolved)
        setChartPalette(getChartPalette(resolved))
      }
    }
    loadBranding()
  }, [clientSlug])

  // --- Data loading ---

  useEffect(() => {
    async function init() {
      try {
        const result = await loadBlueprintFromDb(clientSlug)
        if (!result) {
          setLoadError('Nenhum blueprint encontrado para este cliente.')
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
  }, [clientSlug])

  // --- Font loading ---

  useEffect(() => {
    if (!branding) return

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
  }, [branding])

  // --- Stale data polling (active in edit mode only) ---

  useEffect(() => {
    if (!editMode.active || !lastUpdatedAt) return

    const interval = setInterval(async () => {
      try {
        const remoteUpdatedAt = await checkForUpdates(clientSlug)
        if (remoteUpdatedAt && remoteUpdatedAt !== lastUpdatedAt) {
          setStaleWarning(true)
        }
      } catch {
        // Polling failure is non-critical -- silently ignore
      }
    }, 30_000)

    return () => clearInterval(interval)
  }, [editMode.active, lastUpdatedAt, clientSlug])

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
        clientSlug,
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
      const result = await loadBlueprintFromDb(clientSlug)
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
        clientSlug,
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

  if (loading || !branding) {
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
          <p style={{ fontSize: 14, color: '#757575', margin: '0 0 16px' }}>
            {loadError ?? 'Nenhum blueprint encontrado para este cliente.'}
          </p>
          <a
            href="/"
            style={{
              fontSize: 13,
              color: '#1A237E',
              textDecoration: 'underline',
            }}
          >
            Voltar ao inicio
          </a>
        </div>
      </div>
    )
  }

  // AdminToolbar collapse state
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false)

  // Layout height constants — only app header is above sidebar
  const appHeaderH = user && !toolbarCollapsed ? 40 : 0

  return (
    <>
      <WireframeThemeProvider wfOverrides={branding ? brandingToWfOverrides(branding) : undefined}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            fontFamily: `${branding.bodyFont}, Inter, sans-serif`,
            background: 'var(--wf-canvas)',
          }}
        >
          {/* App chrome header — edit, comments, share, theme toggle, user */}
          {user && (
            <AdminToolbar
              screenTitle={activeScreen.title}
              editMode={editMode.active}
              dirty={editMode.dirty}
              saving={editMode.saving}
              collapsed={toolbarCollapsed}
              onToggleCollapse={() => setToolbarCollapsed((v) => !v)}
              onToggleEdit={handleToggleEdit}
              onSave={handleSave}
              onOpenComments={handleOpenScreenComments}
              onOpenShare={() => setShareOpen(true)}
              userDisplayName={user.fullName ?? user.firstName ?? undefined}
              userRole="Operador"
            />
          )}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Sidebar */}
          <aside
            style={{
              width: sidebarWidth,
              minWidth: sidebarWidth,
              transition: 'width 150ms ease',
              overflow: 'hidden',
              background: 'var(--wf-sidebar-bg)',
              color: 'var(--wf-sidebar-fg)',
              display: 'flex',
              flexDirection: 'column',
              height: `calc(100vh - ${appHeaderH}px)`,
              position: 'fixed',
              left: 0,
              top: appHeaderH,
              borderRight: '1px solid var(--wf-sidebar-border)',
            }}
          >
            {/* Sidebar header: label + toggle */}
            <div
              style={{
                height: 44,
                display: 'flex',
                alignItems: 'center',
                padding: effectiveSidebarCollapsed ? '0 8px' : '0 16px',
                justifyContent: effectiveSidebarCollapsed ? 'center' : 'space-between',
                borderBottom: '1px solid var(--wf-sidebar-border)',
                flexShrink: 0,
              }}
            >
              {!effectiveSidebarCollapsed && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--wf-sidebar-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {activeConfig?.label ?? 'Dashboard'}
                </span>
              )}
              <button
                type="button"
                aria-label={effectiveSidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
                onClick={() => setSidebarCollapsed((c) => !c)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--wf-sidebar-muted)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 150ms ease, color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1e293b'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--wf-sidebar-muted)'
                }}
              >
                <PanelLeft style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Navigation items */}
            <nav style={{ flex: 1, padding: effectiveSidebarCollapsed ? '8px 4px' : '8px', overflowY: 'auto' }}>
              {editMode.active ? (
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
              ) : effectiveSidebarCollapsed ? (
                // Collapsed: icon-only centered buttons
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {screens.map((screen, index) => {
                    const Icon = getIconComponent(screen.icon ?? 'layout-dashboard')
                    const isActive = index === safeActiveIndex
                    return (
                      <button
                        key={screen.id}
                        type="button"
                        title={screen.title}
                        onClick={() => handleScreenSelect(index)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 36,
                          height: 36,
                          borderRadius: 6,
                          border: 'none',
                          background: isActive ? 'var(--wf-accent-muted)' : 'transparent',
                          color: isActive ? 'var(--wf-accent)' : 'var(--wf-sidebar-muted)',
                          cursor: 'pointer',
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
                        {Icon && <Icon style={{ width: 18, height: 18 }} />}
                      </button>
                    )
                  })}
                </div>
              ) : (
                // Expanded: grouped rendering with headings
                partitionScreensByGroups(screens, activeConfig?.sidebar?.groups).map((group, gi) => (
                  <div key={gi} style={{ marginBottom: gi < partitionScreensByGroups(screens, activeConfig?.sidebar?.groups).length - 1 ? 8 : 0 }}>
                    {group.label && (
                      <div style={{
                        padding: '8px 12px 4px',
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.08em',
                        color: 'var(--wf-sidebar-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {group.label}
                      </div>
                    )}
                    <ScreenManager
                      screens={group.screens.map((s) => s.screen)}
                      activeIndex={group.screens.findIndex((s) => s.originalIndex === safeActiveIndex)}
                      editMode={false}
                      onSelectScreen={(localIdx) => handleScreenSelect(group.screens[localIdx].originalIndex)}
                      onAddScreen={handleAddScreen}
                      onDeleteScreen={(localIdx) => handleDeleteScreen(group.screens[localIdx].originalIndex)}
                      onRenameScreen={(localIdx, title) => handleRenameScreen(group.screens[localIdx].originalIndex, title)}
                      onReorderScreens={handleReorderScreens}
                    />
                  </div>
                ))
              )}
            </nav>

            {/* Footer */}
            {!effectiveSidebarCollapsed && (
              <div style={{ padding: 12, margin: '0 12px 12px', borderRadius: 8, border: '1px solid var(--wf-sidebar-border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ height: 8, width: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--wf-sidebar-fg)', lineHeight: 1.3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Sistema Ativo
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--wf-sidebar-muted)', lineHeight: 1.3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeConfig?.sidebar?.footer ?? 'Desenvolvido por FXL'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Area principal */}
          <main
            style={{
              flex: 1,
              marginLeft: sidebarWidth,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Wireframe chrome header — logo, search, actions, user chip */}
            <WireframeHeader
              title={activeScreen.title}
              logoUrl={branding.logoUrl}
              showLogo={activeConfig?.header?.showLogo}
            />
            {staleWarning && (
              <div className="mx-4 mt-2 flex items-center justify-between rounded-md border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
                <span>Este blueprint foi atualizado externamente. Suas edicoes podem causar conflito ao salvar.</span>
                <button
                  type="button"
                  onClick={async () => {
                    const result = await loadBlueprintFromDb(clientSlug)
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
        clientSlug={clientSlug}
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
