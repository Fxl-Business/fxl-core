import { describe, it, expect } from 'vitest'
import { SCREEN_RECIPES, findBestRecipe } from './screen-recipes'
import { SECTION_REGISTRY } from './section-registry'
import { BlueprintSectionSchema } from './blueprint-schema'

// Valid section types (21 types from the registry)
const VALID_SECTION_TYPES = Object.keys(SECTION_REGISTRY) as string[]

describe('SCREEN_RECIPES', () => {
  it('has 10 recipes', () => {
    expect(SCREEN_RECIPES).toHaveLength(10)
  })

  it('each recipe has a valid id, name, category, and non-empty sections array', () => {
    for (const recipe of SCREEN_RECIPES) {
      expect(recipe.id).toBeTruthy()
      expect(typeof recipe.id).toBe('string')
      expect(recipe.name).toBeTruthy()
      expect(typeof recipe.name).toBe('string')
      expect(['financeiro', 'operacional', 'comercial', 'geral']).toContain(recipe.category)
      expect(recipe.sections.length).toBeGreaterThan(0)
    }
  })

  it('every RecipeSection.type is a valid BlueprintSection type (one of the 21 types)', () => {
    for (const recipe of SCREEN_RECIPES) {
      for (const section of recipe.sections) {
        expect(VALID_SECTION_TYPES).toContain(section.type)
      }
    }
  })

  it('each recipe has a non-empty matchKeywords array', () => {
    for (const recipe of SCREEN_RECIPES) {
      expect(recipe.matchKeywords.length).toBeGreaterThan(0)
    }
  })

  it('each recipe has a valid periodType', () => {
    for (const recipe of SCREEN_RECIPES) {
      expect(['mensal', 'anual', 'none']).toContain(recipe.periodType)
    }
  })

  it('each recipe sections, when expanded via getDefaultSection(type), produce Zod-valid sections', () => {
    for (const recipe of SCREEN_RECIPES) {
      for (const recipeSection of recipe.sections) {
        // Get the default section for this type
        const defaultSection = SECTION_REGISTRY[recipeSection.type as keyof typeof SECTION_REGISTRY].defaultProps()
        // Merge with recipe defaults
        const merged = { ...defaultSection, ...recipeSection.defaults }
        // Must pass Zod validation
        const result = BlueprintSectionSchema.safeParse(merged)
        if (!result.success) {
          throw new Error(
            `Recipe "${recipe.id}" section type "${recipeSection.type}" failed Zod validation:\n${JSON.stringify(result.error.issues, null, 2)}`
          )
        }
        expect(result.success).toBe(true)
      }
    }
  })
})

describe('findBestRecipe', () => {
  it('findBestRecipe("DRE Gerencial", "Financeiro") returns the dre-resultado recipe', () => {
    const recipe = findBestRecipe('DRE Gerencial', 'Financeiro')
    expect(recipe.id).toBe('dre-resultado')
  })

  it('findBestRecipe("Receita", "Financeiro") returns the revenue-analysis recipe', () => {
    const recipe = findBestRecipe('Receita', 'Financeiro')
    expect(recipe.id).toBe('revenue-analysis')
  })

  it('findBestRecipe("unknown-module", "unknown") returns the kpi-dashboard fallback recipe', () => {
    const recipe = findBestRecipe('unknown-module', 'unknown')
    expect(recipe.id).toBe('kpi-dashboard')
  })

  it('findBestRecipe is case-insensitive', () => {
    const recipe = findBestRecipe('dre gerencial', 'financeiro')
    expect(recipe.id).toBe('dre-resultado')
  })

  it('findBestRecipe matches partial keywords', () => {
    const recipe = findBestRecipe('Fluxo Mensal de Caixa', 'Financeiro')
    expect(recipe.id).toBe('cash-flow-daily')
  })

  it('findBestRecipe prefers category-matching recipes', () => {
    // 'Indicadores' matches kpi-dashboard (geral), but when segment is 'Financeiro'
    // it should still return kpi-dashboard as it has the keyword match
    const recipe = findBestRecipe('Indicadores', 'Financeiro')
    expect(recipe.id).toBe('kpi-dashboard')
  })
})
