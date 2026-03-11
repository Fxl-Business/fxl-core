import { describe, it, expect } from 'vitest'
import { brandingToWfOverrides, hexToHsl, darken } from './branding'
import { DEFAULT_BRANDING } from '../types/branding'

describe('brandingToWfOverrides', () => {
  it('returns --wf-primary from branding.primaryColor', () => {
    const overrides = brandingToWfOverrides(DEFAULT_BRANDING)
    expect((overrides as Record<string, string>)['--wf-primary']).toBe(DEFAULT_BRANDING.primaryColor)
  })

  it('returns exactly one override key', () => {
    const overrides = brandingToWfOverrides(DEFAULT_BRANDING)
    expect(Object.keys(overrides)).toHaveLength(1)
  })

  it('uses custom primaryColor when provided', () => {
    const overrides = brandingToWfOverrides({ ...DEFAULT_BRANDING, primaryColor: '#1B6B93' })
    expect((overrides as Record<string, string>)['--wf-primary']).toBe('#1B6B93')
  })
})

describe('hexToHsl', () => {
  it('converts pure white to [0, 0, 100]', () => {
    expect(hexToHsl('#ffffff')).toEqual([0, 0, 100])
  })

  it('converts pure black to [0, 0, 0]', () => {
    expect(hexToHsl('#000000')).toEqual([0, 0, 0])
  })

  it('handles 3-char hex shorthand', () => {
    const [h, s, l] = hexToHsl('#fff')
    expect(h).toBe(0)
    expect(s).toBe(0)
    expect(l).toBe(100)
  })
})

describe('darken', () => {
  it('reduces lightness of a color', () => {
    const original = hexToHsl('#3B82F6')
    const darkened = hexToHsl(darken('#3B82F6', 20))
    expect(darkened[2]).toBeLessThan(original[2])
  })

  it('does not go below 0 lightness', () => {
    const result = hexToHsl(darken('#000000', 50))
    expect(result[2]).toBe(0)
  })
})
