import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { MessageSquare, Loader2, PanelLeft, Plus, Pin } from 'lucide-react'
import { useUser } from '@clerk/react'
import { arrayMove } from '@dnd-kit/sortable'
import CommentOverlay from '@tools/wireframe-builder/components/CommentOverlay'
import CommentManager from '@tools/wireframe-builder/components/CommentManager'
import WireframeHeader from '@tools/wireframe-builder/components/WireframeHeader'
import BlueprintRenderer from '@tools/wireframe-builder/components/BlueprintRenderer'
import AdminToolbar from '@tools/wireframe-builder/components/editor/AdminToolbar'
import ShareModal from '@tools/wireframe-builder/components/editor/ShareModal'
import PropertyPanel from '@tools/wireframe-builder/components/editor/PropertyPanel'
import HeaderPropertyPanel from '@tools/wireframe-builder/components/editor/HeaderPropertyPanel'
import SidebarPropertyPanel from '@tools/wireframe-builder/components/editor/SidebarPropertyPanel'
import FilterPropertyPanel from '@tools/wireframe-builder/components/editor/FilterPropertyPanel'
import FilterBarActionsPanel from '@tools/wireframe-builder/components/editor/FilterBarActionsPanel'
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
import { BrandingProvider } from '@tools/wireframe-builder/lib/branding-context'
import { sectionsToRows, getCellCount } from '@tools/wireframe-builder/lib/grid-layouts'
import { getCommentsByScreen } from '@tools/wireframe-builder/lib/comments'
import { toTargetId } from '@tools/wireframe-builder/types/comments'
import type { Comment } from '@tools/wireframe-builder/types/comments'
import { SIDEBAR_WIDGET_REGISTRY } from '@tools/wireframe-builder/lib/sidebar-widget-registry'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import WorkspaceSwitcherWidget from '@tools/wireframe-builder/components/sidebar-widgets/WorkspaceSwitcherWidget'
import UserMenuWidget from '@tools/wireframe-builder/components/sidebar-widgets/UserMenuWidget'
import type {
  BlueprintConfig,
  BlueprintScreen,
  BlueprintSection,
  HeaderConfig,
  SidebarGroup,
  SidebarWidget,
} from '@tools/wireframe-builder/types/blueprint'
import type { EditModeState, FilterBarActionElement, GridLayout, HeaderElementType, ScreenRow, SidebarElementSelection } from '@tools/wireframe-builder/types/editor'
import type { FilterOption } from '@tools/wireframe-builder/components/WireframeFilterBar'

// Dynamic branding import map (extend as clients are added)
const brandingMap: Record<string, () => Promise<{ default: BrandingConfig }>> = {
  'financeiro-conta-azul': () => import('@clients/financeiro-conta-azul/wireframe/branding.config'),
}

// ---------------------------------------------------------------------------
// partitionScreensByGroups -- module-level helper for group rendering
// ---------------------------------------------------------------------------

type ScreenEntry = { screen: BlueprintScreen; originalIndex: number }

type ScreenGroup = {
  label: string | null
  screens: ScreenEntry[]
}

type SidebarPartition = {
  pinnedTop: ScreenEntry[]
  ungrouped: ScreenEntry[]
  groups: (ScreenGroup & { label: string; groupIndex: number })[]
  pinnedBottom: ScreenEntry[]
}

function partitionScreensByGroups(
  screens: BlueprintScreen[],
  groups?: SidebarGroup[],
  pinnedTop?: string[],
  pinnedBottom?: string[],
): ScreenGroup[] {
  const pinnedTopSet = new Set(pinnedTop ?? [])
  const pinnedBottomSet = new Set(pinnedBottom ?? [])
  const pinnedIds = new Set([...pinnedTopSet, ...pinnedBottomSet])

  const allEntries = screens.map((s, i) => ({ screen: s, originalIndex: i }))

  // Pinned screens at top
  const topEntries = (pinnedTop ?? [])
    .map((id) => allEntries.find((e) => e.screen.id === id))
    .filter((x): x is ScreenEntry => x != null)

  // Pinned screens at bottom
  const bottomEntries = (pinnedBottom ?? [])
    .map((id) => allEntries.find((e) => e.screen.id === id))
    .filter((x): x is ScreenEntry => x != null)

  const groupedIds = new Set((groups ?? []).flatMap((g) => g.screenIds))

  // Ungrouped, non-pinned screens (appear FIRST, before groups)
  const ungrouped = allEntries.filter(
    ({ screen }) => !groupedIds.has(screen.id) && !pinnedIds.has(screen.id),
  )

  // Build groups (filtering out pinned screens from each group)
  const groupEntries: ScreenGroup[] = (groups ?? []).map((g) => ({
    label: g.label,
    screens: g.screenIds
      .filter((id) => !pinnedIds.has(id))
      .map((id) => allEntries.find((e) => e.screen.id === id))
      .filter((x): x is ScreenEntry => x != null),
  }))

  // Assemble: pinned-top → ungrouped → groups → pinned-bottom
  const result: ScreenGroup[] = []
  if (topEntries.length > 0) result.push({ label: null, screens: topEntries })
  if (ungrouped.length > 0) result.push({ label: null, screens: ungrouped })
  for (const g of groupEntries) {
    if (g.screens.length > 0) result.push(g)
  }
  if (bottomEntries.length > 0) result.push({ label: null, screens: bottomEntries })

  if (result.length === 0 && allEntries.length > 0) {
    return [{ label: null, screens: allEntries }]
  }
  return result
}

