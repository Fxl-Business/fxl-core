import { useMemo } from 'react'
import type { UseNavItemsResult } from '@platform/module-loader/registry'
import { useDocsNav } from './useDocsNav'

/**
 * Adapter hook that wraps useDocsNav into the standard UseNavItemsResult
 * interface expected by ModuleDefinition.useNavItems.
 *
 * Only exposes tenant docs — product docs are managed via /admin/product-docs.
 */
export function useDocsNavItems(): UseNavItemsResult {
  const { tenantItems } = useDocsNav()

  const items = useMemo(() => {
    if (tenantItems.length > 0) {
      return tenantItems
    }
    return []
  }, [tenantItems])

  return {
    items,
    isLoading: false, // useDocsNav doesn't expose loading state; items are [] until ready
  }
}
