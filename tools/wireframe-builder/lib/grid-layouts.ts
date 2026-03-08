import type { GridLayout, ScreenRow } from '../types/editor'
import type { BlueprintSection } from '../types/blueprint'

export const GRID_LAYOUTS: Record<GridLayout, { label: string; cols: string; cellCount: number }> = {
  '1':   { label: '1 coluna',  cols: 'grid-cols-1', cellCount: 1 },
  '2':   { label: '2 colunas', cols: 'grid-cols-2', cellCount: 2 },
  '3':   { label: '3 colunas', cols: 'grid-cols-3', cellCount: 3 },
  '2-1': { label: '2/3 + 1/3', cols: 'grid-cols-3', cellCount: 2 }, // first cell spans 2
  '1-2': { label: '1/3 + 2/3', cols: 'grid-cols-3', cellCount: 2 }, // second cell spans 2
}

export function getCellCount(layout: GridLayout): number {
  return GRID_LAYOUTS[layout].cellCount
}

/** Convert flat sections to single-column rows (for seed migration from .ts files) */
export function sectionsToRows(sections: BlueprintSection[]): ScreenRow[] {
  return sections.map(section => ({
    id: crypto.randomUUID(),
    layout: '1' as GridLayout,
    sections: [section],
  }))
}

/** Flatten rows back to sections array (for backward compat) */
export function rowsToSections(rows: ScreenRow[]): BlueprintSection[] {
  return rows.flatMap(row => row.sections)
}
