/**
 * BrandingConfig — per-client visual identity for wireframe rendering.
 *
 * Follows the same config pattern as BlueprintConfig:
 *   clients/[slug]/wireframe/branding.config.ts
 *
 * CSS vars injected at wireframe container level use --brand-* prefix
 * (never --primary/--accent which belong to the FXL Core app theme).
 */
export type BrandingConfig = {
  /** Primary brand color (hex). Controls sidebar bg, header accents, table headers, KPI value highlights. */
  primaryColor: string
  /** Secondary brand color (hex). Controls chart secondary series, hover states. */
  secondaryColor: string
  /** Accent brand color (hex). Controls chart accent series, callout highlights. */
  accentColor: string
  /** Heading font family (Google Fonts name or system font). Applied to titles and section headers. */
  headingFont: string
  /** Body font family (Google Fonts name or system font). Applied to all non-title text. */
  bodyFont: string
  /** Logo URL (absolute or relative). Renders in wireframe sidebar header. Empty string = FXL text fallback. */
  logoUrl: string
  /** Favicon URL. Applied to wireframe view browser tab. Optional — omit to keep default. */
  faviconUrl?: string
}

/** Neutral gray fallback for clients without branding configured yet. */
export const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#374151',   // gray-700
  secondaryColor: '#6B7280', // gray-500
  accentColor: '#3B82F6',    // blue-500
  headingFont: 'Inter',
  bodyFont: 'Inter',
  logoUrl: '',               // empty = show "FXL" text fallback
}
