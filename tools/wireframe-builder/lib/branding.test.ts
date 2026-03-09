import { describe, it, expect } from 'vitest'
import { brandingToWfOverrides } from './branding'
import { DEFAULT_BRANDING } from '../types/branding'
import type { BrandingConfig } from '../types/branding'

describe('brandingToWfOverrides', () => {
  it('returns --wf-accent equal to primaryColor', () => {
    const branding: BrandingConfig = {
      ...DEFAULT_BRANDING,
      primaryColor: '#3B82F6',
    }
    const overrides = brandingToWfOverrides(branding)
    expect(overrides['--wf-accent' as keyof typeof overrides]).toBe('#3B82F6')
  })

  it('returns --wf-sidebar-bg as darkened primaryColor', () => {
    const branding: BrandingConfig = {
      ...DEFAULT_BRANDING,
      primaryColor: '#3B82F6', // blue-500
    }
    const overrides = brandingToWfOverrides(branding)
    // Sidebar bg should be darker than the primary color
    const sidebarBg = overrides['--wf-sidebar-bg' as keyof typeof overrides] as string
    expect(sidebarBg).toBeDefined()
    expect(sidebarBg).not.toBe('#3B82F6') // should be darkened
    // The darkened color should still be a valid hex
    expect(sidebarBg).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('returns light sidebar fg for dark primary (DEFAULT_BRANDING gray-700)', () => {
    // DEFAULT_BRANDING.primaryColor = '#374151' (gray-700, L ~27)
    // After darkening by 20, it becomes very dark (L ~7)
    // So sidebar fg should be light (#fafaf9)
    const overrides = brandingToWfOverrides(DEFAULT_BRANDING)
    expect(overrides['--wf-sidebar-fg' as keyof typeof overrides]).toBe('#fafaf9')
  })

  it('returns dark sidebar fg for very light primary (#F5F5F4)', () => {
    const branding: BrandingConfig = {
      ...DEFAULT_BRANDING,
      primaryColor: '#F5F5F4', // very light (L ~96)
    }
    const overrides = brandingToWfOverrides(branding)
    // After darkening by 20, L ~76 which is still > 50
    // So sidebar fg should be dark (#1c1917)
    expect(overrides['--wf-sidebar-fg' as keyof typeof overrides]).toBe('#1c1917')
  })

  it('returns --wf-sidebar-active equal to primaryColor', () => {
    const branding: BrandingConfig = {
      ...DEFAULT_BRANDING,
      primaryColor: '#dc2626',
    }
    const overrides = brandingToWfOverrides(branding)
    expect(overrides['--wf-sidebar-active' as keyof typeof overrides]).toBe('#dc2626')
  })
})