/** Structured partition for edit mode (knows pinned vs ungrouped vs grouped) */
function partitionScreensForEdit(
  screens: BlueprintScreen[],
  groups?: SidebarGroup[],
  pinnedTop?: string[],
  pinnedBottom?: string[],
): SidebarPartition {
  const pinnedTopSet = new Set(pinnedTop ?? [])
  const pinnedBottomSet = new Set(pinnedBottom ?? [])
  const pinnedIds = new Set([...pinnedTopSet, ...pinnedBottomSet])

  const allEntries = screens.map((s, i) => ({ screen: s, originalIndex: i }))

  const topEntries = (pinnedTop ?? [])
    .map((id) => allEntries.find((e) => e.screen.id === id))
    .filter((x): x is ScreenEntry => x != null)

  const bottomEntries = (pinnedBottom ?? [])
    .map((id) => allEntries.find((e) => e.screen.id === id))
    .filter((x): x is ScreenEntry => x != null)

  const groupedIds = new Set((groups ?? []).flatMap((g) => g.screenIds))

  const ungrouped = allEntries.filter(
    ({ screen }) => !groupedIds.has(screen.id) && !pinnedIds.has(screen.id),
  )

  const groupList = (groups ?? []).map((g, i) => ({
    label: g.label,
    groupIndex: i,
    screens: g.screenIds
      .filter((id) => !pinnedIds.has(id))
      .map((id) => allEntries.find((e) => e.screen.id === id))
      .filter((x): x is ScreenEntry => x != null),
  }))

  return {
    pinnedTop: topEntries,
    ungrouped,
    groups: groupList,
    pinnedBottom: bottomEntries,
  }
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
    selectedHeaderElement: null,
    selectedSidebarElement: null,
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

  // AdminToolbar collapse state
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false)

  // Filter inline editing
  const [selectedFilterIndex, setSelectedFilterIndex] = useState<number | null>(null)

  // Filter bar action editing
  const [selectedFilterBarAction, setSelectedFilterBarAction] = useState<FilterBarActionElement | null>(null)

  // Widget picker popover
  const [widgetPopoverOpen, setWidgetPopoverOpen] = useState(false)

  // Branding update handler (must be before early returns)
  const handleBrandingUpdate = useCallback((partial: Partial<BrandingConfig>) => {
    setBranding((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...partial }
      setChartPalette(getChartPalette(next))
      return next
    })
  }, [])

  const brandingCtx = useMemo(() => branding ? {
    branding,
    updateBranding: handleBrandingUpdate,
  } : null, [branding, handleBrandingUpdate])

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

  // Widget rendering — extract widgets by zone from sidebar config
  const sidebarWidgets = useMemo(() => {
    const widgets = activeConfig?.sidebar?.widgets ?? []
    return {
      header: widgets.filter((w: SidebarWidget) => SIDEBAR_WIDGET_REGISTRY[w.type]?.zone === 'header'),
      footer: widgets.filter((w: SidebarWidget) => SIDEBAR_WIDGET_REGISTRY[w.type]?.zone === 'footer'),
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConfig?.sidebar?.widgets])

  // Structured sidebar partition for edit mode (pinned + ungrouped + groups)
  const sidebarPartition = useMemo(
    () =>
      partitionScreensForEdit(
        screens,
        activeConfig?.sidebar?.groups,
        activeConfig?.sidebar?.pinnedTop,
        activeConfig?.sidebar?.pinnedBottom,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [screens, activeConfig?.sidebar?.groups, activeConfig?.sidebar?.pinnedTop, activeConfig?.sidebar?.pinnedBottom],
  )

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
        selectedHeaderElement: null,
        selectedSidebarElement: null,
      })
    }
  }

  function exitEditMode() {
    setWorkingConfig(null)
    setStaleWarning(false)
    setSelectedFilterIndex(null)
    setSelectedFilterBarAction(null)
    setEditMode({
      active: false,
      dirty: false,
      saving: false,
      selectedSection: null,
      selectedHeaderElement: null,
      selectedSidebarElement: null,
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

  function updateWorkingConfig(
    updater: (config: BlueprintConfig) => BlueprintConfig,
  ) {
    setWorkingConfig((prev) => {
      if (!prev) return prev
      return updater(prev)
    })
    setEditMode((prev) => ({ ...prev, dirty: true }))
  }

  function handleHeaderUpdate(updater: (header: HeaderConfig) => HeaderConfig) {
    updateWorkingConfig((cfg) => ({
      ...cfg,
      header: updater(cfg.header ?? {}),
    }))
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
      selectedHeaderElement: null,
      selectedSidebarElement: null,
    }))
    setSelectedFilterIndex(null)
    setSelectedFilterBarAction(null)
  }

  function handleSelectHeaderElement(element: HeaderElementType) {
    setEditMode((prev) => ({
      ...prev,
      selectedSection: null,
      selectedHeaderElement: element,
      selectedSidebarElement: null,
    }))
    setSelectedFilterIndex(null)
    setSelectedFilterBarAction(null)
  }

  function handleSelectSidebarElement(selection: SidebarElementSelection) {
    setEditMode((prev) => ({
      ...prev,
      selectedSection: null,
      selectedHeaderElement: null,
      selectedSidebarElement: selection,
    }))
    setSelectedFilterIndex(null)
    setSelectedFilterBarAction(null)
  }

  function handlePinScreen(screenId: string, position: 'top' | 'bottom') {
    updateWorkingConfig((cfg) => {
      const topIds = (cfg.sidebar?.pinnedTop ?? []).filter((id) => id !== screenId)
      const bottomIds = (cfg.sidebar?.pinnedBottom ?? []).filter((id) => id !== screenId)
      if (position === 'top') topIds.push(screenId)
      else bottomIds.push(screenId)
      // Remove from any group
      const groups = (cfg.sidebar?.groups ?? []).map((g) => ({
        ...g,
        screenIds: g.screenIds.filter((id) => id !== screenId),
      }))
      return {
        ...cfg,
        sidebar: { ...cfg.sidebar, pinnedTop: topIds, pinnedBottom: bottomIds, groups },
      }
    })
  }

  function handleUnpinScreen(screenId: string) {
    updateWorkingConfig((cfg) => ({
      ...cfg,
      sidebar: {
        ...cfg.sidebar,
        pinnedTop: (cfg.sidebar?.pinnedTop ?? []).filter((id) => id !== screenId),
        pinnedBottom: (cfg.sidebar?.pinnedBottom ?? []).filter((id) => id !== screenId),
      },
    }))
  }

  function getScreenPinnedPosition(screenId: string): 'top' | 'bottom' | null {
    if (activeConfig?.sidebar?.pinnedTop?.includes(screenId)) return 'top'
    if (activeConfig?.sidebar?.pinnedBottom?.includes(screenId)) return 'bottom'
    return null
  }

  function handleDeleteWidget(actualIndex: number) {
    updateWorkingConfig((cfg) => ({
      ...cfg,
      sidebar: {
        ...cfg.sidebar,
        widgets: (cfg.sidebar?.widgets ?? []).filter((_, i) => i !== actualIndex),
      },
    }))
    if (
      editMode.selectedSidebarElement?.type === 'widget' &&
      editMode.selectedSidebarElement.widgetIndex === actualIndex
    ) {
      setEditMode((prev) => ({ ...prev, selectedSidebarElement: null }))
    }
  }

  function handleDeleteGroup(groupIndex: number) {
    updateWorkingConfig((cfg) => ({
      ...cfg,
      sidebar: {
        ...cfg.sidebar,
        groups: (cfg.sidebar?.groups ?? []).filter((_, i) => i !== groupIndex),
      },
    }))
    if (
      editMode.selectedSidebarElement?.type === 'group' &&
      editMode.selectedSidebarElement.groupIndex === groupIndex
    ) {
      setEditMode((prev) => ({ ...prev, selectedSidebarElement: null }))
    }
  }

  function handleFilterClick(filterIndex: number) {
    setSelectedFilterIndex(filterIndex)
    setSelectedFilterBarAction(null)
    setEditMode((prev) => ({
      ...prev,
      selectedSection: null,
      selectedHeaderElement: null,
      selectedSidebarElement: null,
    }))
  }

  function handleFilterDelete(filterIndex: number) {
    updateWorkingScreen((screen) => ({
      ...screen,
      filters: screen.filters.filter((_, i) => i !== filterIndex),
    }))
    if (selectedFilterIndex === filterIndex) {
      setSelectedFilterIndex(null)
    } else if (selectedFilterIndex !== null && filterIndex < selectedFilterIndex) {
      setSelectedFilterIndex(selectedFilterIndex - 1)
    }
  }

  function handleFilterPropertyChange(updated: FilterOption) {
    if (selectedFilterIndex === null) return
    updateWorkingScreen((screen) => ({
      ...screen,
      filters: screen.filters.map((f, i) => i === selectedFilterIndex ? updated : f),
    }))
  }

  function handleAddFilter(filter: FilterOption) {
    updateWorkingScreen((screen) => {
      if (screen.filters.some((f) => f.key === filter.key)) return screen
      return { ...screen, filters: [...screen.filters, { ...filter }] }
    })
    // Auto-select the newly added filter for immediate editing
    const currentLength = activeScreen?.filters?.length ?? 0
    setSelectedFilterIndex(currentLength)
    setSelectedFilterBarAction(null)
    setEditMode((prev) => ({
      ...prev,
      selectedSection: null,
      selectedHeaderElement: null,
      selectedSidebarElement: null,
    }))
  }

  function handleSelectFilterBarAction(action: FilterBarActionElement) {
    setSelectedFilterBarAction(action)
    setSelectedFilterIndex(null)
    setEditMode((prev) => ({
      ...prev,
      selectedSection: null,
      selectedHeaderElement: null,
      selectedSidebarElement: null,
    }))
  }

  function handleFilterBarActionsChange(updated: import('@tools/wireframe-builder/types/blueprint').FilterBarActionsConfig) {
    updateWorkingScreen((screen) => ({
      ...screen,
      filterBarActions: updated,
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
      setEditMode((prev) => ({ ...prev, selectedSection: null, selectedHeaderElement: null, selectedSidebarElement: null }))
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
    setEditMode((prev) => ({ ...prev, selectedSection: null, selectedHeaderElement: null, selectedSidebarElement: null }))
    setSelectedFilterIndex(null)
    setSelectedFilterBarAction(null)
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
      selectedHeaderElement: null,
      selectedSidebarElement: null,
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

  // Layout height constants — only app header is above sidebar
  const appHeaderH = user && !toolbarCollapsed ? 40 : 0

  return (
    <>
      <WireframeThemeProvider wfOverrides={branding ? brandingToWfOverrides(branding) : undefined}>
      <BrandingProvider value={brandingCtx}>
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
            {/* Sidebar header: widget or label + toggle */}
            <div
              style={{
                height: 44,
                display: 'flex',
                alignItems: 'center',
                padding: effectiveSidebarCollapsed ? '0 8px' : '0 8px 0 12px',
                justifyContent: effectiveSidebarCollapsed ? 'center' : 'space-between',
                borderBottom: '1px solid var(--wf-sidebar-border)',
                flexShrink: 0,
                gap: 4,
              }}
            >
              {/* Expanded: no widgets — show plain label */}
              {!effectiveSidebarCollapsed && sidebarWidgets.header.length === 0 && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--wf-sidebar-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                }}>
                  {activeConfig?.label ?? 'Dashboard'}
                </span>
              )}
              {/* Expanded: workspace-switcher widget */}
              {!effectiveSidebarCollapsed && sidebarWidgets.header.length > 0 && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  {sidebarWidgets.header.map((widget, idx) => {
                    const actualIndex = (activeConfig?.sidebar?.widgets ?? []).findIndex(
                      (w) => w.type === widget.type,
                    )
                    const isSelected =
                      editMode.selectedSidebarElement?.type === 'widget' &&
                      editMode.selectedSidebarElement.widgetIndex === actualIndex
                    if (widget.type !== 'workspace-switcher') return null
                    const widgetContent = (
                      <div
                        key={`header-widget-${idx}`}
                        style={{
                          position: 'relative',
                          borderRadius: 6,
                          border: isSelected
                            ? '2px solid var(--wf-accent)'
                            : editMode.active
                              ? '2px solid transparent'
                              : 'none',
                          cursor: editMode.active ? 'pointer' : 'default',
                          transition: 'border-color 150ms ease',
                        }}
                        onClick={
                          editMode.active
                            ? () => handleSelectSidebarElement({ type: 'widget', widgetIndex: actualIndex })
                            : undefined
                        }
                        onMouseEnter={(e) => {
                          if (editMode.active && !isSelected) {
                            e.currentTarget.style.borderColor = 'var(--wf-sidebar-muted)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (editMode.active && !isSelected) {
                            e.currentTarget.style.borderColor = 'transparent'
                          }
                        }}
                      >
                        <WorkspaceSwitcherWidget
                          label={widget.label}
                          collapsed={false}
                        />
                      </div>
                    )
                    return editMode.active ? (
                      <ContextMenu key={`header-widget-${idx}`}>
                        <ContextMenuTrigger asChild>
                          {widgetContent}
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-40 bg-[#0f172a] border-[var(--wf-sidebar-border)] text-white">
                          <ContextMenuItem
                            className="text-xs hover:bg-white/10 focus:bg-white/10 focus:text-white"
                            onClick={() => handleSelectSidebarElement({ type: 'widget', widgetIndex: actualIndex })}
                          >
                            Editar
                          </ContextMenuItem>
                          <ContextMenuSeparator className="bg-[var(--wf-sidebar-border)]" />
                          <ContextMenuItem
                            className="text-xs text-red-400 hover:bg-white/10 focus:bg-white/10 focus:text-red-400"
                            onClick={() => handleDeleteWidget(actualIndex)}
                          >
                            Excluir
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ) : widgetContent
                  })}
                </div>
              )}
              {/* Collapsed: header widget icon-only button */}
              {effectiveSidebarCollapsed && sidebarWidgets.header.length > 0 && (() => {
                const firstWidget = sidebarWidgets.header[0]
                const reg = SIDEBAR_WIDGET_REGISTRY[firstWidget.type]
                const Icon = reg?.icon
                return Icon ? (
                  <button
                    type="button"
                    title={reg.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--wf-sidebar-muted)',
                      cursor: 'default',
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: 18, height: 18 }} />
                  </button>
                ) : null
              })()}
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
              {effectiveSidebarCollapsed ? (
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
              ) : editMode.active ? (
                // Expanded edit mode: structured rendering with pinned + ungrouped + groups
                <>
                  {(() => {
                    const partition = sidebarPartition

                    const renderScreenManager = (
                      entries: ScreenEntry[],
                      groupIndex?: number,
                    ) => (
                      <ScreenManager
                        screens={entries.map((s) => s.screen)}
                        activeIndex={entries.findIndex((s) => s.originalIndex === safeActiveIndex)}
                        editMode={true}
                        onSelectScreen={(localIdx) => handleScreenSelect(entries[localIdx].originalIndex)}
                        onAddScreen={handleAddScreen}
                        onDeleteScreen={(localIdx) => handleDeleteScreen(entries[localIdx].originalIndex)}
                        onRenameScreen={(localIdx, title) => handleRenameScreen(entries[localIdx].originalIndex, title)}
                        onReorderScreens={
                          groupIndex !== undefined
                            ? (reorderedLocalScreens) => {
                                const newScreenIds = reorderedLocalScreens.map((s) => s.id)
                                updateWorkingConfig((cfg) => ({
                                  ...cfg,
                                  sidebar: {
                                    ...cfg.sidebar,
                                    groups: (cfg.sidebar?.groups ?? []).map((g, i) =>
                                      i === groupIndex ? { ...g, screenIds: newScreenIds } : g
                                    ),
                                  },
                                }))
                              }
                            : handleReorderScreens
                        }
                        getPinnedPosition={getScreenPinnedPosition}
                        onPinScreen={handlePinScreen}
                        onUnpinScreen={handleUnpinScreen}
                      />
                    )

                    return (
                      <>
                        {/* Pinned top */}
                        {partition.pinnedTop.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{
                              padding: '4px 12px',
                              fontSize: 9,
                              fontWeight: 600,
                              textTransform: 'uppercase' as const,
                              letterSpacing: '0.08em',
                              color: 'var(--wf-accent)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              opacity: 0.7,
                            }}>
                              <Pin style={{ width: 10, height: 10 }} />
                              FIXADO NO TOPO
                            </div>
                            {renderScreenManager(partition.pinnedTop)}
                          </div>
                        )}

                        {/* Ungrouped screens (default: on top, before groups) */}
                        {partition.ungrouped.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            {renderScreenManager(partition.ungrouped)}
                          </div>
                        )}

                        {/* Groups with context menu */}
                        {partition.groups.map((group) => {
                          const gi = group.groupIndex
                          const isGroupSelected =
                            editMode.selectedSidebarElement?.type === 'group' &&
                            editMode.selectedSidebarElement.groupIndex === gi
                          return (
                            <div key={`group-${gi}`} style={{ marginBottom: 8 }}>
                              <ContextMenu>
                                <ContextMenuTrigger asChild>
                                  <div
                                    style={{
                                      padding: '8px 12px 4px',
                                      fontSize: 10,
                                      fontWeight: 600,
                                      textTransform: 'uppercase' as const,
                                      letterSpacing: '0.08em',
                                      color: 'var(--wf-sidebar-muted)',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      borderRadius: 4,
                                      border: isGroupSelected
                                        ? '2px solid var(--wf-accent)'
                                        : '2px solid transparent',
                                      cursor: 'pointer',
                                      transition: 'border-color 150ms ease',
                                    }}
                                    onClick={() => handleSelectSidebarElement({ type: 'group', groupIndex: gi })}
                                    onMouseEnter={(e) => {
                                      if (!isGroupSelected) {
                                        e.currentTarget.style.borderColor = 'var(--wf-sidebar-muted)'
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isGroupSelected) {
                                        e.currentTarget.style.borderColor = 'transparent'
                                      }
                                    }}
                                  >
                                    <span>{group.label}</span>
                                  </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-40 bg-[#0f172a] border-[var(--wf-sidebar-border)] text-white">
                                  <ContextMenuItem
                                    className="text-xs hover:bg-white/10 focus:bg-white/10 focus:text-white"
                                    onClick={() => handleSelectSidebarElement({ type: 'group', groupIndex: gi })}
                                  >
                                    Renomear
                                  </ContextMenuItem>
                                  <ContextMenuSeparator className="bg-[var(--wf-sidebar-border)]" />
                                  <ContextMenuItem
                                    className="text-xs text-red-400 hover:bg-white/10 focus:bg-white/10 focus:text-red-400"
                                    onClick={() => handleDeleteGroup(gi)}
                                  >
                                    Excluir
                                  </ContextMenuItem>
                                </ContextMenuContent>
                              </ContextMenu>
                              {group.screens.length > 0 && renderScreenManager(group.screens, gi)}
                            </div>
                          )
                        })}

                        {/* Inline add buttons at the bottom of the nav */}
                        <div style={{ display: 'flex', gap: 4, paddingTop: 8, paddingBottom: 4 }}>
                          {/* + Grupo */}
                          <button
                            type="button"
                            onClick={() => {
                              const currentGroups = activeConfig?.sidebar?.groups ?? []
                              updateWorkingConfig((cfg) => ({
                                ...cfg,
                                sidebar: {
                                  ...cfg.sidebar,
                                  groups: [...(cfg.sidebar?.groups ?? []), { label: 'Novo Grupo', screenIds: [] }],
                                },
                              }))
                              handleSelectSidebarElement({ type: 'group', groupIndex: currentGroups.length })
                            }}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4,
                              height: 28,
                              fontSize: 11,
                              fontWeight: 500,
                              borderRadius: 5,
                              border: '1px solid rgba(255,255,255,0.12)',
                              background: 'transparent',
                              color: 'var(--wf-sidebar-muted)',
                              cursor: 'pointer',
                              transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
                              fontFamily: 'Inter, sans-serif',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                              e.currentTarget.style.color = '#fff'
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.color = 'var(--wf-sidebar-muted)'
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                            }}
                          >
                            <Plus style={{ width: 12, height: 12 }} />
                            Grupo
                          </button>
                          {/* + Widget with Popover picker */}
                          {(() => {
                            const currentWidgetTypes = new Set(
                              (activeConfig?.sidebar?.widgets ?? []).map((w) => w.type),
                            )
                            const availableWidgets = Object.values(SIDEBAR_WIDGET_REGISTRY).filter(
                              (reg) => !currentWidgetTypes.has(reg.type),
                            )
                            const isMaxed = availableWidgets.length === 0
                            return (
                              <Popover open={widgetPopoverOpen} onOpenChange={setWidgetPopoverOpen}>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    disabled={isMaxed}
                                    style={{
                                      flex: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 4,
                                      height: 28,
                                      fontSize: 11,
                                      fontWeight: 500,
                                      borderRadius: 5,
                                      border: '1px solid rgba(255,255,255,0.12)',
                                      background: 'transparent',
                                      color: isMaxed ? 'rgba(255,255,255,0.2)' : 'var(--wf-sidebar-muted)',
                                      cursor: isMaxed ? 'not-allowed' : 'pointer',
                                      opacity: isMaxed ? 0.5 : 1,
                                      transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
                                      fontFamily: 'Inter, sans-serif',
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isMaxed) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                                        e.currentTarget.style.color = '#fff'
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isMaxed) {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.color = 'var(--wf-sidebar-muted)'
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                                      }
                                    }}
                                  >
                                    <Plus style={{ width: 12, height: 12 }} />
                                    Widget
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  side="right"
                                  align="end"
                                  style={{
                                    padding: 4,
                                    minWidth: 180,
                                    background: '#0f172a',
                                    border: '1px solid var(--wf-sidebar-border)',
                                    borderRadius: 8,
                                  }}
                                >
                                  {availableWidgets.map((reg) => {
                                    const WidgetIcon = reg.icon
                                    return (
                                      <button
                                        key={reg.type}
                                        type="button"
                                        onClick={() => {
                                          updateWorkingConfig((cfg) => ({
                                            ...cfg,
                                            sidebar: {
                                              ...cfg.sidebar,
                                              widgets: [...(cfg.sidebar?.widgets ?? []), reg.defaultProps()],
                                            },
                                          }))
                                          const newIndex = (activeConfig?.sidebar?.widgets ?? []).length
                                          handleSelectSidebarElement({ type: 'widget', widgetIndex: newIndex })
                                          setWidgetPopoverOpen(false)
                                        }}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 8,
                                          width: '100%',
                                          padding: '6px 10px',
                                          fontSize: 12,
                                          borderRadius: 5,
                                          border: 'none',
                                          background: 'transparent',
                                          color: '#fff',
                                          cursor: 'pointer',
                                          fontFamily: 'Inter, sans-serif',
                                          textAlign: 'left' as const,
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = 'transparent'
                                        }}
                                      >
                                        <WidgetIcon style={{ width: 16, height: 16, color: 'var(--wf-sidebar-muted)', flexShrink: 0 }} />
                                        {reg.label}
                                      </button>
                                    )
                                  })}
                                </PopoverContent>
                              </Popover>
                            )
                          })()}
                        </div>
                      </>
                    )
                  })()}
                </>
              ) : (
                // Expanded view mode: grouped rendering with headings
                <>
                  {partitionScreensByGroups(screens, activeConfig?.sidebar?.groups, activeConfig?.sidebar?.pinnedTop, activeConfig?.sidebar?.pinnedBottom).map((group, gi, allGroups) => {
                    return (
                      <div key={gi} style={{ marginBottom: gi < allGroups.length - 1 ? 8 : 0 }}>
                        {group.label && (
                          <div
                            style={{
                              padding: '8px 12px 4px',
                              fontSize: 10,
                              fontWeight: 600,
                              textTransform: 'uppercase' as const,
                              letterSpacing: '0.08em',
                              color: 'var(--wf-sidebar-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderRadius: 4,
                              border: 'none',
                              cursor: 'default',
                            }}
                          >
                            <span>{group.label}</span>
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
                    )
                  })}
                </>
              )}
            </nav>

            {/* Pinned bottom screens — between nav and footer */}
            {editMode.active && !effectiveSidebarCollapsed && sidebarPartition.pinnedBottom.length > 0 && (
              <div style={{
                padding: '4px 8px',
                borderTop: '1px solid var(--wf-sidebar-border)',
                flexShrink: 0,
              }}>
                <div style={{
                  padding: '4px 12px',
                  fontSize: 9,
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em',
                  color: 'var(--wf-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  opacity: 0.7,
                }}>
                  <Pin style={{ width: 10, height: 10 }} />
                  FIXADO NO RODAPE
                </div>
                <ScreenManager
                  screens={sidebarPartition.pinnedBottom.map((s) => s.screen)}
                  activeIndex={sidebarPartition.pinnedBottom.findIndex((s) => s.originalIndex === safeActiveIndex)}
                  editMode={true}
                  onSelectScreen={(localIdx) => handleScreenSelect(sidebarPartition.pinnedBottom[localIdx].originalIndex)}
                  onAddScreen={handleAddScreen}
                  onDeleteScreen={(localIdx) => handleDeleteScreen(sidebarPartition.pinnedBottom[localIdx].originalIndex)}
                  onRenameScreen={(localIdx, title) => handleRenameScreen(sidebarPartition.pinnedBottom[localIdx].originalIndex, title)}
                  onReorderScreens={handleReorderScreens}
                  getPinnedPosition={getScreenPinnedPosition}
                  onPinScreen={handlePinScreen}
                  onUnpinScreen={handleUnpinScreen}
                />
              </div>
            )}

            {/* Footer */}
            {sidebarWidgets.footer.length > 0 ? (
              // User menu widget(s) in footer zone — handles collapsed rendering internally
              sidebarWidgets.footer.map((widget, idx) => {
                const actualIndex = (activeConfig?.sidebar?.widgets ?? []).findIndex(
                  (w) => w.type === widget.type,
                )
                const isWidgetSelected =
                  editMode.selectedSidebarElement?.type === 'widget' &&
                  editMode.selectedSidebarElement.widgetIndex === actualIndex
                if (widget.type !== 'user-menu') return null
                const footerWidgetContent = (
                  <div
                    key={`footer-widget-${idx}`}
                    style={{
                      position: 'relative',
                      borderRadius: 6,
                      margin: effectiveSidebarCollapsed ? 0 : '0 4px 4px',
                      border: isWidgetSelected
                        ? '2px solid var(--wf-accent)'
                        : editMode.active
                          ? '2px solid transparent'
                          : 'none',
                      cursor: editMode.active ? 'pointer' : 'default',
                      transition: 'border-color 150ms ease',
                    }}
                    onClick={
                      editMode.active
                        ? () => handleSelectSidebarElement({ type: 'widget', widgetIndex: actualIndex })
                        : undefined
                    }
                    onMouseEnter={(e) => {
                      if (editMode.active && !isWidgetSelected) {
                        e.currentTarget.style.borderColor = 'var(--wf-sidebar-muted)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (editMode.active && !isWidgetSelected) {
                        e.currentTarget.style.borderColor = 'transparent'
                      }
                    }}
                  >
                    <UserMenuWidget
                      label={widget.name}
                      role={widget.role}
                      collapsed={effectiveSidebarCollapsed}
                    />
                  </div>
                )
                return editMode.active && !effectiveSidebarCollapsed ? (
                  <ContextMenu key={`footer-widget-${idx}`}>
                    <ContextMenuTrigger asChild>
                      {footerWidgetContent}
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-40 bg-[#0f172a] border-[var(--wf-sidebar-border)] text-white">
                      <ContextMenuItem
                        className="text-xs hover:bg-white/10 focus:bg-white/10 focus:text-white"
                        onClick={() => handleSelectSidebarElement({ type: 'widget', widgetIndex: actualIndex })}
                      >
                        Editar
                      </ContextMenuItem>
                      <ContextMenuSeparator className="bg-[var(--wf-sidebar-border)]" />
                      <ContextMenuItem
                        className="text-xs text-red-400 hover:bg-white/10 focus:bg-white/10 focus:text-red-400"
                        onClick={() => handleDeleteWidget(actualIndex)}
                      >
                        Excluir
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ) : footerWidgetContent
              })
            ) : (
              // Default status footer (existing behavior) — clickable in edit mode
              !effectiveSidebarCollapsed && (() => {
                const isFooterSelected = editMode.selectedSidebarElement?.type === 'footer'
                return (
                  <div
                    style={{
                      padding: 12,
                      margin: '0 12px 12px',
                      borderRadius: 8,
                      border: isFooterSelected
                        ? '2px solid var(--wf-accent)'
                        : editMode.active
                          ? '2px solid transparent'
                          : '1px solid var(--wf-sidebar-border)',
                      flexShrink: 0,
                      cursor: editMode.active ? 'pointer' : 'default',
                      transition: 'border-color 150ms ease',
                    }}
                    onClick={
                      editMode.active
                        ? () => handleSelectSidebarElement({ type: 'footer' })
                        : undefined
                    }
                    onMouseEnter={(e) => {
                      if (editMode.active && !isFooterSelected) {
                        e.currentTarget.style.borderColor = 'var(--wf-sidebar-muted)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (editMode.active && !isFooterSelected) {
                        e.currentTarget.style.borderColor = editMode.active ? 'transparent' : 'var(--wf-sidebar-border)'
                      }
                    }}
                  >
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
                )
              })()
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
              brandLabel={activeConfig?.header?.brandLabel ?? activeConfig?.label}
              showLogo={activeConfig?.header?.showLogo}
              showPeriodSelector={activeConfig?.header?.showPeriodSelector}
              showUserIndicator={activeConfig?.header?.showUserIndicator}
              periodType={activeConfig?.header?.periodType}
              actions={activeConfig?.header?.actions}
              editMode={editMode.active}
              selectedElement={editMode.selectedHeaderElement}
              onSelectElement={handleSelectHeaderElement}
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
                onFilterClick={handleFilterClick}
                onFilterDelete={handleFilterDelete}
                onAddFilter={handleAddFilter}
                filterBarActions={activeScreen.filterBarActions}
                selectedFilterBarAction={selectedFilterBarAction}
                onFilterBarActionClick={handleSelectFilterBarAction}
              />
            </div>
          </main>
          </div>
        </div>
      </BrandingProvider>
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

      <HeaderPropertyPanel
        open={editMode.selectedHeaderElement !== null}
        elementType={editMode.selectedHeaderElement}
        headerConfig={activeConfig?.header ?? {}}
        configLabel={activeConfig?.label ?? 'Dashboard'}
        onUpdate={handleHeaderUpdate}
        onClose={() =>
          setEditMode((prev) => ({ ...prev, selectedHeaderElement: null }))
        }
      />

      <SidebarPropertyPanel
        open={editMode.selectedSidebarElement !== null}
        selection={editMode.selectedSidebarElement}
        sidebarConfig={workingConfig?.sidebar ?? activeConfig?.sidebar ?? {}}
        screens={screens}
        onClose={() =>
          setEditMode((prev) => ({ ...prev, selectedSidebarElement: null }))
        }
        onUpdateConfig={(updater) => {
          updateWorkingConfig((cfg) => ({
            ...cfg,
            sidebar: updater(cfg.sidebar ?? {}),
          }))
        }}
      />

      <FilterPropertyPanel
        open={selectedFilterIndex !== null}
        filter={selectedFilterIndex !== null ? (activeScreen?.filters?.[selectedFilterIndex] ?? null) : null}
        onClose={() => setSelectedFilterIndex(null)}
        onChange={handleFilterPropertyChange}
        onDelete={() => {
          if (selectedFilterIndex !== null) handleFilterDelete(selectedFilterIndex)
        }}
      />

      <FilterBarActionsPanel
        open={selectedFilterBarAction !== null}
        actionElement={selectedFilterBarAction}
        config={activeScreen?.filterBarActions ?? {}}
        onClose={() => setSelectedFilterBarAction(null)}
        onChange={handleFilterBarActionsChange}
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
