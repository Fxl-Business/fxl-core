import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { BlueprintScreen, BlueprintSection } from '../types/blueprint'
import type { GridLayout, ScreenRow } from '../types/editor'
import type { Comment } from '../types/comments'
import { GRID_LAYOUTS, getCellCount, sectionsToRows } from '../lib/grid-layouts'
import WireframeFilterBar from './WireframeFilterBar'
import SectionRenderer from './sections/SectionRenderer'
import SectionWrapper from './SectionWrapper'
import EditableSectionWrapper from './editor/EditableSectionWrapper'
import AddSectionButton from './editor/AddSectionButton'
import GridLayoutPicker from './editor/GridLayoutPicker'

type Props = {
  screen: BlueprintScreen
  clientSlug?: string
  comments?: Comment[]
  onOpenComments?: (targetId: string, label: string) => void
  // Brand color props (optional for backward compat)
  chartColors?: string[]
  brandPrimary?: string
  // Edit mode props (all optional for backward compat)
  editMode?: boolean
  selectedSection?: { rowIndex: number; cellIndex: number } | null
  onSelectSection?: (rowIndex: number, cellIndex: number) => void
  onDeleteSection?: (rowIndex: number, cellIndex: number) => void
  onAddSection?: (rowIndex: number, section: BlueprintSection) => void
  onAddToCell?: (rowIndex: number, cellIndex: number, section: BlueprintSection) => void
  onReorderRows?: (oldIndex: number, newIndex: number) => void
  onChangeLayout?: (rowIndex: number, layout: GridLayout) => void
  rows?: ScreenRow[]
}

// Sortable row wrapper for drag-and-drop reordering
function SortableRow({
  id,
  editMode,
  children,
}: {
  id: string
  editMode: boolean
  children: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !editMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  if (!editMode) {
    return <>{children}</>
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

function getCellClassName(layout: GridLayout, cellIndex: number): string {
  if (layout === '2-1') {
    return cellIndex === 0 ? 'col-span-2' : 'col-span-1'
  }
  if (layout === '1-2') {
    return cellIndex === 0 ? 'col-span-1' : 'col-span-2'
  }
  return ''
}

export default function BlueprintRenderer({
  screen,
  clientSlug,
  comments,
  onOpenComments,
  chartColors,
  brandPrimary,
  editMode,
  selectedSection,
  onSelectSection,
  onDeleteSection,
  onAddSection,
  onAddToCell,
  onReorderRows,
  onChangeLayout,
  rows: rowsProp,
}: Props) {
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod, setComparePeriod] = useState(
    screen.periodType === 'anual' ? '2025' : 'Fev/2026',
  )

  const showFilterBar = screen.hasCompareSwitch || screen.filters.length > 0
  const hasCommentSupport = clientSlug && comments && onOpenComments

  // Determine rows: prop > screen.rows > auto-wrap flat sections
  const rows: ScreenRow[] = rowsProp ?? screen.rows ?? sectionsToRows(screen.sections)
  const rowIds = rows.map((r) => r.id)

  // Sensors for DndContext -- only active in edit mode
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !onReorderRows) return

    const oldIndex = rows.findIndex((r) => r.id === active.id)
    const newIndex = rows.findIndex((r) => r.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    onReorderRows(oldIndex, newIndex)
  }

  // Track flat section index for comment targetId (screen:sectionIndex pattern)
  let flatSectionIndex = 0

  return (
    <div className="space-y-6">
      {showFilterBar && (
        <WireframeFilterBar
          filters={screen.filters}
          showCompareSwitch={screen.hasCompareSwitch}
          compareMode={compareMode}
          onCompareModeChange={setCompareMode}
          comparePeriodType={screen.periodType === 'anual' ? 'anual' : 'mensal'}
          comparePeriod={comparePeriod}
          onComparePeriodChange={setComparePeriod}
        />
      )}

      <DndContext
        sensors={editMode ? sensors : undefined}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={rowIds}
          strategy={verticalListSortingStrategy}
        >
          {rows.map((row, rowIndex) => {
            const gridCols = GRID_LAYOUTS[row.layout].cols

            return (
              <SortableRow
                key={row.id}
                id={row.id}
                editMode={!!editMode}
              >
                <div className="space-y-6">
                  {/* Row container */}
                  <div className="relative">
                    {/* Grid layout picker (edit mode only) */}
                    {editMode && onChangeLayout && (
                      <div className="absolute -left-10 top-0 z-10">
                        <GridLayoutPicker
                          current={row.layout}
                          onChange={(layout) => onChangeLayout(rowIndex, layout)}
                        />
                      </div>
                    )}

                    <div className={`grid ${gridCols} gap-6`}>
                      {row.sections.map((section, cellIndex) => {
                        const currentFlatIndex = flatSectionIndex
                        flatSectionIndex++

                        const isSelected =
                          selectedSection?.rowIndex === rowIndex &&
                          selectedSection?.cellIndex === cellIndex

                        const cellClass = getCellClassName(row.layout, cellIndex)

                        const sectionEl = (
                          <SectionRenderer
                            section={section}
                            compareMode={compareMode}
                            comparePeriod={comparePeriod}
                            chartColors={chartColors}
                            brandPrimary={brandPrimary}
                          />
                        )

                        // Layer comments if supported
                        const withComments = hasCommentSupport ? (
                          <SectionWrapper
                            screenId={screen.id}
                            sectionIndex={currentFlatIndex}
                            clientSlug={clientSlug}
                            comments={comments}
                            onOpenComments={onOpenComments}
                          >
                            {sectionEl}
                          </SectionWrapper>
                        ) : (
                          sectionEl
                        )

                        // Layer edit wrapper if in edit mode
                        if (editMode) {
                          return (
                            <div key={`${row.id}-${cellIndex}`} className={cellClass}>
                              <EditableSectionWrapper
                                id={`${row.id}-cell-${cellIndex}`}
                                editMode
                                selected={isSelected}
                                onSelect={() => onSelectSection?.(rowIndex, cellIndex)}
                                onDelete={() => onDeleteSection?.(rowIndex, cellIndex)}
                              >
                                {withComments}
                              </EditableSectionWrapper>
                            </div>
                          )
                        }

                        return (
                          <div key={`${row.id}-${cellIndex}`} className={cellClass}>
                            {withComments}
                          </div>
                        )
                      })}

                      {/* Empty cell placeholders for multi-column layouts (edit mode) */}
                      {editMode && onAddToCell && (() => {
                        const totalCells = getCellCount(row.layout)
                        const filledCells = row.sections.length
                        if (filledCells >= totalCells) return null
                        return Array.from({ length: totalCells - filledCells }, (_, i) => {
                          const cellIndex = filledCells + i
                          const cellClass = getCellClassName(row.layout, cellIndex)
                          return (
                            <div key={`${row.id}-empty-${cellIndex}`} className={cellClass}>
                              <AddSectionButton
                                onAdd={(section) => onAddToCell(rowIndex, cellIndex, section)}
                                variant="cell"
                              />
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>

                  {/* Add section button between rows (edit mode only) */}
                  {editMode && onAddSection && (
                    <AddSectionButton
                      onAdd={(section) => onAddSection(rowIndex, section)}
                    />
                  )}
                </div>
              </SortableRow>
            )
          })}
        </SortableContext>
      </DndContext>

      {/* Add section at the very end when there are no rows */}
      {editMode && onAddSection && rows.length === 0 && (
        <AddSectionButton
          onAdd={(section) => onAddSection(-1, section)}
        />
      )}
    </div>
  )
}
