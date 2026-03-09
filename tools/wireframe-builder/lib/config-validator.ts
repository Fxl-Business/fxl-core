/**
 * Config Validator -- checks that a TechnicalConfig covers all sections
 * in a BlueprintConfig. Detects missing bindings, invalid references,
 * circular formulas, orphan bindings, and reports coverage percentage.
 */

import type { BlueprintConfig, BlueprintSection } from '../types/blueprint'
import type {
  TechnicalConfig,
  SectionBinding,
  ChartGridBinding,
  KpiGridBinding,
  CalculoCardBinding,
  ChartBinding,
  TableBinding,
} from '../types/technical'

// ─── Exported types ───────────────────────────────────────────────────────

export type ValidationError = {
  type:
    | 'missing-binding'
    | 'invalid-reference'
    | 'slug-mismatch'
    | 'orphan-binding'
    | 'circular-formula'
  screenId: string
  sectionIndex?: number
  sectionType?: string
  message: string
}

export type ValidationWarning = {
  type: 'info-block-unbound'
  screenId: string
  sectionIndex?: number
  message: string
}

export type ValidationResult = {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  coverage: { total: number; bound: number; percentage: number }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function findBinding(
  bindings: SectionBinding[],
  screenId: string,
  sectionIndex: number,
): SectionBinding | undefined {
  return bindings.find(
    (b) => b.screenId === screenId && b.sectionIndex === sectionIndex,
  )
}

/** Collect all fieldOrFormula references used in a binding. */
function collectBindingReferences(binding: SectionBinding): string[] {
  const refs: string[] = []

  switch (binding.sectionType) {
    case 'kpi-grid': {
      const b = binding as KpiGridBinding
      for (const item of b.items) {
        refs.push(item.fieldOrFormula)
        if (item.subExpression) refs.push(item.subExpression)
      }
      break
    }
    case 'calculo-card': {
      const b = binding as CalculoCardBinding
      for (const row of b.rows) {
        refs.push(row.fieldOrFormula)
      }
      break
    }
    case 'bar-line-chart':
    case 'donut-chart':
    case 'waterfall-chart':
    case 'pareto-chart': {
      const b = binding as ChartBinding
      refs.push(b.dataSource)
      break
    }
    case 'data-table':
    case 'drill-down-table':
    case 'clickable-table': {
      const b = binding as TableBinding
      refs.push(b.dataSource)
      for (const col of b.columns) {
        refs.push(col.fieldOrFormula)
      }
      break
    }
    case 'chart-grid': {
      const b = binding as ChartGridBinding
      for (const item of b.items) {
        refs.push(item.dataSource)
      }
      break
    }
    // upload-section, manual-input, saldo-banco, config-table, info-block
    // have no field/formula references
    default:
      break
  }

  return refs
}

/** Detect circular references in formula dependency graph via topological sort. */
function detectCircularFormulas(
  formulas: TechnicalConfig['formulas'],
): { hasCycle: boolean; cycle: string[] } {
  const adj = new Map<string, string[]>()
  for (const f of formulas) {
    adj.set(f.id, f.references.filter((ref) => formulas.some((ff) => ff.id === ref)))
  }

  const visited = new Set<string>()
  const inStack = new Set<string>()
  const cycle: string[] = []
  let hasCycle = false

  function dfs(node: string): void {
    if (hasCycle) return
    visited.add(node)
    inStack.add(node)

    const neighbors = adj.get(node) ?? []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor)
      } else if (inStack.has(neighbor)) {
        hasCycle = true
        cycle.push(neighbor, node)
        return
      }
    }

    inStack.delete(node)
  }

  for (const f of formulas) {
    if (!visited.has(f.id)) {
      dfs(f.id)
    }
    if (hasCycle) break
  }

  return { hasCycle, cycle }
}

// ─── Main validator ───────────────────────────────────────────────────────

