import { describe, it, expect } from 'vitest'
import { VERTICAL_TEMPLATES } from './vertical-templates'
import type { VerticalId } from './vertical-templates'
import { BlueprintConfigSchema } from './blueprint-schema'

describe('VERTICAL_TEMPLATES', () => {
  it('has keys financeiro, varejo, servicos', () => {
    const keys = Object.keys(VERTICAL_TEMPLATES).sort()
    expect(keys).toEqual(['financeiro', 'servicos', 'varejo'])
  })

  it('financeiro template has 10 screens', () => {
    expect(VERTICAL_TEMPLATES.financeiro.screens).toHaveLength(10)
  })

  it('varejo template has at least 4 screens', () => {
    expect(VERTICAL_TEMPLATES.varejo.screens.length).toBeGreaterThanOrEqual(4)
  })

  it('servicos template has at least 4 screens', () => {
    expect(VERTICAL_TEMPLATES.servicos.screens.length).toBeGreaterThanOrEqual(4)
  })

  it('every screen in every template has a non-empty id, title, and sections array', () => {
    for (const verticalId of Object.keys(VERTICAL_TEMPLATES) as VerticalId[]) {
      const template = VERTICAL_TEMPLATES[verticalId]
      for (const screen of template.screens) {
        expect(screen.id, `${verticalId} screen id`).toBeTruthy()
        expect(typeof screen.id).toBe('string')
        expect(screen.title, `${verticalId} screen title for ${screen.id}`).toBeTruthy()
        expect(typeof screen.title).toBe('string')
        expect(screen.sections.length, `${verticalId} screen ${screen.id} sections`).toBeGreaterThan(0)
      }
    }
  })

  describe('Zod validation', () => {
    for (const verticalId of ['financeiro', 'varejo', 'servicos'] as const) {
      it(`${verticalId} template passes BlueprintConfigSchema.parse()`, () => {
        const template = VERTICAL_TEMPLATES[verticalId]
        // parse() will throw if invalid
        const result = BlueprintConfigSchema.safeParse(template)
        if (!result.success) {
          // Produce helpful error output
          const issues = result.error.issues.map(i =>
            `  Path: ${i.path.join('.')} | ${i.message}`
          ).join('\n')
          throw new Error(`${verticalId} template failed Zod validation:\n${issues}`)
        }
        expect(result.success).toBe(true)
      })
    }
  })

  it('financeiro template has correct metadata', () => {
    const t = VERTICAL_TEMPLATES.financeiro
    expect(t.slug).toBe('template-financeiro')
    expect(t.label).toBe('Template Financeiro')
    expect(t.schemaVersion).toBe(1)
  })

  it('all screen ids are kebab-case', () => {
    for (const verticalId of Object.keys(VERTICAL_TEMPLATES) as VerticalId[]) {
      for (const screen of VERTICAL_TEMPLATES[verticalId].screens) {
        expect(screen.id).toMatch(/^[a-z][a-z0-9-]*$/)
      }
    }
  })
})
