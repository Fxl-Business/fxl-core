import type { BlueprintConfig } from '../types/blueprint'
import { extractBlueprintSummary } from './blueprint-text'
import type { ScreenSummary } from './blueprint-text'

// ---------------------------------------------------------------------------
// Markdown generation
// ---------------------------------------------------------------------------

function screenToMarkdown(screen: ScreenSummary): string {
  const lines: string[] = []

  lines.push(`### ${screen.title}`)

  if (screen.filters && screen.filters.length > 0) {
    lines.push(`Filtros: ${screen.filters.join(', ')}`)
  }
  if (screen.periodType) {
    lines.push(`Periodo: ${screen.periodType}`)
  }

  lines.push('')
  lines.push('| Secao | Tipo | Campos Principais |')
  lines.push('|-------|------|-------------------|')

  for (const section of screen.sections) {
    const title = section.title ?? '-'
    const label = section.label
    const fields = section.keyFields.length > 0
      ? section.keyFields.join(', ')
      : '-'
    lines.push(`| ${title} | ${label} | ${fields} |`)
  }

  return lines.join('\n')
}

/**
 * Converts a BlueprintConfig to a structured markdown string.
 * The output is designed to be readable by both humans and Claude Code
 * as generation context.
 */
export function exportBlueprintMarkdown(config: BlueprintConfig): string {
  const summary = extractBlueprintSummary(config)

  const lines: string[] = []

  lines.push(`# Blueprint: ${summary.clientName}`)
  lines.push('')

  if (summary.description) {
    lines.push(summary.description)
    lines.push('')
  }

  lines.push('## Telas')
  lines.push('')

  for (let i = 0; i < summary.screens.length; i++) {
    lines.push(screenToMarkdown(summary.screens[i]))
    if (i < summary.screens.length - 1) {
      lines.push('')
      lines.push('---')
      lines.push('')
    }
  }

  lines.push('')

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Browser download utility
// ---------------------------------------------------------------------------

/**
 * Triggers a browser file download with the given content and filename.
 */
export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