export function validateConfig(
  blueprint: BlueprintConfig,
  technical: TechnicalConfig,
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  let totalSections = 0
  let boundSections = 0

  // 1. Slug match
  if (blueprint.slug !== technical.slug) {
    errors.push({
      type: 'slug-mismatch',
      screenId: '',
      message: `Slug mismatch: blueprint="${blueprint.slug}" technical="${technical.slug}"`,
    })
  }

  // Build lookup sets for field, formula, and report type IDs
  const fieldIds = new Set(technical.fields.map((f) => f.id))
  const formulaIds = new Set(technical.formulas.map((f) => f.id))
  const reportTypeIds = new Set(technical.reportTypes.map((rt) => rt.id))
  const allRefIds = new Set([...fieldIds, ...formulaIds, ...reportTypeIds])

  // 2. Section coverage -- walk all screens and sections
  for (const screen of blueprint.screens) {
    for (let i = 0; i < screen.sections.length; i++) {
      const section = screen.sections[i] as BlueprintSection
      const sectionType = section.type

      if (sectionType === 'info-block') {
        // Info blocks are static -- no binding needed, just a warning
        const binding = findBinding(technical.bindings, screen.id, i)
        if (!binding) {
          warnings.push({
            type: 'info-block-unbound',
            screenId: screen.id,
            sectionIndex: i,
            message: `Info block at ${screen.id}:${i} has no binding (expected for static content)`,
          })
        }
        continue
      }

      totalSections++
      const binding = findBinding(technical.bindings, screen.id, i)

      if (!binding) {
        errors.push({
          type: 'missing-binding',
          screenId: screen.id,
          sectionIndex: i,
          sectionType,
          message: `No binding found for ${sectionType} at ${screen.id}:${i}`,
        })
        continue
      }

      boundSections++

      // 3. ChartGrid recursion -- check nested items
      if (sectionType === 'chart-grid' && binding.sectionType === 'chart-grid') {
        const chartGridSection = section as { type: 'chart-grid'; items: BlueprintSection[] }
        const chartGridBinding = binding as ChartGridBinding

        for (let j = 0; j < chartGridSection.items.length; j++) {
          totalSections++
          if (j < chartGridBinding.items.length) {
            boundSections++

            // Validate chart-grid item references
            const itemRefs = [chartGridBinding.items[j].dataSource]
            for (const ref of itemRefs) {
              if (!allRefIds.has(ref)) {
                errors.push({
                  type: 'invalid-reference',
                  screenId: screen.id,
                  sectionIndex: i,
                  sectionType: `chart-grid.items[${j}]`,
                  message: `Chart-grid item references unknown field/formula "${ref}" at ${screen.id}:${i}[${j}]`,
                })
              }
            }
          } else {
            errors.push({
              type: 'missing-binding',
              screenId: screen.id,
              sectionIndex: i,
              sectionType: `chart-grid.items[${j}]`,
              message: `No binding for chart-grid item ${j} at ${screen.id}:${i}`,
            })
          }
        }
        // Already counted the parent as bound; deduct one total since parent is just a container
        totalSections--
        boundSections--
      }

      // 4. Field/formula reference validation
      const refs = collectBindingReferences(binding)
      for (const ref of refs) {
        if (!allRefIds.has(ref)) {
          errors.push({
            type: 'invalid-reference',
            screenId: screen.id,
            sectionIndex: i,
            sectionType,
            message: `Binding references unknown field/formula "${ref}" at ${screen.id}:${i}`,
          })
        }
      }
    }
  }

  // 4b. Validate formula references point to existing fields/formulas
  for (const formula of technical.formulas) {
    for (const ref of formula.references) {
      if (!allRefIds.has(ref)) {
        errors.push({
          type: 'invalid-reference',
          screenId: '',
          sectionType: 'formula',
          message: `Formula "${formula.id}" references unknown field/formula "${ref}"`,
        })
      }
    }
  }

  // 5. Circular formula detection
  const circularCheck = detectCircularFormulas(technical.formulas)
  if (circularCheck.hasCycle) {
    errors.push({
      type: 'circular-formula',
      screenId: '',
      message: `Circular reference detected in formula chain: ${circularCheck.cycle.join(' -> ')}`,
    })
  }

  // 6. Orphan binding detection
  const screenIds = new Set(blueprint.screens.map((s) => s.id))
  for (const binding of technical.bindings) {
    if (!screenIds.has(binding.screenId)) {
      errors.push({
        type: 'orphan-binding',
        screenId: binding.screenId,
        sectionIndex: binding.sectionIndex,
        sectionType: binding.sectionType,
        message: `Binding references non-existent screen "${binding.screenId}"`,
      })
      continue
    }

    const screen = blueprint.screens.find((s) => s.id === binding.screenId)
    if (screen && binding.sectionIndex >= screen.sections.length) {
      errors.push({
        type: 'orphan-binding',
        screenId: binding.screenId,
        sectionIndex: binding.sectionIndex,
        sectionType: binding.sectionType,
        message: `Binding index ${binding.sectionIndex} exceeds section count (${screen.sections.length}) for screen "${binding.screenId}"`,
      })
    }
  }

  // 7. Coverage calculation
  const percentage = totalSections > 0 ? Math.round((boundSections / totalSections) * 100) : 0

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    coverage: {
      total: totalSections,
      bound: boundSections,
      percentage,
    },
  }
}
