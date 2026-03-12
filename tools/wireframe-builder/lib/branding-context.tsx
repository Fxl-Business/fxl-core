import { createContext, useContext } from 'react'
import type { BrandingConfig } from '../types/branding'

type BrandingContextValue = {
  branding: BrandingConfig
  updateBranding: (partial: Partial<BrandingConfig>) => void
}

const BrandingContext = createContext<BrandingContextValue | null>(null)

export const BrandingProvider = BrandingContext.Provider

export function useWireframeBranding(): BrandingContextValue | null {
  return useContext(BrandingContext)
}
