import type { BlueprintConfig, BlueprintScreen, BlueprintSection } from '../types/blueprint'
import type { BriefingConfig, BriefingModule } from '../types/briefing'
import { findBestRecipe } from './screen-recipes'
import type { ScreenRecipe } from './screen-recipes'
import { VERTICAL_TEMPLATES } from './vertical-templates'
import type { VerticalId } from './vertical-templates'
import { CURRENT_SCHEMA_VERSION } from './blueprint-migrations'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GenerationOptions = {
  vertical?: VerticalId
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a string to kebab-case.
 * 'DRE Gerencial' -> 'dre-gerencial'
 * 'Fluxo de Caixa Mensal' -> 'fluxo-de-caixa-mensal'
 */
export function toKebabCase(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')    // non-alphanumeric -> hyphen
    .replace(/^-+|-+$/g, '')         // trim leading/trailing hyphens
}

// ---------------------------------------------------------------------------
// buildScreenFromRecipe -- internal helper
// ---------------------------------------------------------------------------

/**
 * Build a full BlueprintScreen from a briefing module and a matched recipe.
 *
 * For each recipe section, starts with the recipe defaults and overlays
 * module-specific data where applicable (e.g., KPI labels from briefing).
 */
function buildScreenFromRecipe(
  mod: BriefingModule,
  recipe: ScreenRecipe,
  _briefing: BriefingConfig,
): BlueprintScreen {
  const screenId = toKebabCase(mod.name)

  const sections: BlueprintSection[] = recipe.sections.map((recipeSection) => {
    // Start with recipe defaults
    const base = { ...recipeSection.defaults } as BlueprintSection

    // Overlay module-specific data based on section type
    if (base.type === 'kpi-grid' && mod.kpis.length > 0) {
      // Replace KPI items with briefing module KPIs
      return {
        ...base,
        type: 'kpi-grid' as const,
        columns: Math.min(mod.kpis.length, 4),
        items: mod.kpis.map((kpi) => ({
          label: kpi,
          value: 'R$ 0',
          variation: '+0%',
          variationPositive: true,
        })),
      }
    }

    if (base.type === 'bar-line-chart') {
      return {
        ...base,
        title: base.title || mod.name,
      }
    }

    if (base.type === 'chart-grid') {
      return base
    }

    if (base.type === 'data-table') {
      return {
        ...base,
        title: base.title || `Detalhamento - ${mod.name}`,
      }
    }

    if (base.type === 'calculo-card') {
      return {
        ...base,
        title: base.title || `Calculo - ${mod.name}`,
      }
    }

    if (base.type === 'waterfall-chart') {
      return {
        ...base,
        title: base.title || `Composicao - ${mod.name}`,
      }
    }

    return base
  })

  return {
    id: screenId,
    title: mod.name,
    periodType: recipe.periodType,
    filters: recipe.suggestedFilters,
    hasCompareSwitch: recipe.hasCompareSwitch,
    sections,
  }
}

// ---------------------------------------------------------------------------
// generateBlueprint -- main export
// ---------------------------------------------------------------------------

/**
 * Pure function: converts a BriefingConfig into a valid BlueprintConfig.
 *
 * If `options.vertical` is set, starts from the corresponding vertical template
 * and merges generated screens (matching by id, appending if new).
 *
 * If no vertical, builds screens from scratch using findBestRecipe for each module.
 *
 * The resulting config has:
 * - slug = clientSlug
 * - label = briefing.companyInfo.name
 * - schemaVersion = CURRENT_SCHEMA_VERSION
 */
export function generateBlueprint(
  briefing: BriefingConfig,
  clientSlug: string,
  options?: GenerationOptions,
): BlueprintConfig {
  // Generate screens from briefing modules
  const generatedScreens: BlueprintScreen[] = briefing.modules.map((mod) => {
    const recipe = findBestRecipe(mod.name, briefing.companyInfo.segment)
    return buildScreenFromRecipe(mod, recipe, briefing)
  })

  let finalScreens: BlueprintScreen[]

  if (options?.vertical) {
    // Start from vertical template
    const template = VERTICAL_TEMPLATES[options.vertical]
    const baseScreens = structuredClone(template.screens)

    // Merge generated screens with template screens
    for (const genScreen of generatedScreens) {
      const existingIdx = baseScreens.findIndex((s) => s.id === genScreen.id)
      if (existingIdx !== -1) {
        // Overlay generated screen data onto template screen
        baseScreens[existingIdx] = {
          ...baseScreens[existingIdx],
          ...genScreen,
          // Keep template icon if generated screen doesn't have one
          icon: genScreen.icon ?? baseScreens[existingIdx].icon,
        }
      } else {
        // Append new screen
        baseScreens.push(genScreen)
      }
    }

    finalScreens = baseScreens
  } else {
    finalScreens = generatedScreens
  }

  return {
    slug: clientSlug,
    label: briefing.companyInfo.name,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    screens: finalScreens,
  }
}
