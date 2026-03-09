import type React from 'react'
import type { BrandingConfig } from '../types/branding'
import { DEFAULT_BRANDING } from '../types/branding'

// ---------------------------------------------------------------------------
// Color math helpers (HSL space)
// ---------------------------------------------------------------------------

/** Parse hex (#RRGGBB or #RGB) to [H 0-360, S 0-100, L 0-100]. */
export function hexToHsl(hex: string): [number, number, number] {
  const raw = hex.replace('#', '')
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw

  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return [0, 0, Math.round(l * 100)]

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

/** Convert HSL back to hex string. */
function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100
  const lNorm = l / 100

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let r = 0
  let g = 0
  let b = 0

  if (h < 60) {
    r = c; g = x; b = 0
  } else if (h < 120) {
    r = x; g = c; b = 0
  } else if (h < 180) {
    r = 0; g = c; b = x
  } else if (h < 240) {
    r = 0; g = x; b = c
  } else if (h < 300) {
    r = x; g = 0; b = c
  } else {
    r = c; g = 0; b = x
  }

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** Lighten a hex color by `amount` lightness units (0-100). */
function lighten(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex)
  return hslToHex(h, s, Math.min(100, l + amount))
}

/** Darken a hex color by `amount` lightness units (0-100). */
export function darken(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex)
  return hslToHex(h, s, Math.max(0, l - amount))
}

/** Linearly interpolate between two hex colors in HSL space. ratio 0 = hex1, 1 = hex2. */
function mixColors(hex1: string, hex2: string, ratio: number): string {
  const [h1, s1, l1] = hexToHsl(hex1)
  const [h2, s2, l2] = hexToHsl(hex2)

  // Shortest-arc hue interpolation
  let dh = h2 - h1
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360

  const h = ((h1 + dh * ratio) % 360 + 360) % 360

  return hslToHex(
    Math.round(h),
    Math.round(s1 + (s2 - s1) * ratio),
    Math.round(l1 + (l2 - l1) * ratio),
  )
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Merge partial branding config with defaults. Undefined fields fall back to DEFAULT_BRANDING. */
export function resolveBranding(config?: Partial<BrandingConfig>): BrandingConfig {
  return { ...DEFAULT_BRANDING, ...config }
}

/**
 * Derive extended palette from the 3 base brand colors.
 *
 * Returns:
 * - primaryLight / primaryDark — for hover / active states
 * - chart4, chart5 — mixed colors to fill out a 5-color chart palette
 */
export function derivePalette(branding: BrandingConfig) {
  return {
    primaryLight: lighten(branding.primaryColor, 30),
    primaryDark: darken(branding.primaryColor, 20),
    chart4: mixColors(branding.primaryColor, branding.secondaryColor, 0.5),
    chart5: mixColors(branding.secondaryColor, branding.accentColor, 0.5),
  }
}

/**
 * Generate a CSS custom properties style object for container injection.
 *
 * Usage:
 * ```tsx
 * <div style={{ ...otherStyles, ...brandingToCssVars(branding) }}>
 * ```
 *
 * All variables use the `--brand-*` prefix to avoid collision with
 * the FXL Core app theme (--primary, --accent, etc. from Phase 02.3).
 */
export function brandingToCssVars(branding: BrandingConfig): React.CSSProperties {
  const palette = derivePalette(branding)

  return {
    '--brand-primary': branding.primaryColor,
    '--brand-secondary': branding.secondaryColor,
    '--brand-accent': branding.accentColor,
    '--brand-primary-light': palette.primaryLight,
    '--brand-primary-dark': palette.primaryDark,
    '--brand-chart-1': branding.primaryColor,
    '--brand-chart-2': branding.secondaryColor,
    '--brand-chart-3': branding.accentColor,
    '--brand-chart-4': palette.chart4,
    '--brand-chart-5': palette.chart5,
    '--brand-heading-font': branding.headingFont,
    '--brand-body-font': branding.bodyFont,
  } as React.CSSProperties
}

/**
 * Return an array of 5 resolved hex strings for recharts components.
 *
 * Recharts SVG fill/stroke attributes DO support CSS var(). This function
 * is still useful for branding resolution where resolved hex values give
 * more control (e.g., dynamically changing brand colors at runtime).
 *
 * Order: primary, secondary, accent, primary-secondary mix, secondary-accent mix.
 */
export function getChartPalette(branding: BrandingConfig): string[] {
  const palette = derivePalette(branding)
  return [
    branding.primaryColor,
    branding.secondaryColor,
    branding.accentColor,
    palette.chart4,
    palette.chart5,
  ]
}

/**
 * Return Google Fonts CSS link URLs for non-default fonts.
 *
 * Inter is the app default and is already loaded globally — skip it.
 * Returns an empty array when both fonts are Inter.
 *
 * Usage: inject `<link rel="stylesheet" href={url} />` via useEffect.
 */
export function getFontLinks(branding: BrandingConfig): string[] {
  const fonts = new Set<string>()

  if (branding.headingFont !== 'Inter') fonts.add(branding.headingFont)
  if (branding.bodyFont !== 'Inter') fonts.add(branding.bodyFont)

  return Array.from(fonts).map((font) => {
    const encoded = encodeURIComponent(font)
    return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700&display=swap`
  })
}

/**
 * Compute wireframe token overrides from client branding.
 *
 * Overrides --wf-accent and --wf-sidebar-* tokens so the wireframe
 * adopts the client's brand identity. Apply the returned style object
 * on the wireframe container to cascade overrides into all children.
 *
 * Sidebar fg is computed for contrast: light text on dark backgrounds,
 * dark text on light backgrounds (threshold: L > 50).
 *
 * Usage:
 * ```tsx
 * <div style={brandingToWfOverrides(branding)}>
 *   {wireframe content}
 * </div>
 * ```
 */
export function brandingToWfOverrides(branding: BrandingConfig): React.CSSProperties {
  const sidebarBg = darken(branding.primaryColor, 20)

  // Contrast computation: dark bg -> light text, light bg -> dark text
  const [, , sidebarL] = hexToHsl(sidebarBg)
  const sidebarFg = sidebarL > 50 ? '#1c1917' : '#fafaf9' // wf-neutral-900 : wf-neutral-50

  const [, , accentL] = hexToHsl(branding.primaryColor)
  const accentFg = accentL > 50 ? '#1c1917' : '#fafaf9'

  return {
    '--wf-accent': branding.primaryColor,
    '--wf-accent-fg': accentFg,
    '--wf-sidebar-bg': sidebarBg,
    '--wf-sidebar-fg': sidebarFg,
    '--wf-sidebar-active': branding.primaryColor,
    '--wf-sidebar-border': branding.primaryColor,
  } as React.CSSProperties
}
