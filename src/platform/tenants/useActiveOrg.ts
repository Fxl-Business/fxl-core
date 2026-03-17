import { useOrganization, useOrganizationList } from '@clerk/react'
import { useCallback, useMemo } from 'react'
import { isOrgMode } from '@platform/auth/auth-config'

export interface ActiveOrgState {
  /** Currently active Clerk organization (null if user has no orgs or in anon mode) */
  activeOrg: { id: string; name: string; slug: string | null; imageUrl: string } | null
  /** All organizations the user belongs to */
  orgs: { id: string; name: string; slug: string | null; imageUrl: string }[]
  /** Switch to a different organization by ID */
  switchOrg: (orgId: string) => void
  /** True while Clerk is loading org data */
  isLoading: boolean
}

/**
 * Hook wrapping Clerk's useOrganization + useOrganizationList.
 *
 * In anon mode, returns stub values (no orgs, not loading).
 * In org mode, returns real Clerk organization data.
 */
export function useActiveOrg(): ActiveOrgState {
  const { organization, isLoaded: isOrgLoaded } = useOrganization()
  const { userMemberships, setActive, isLoaded: isListLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  })

  const switchOrg = useCallback(
    (orgId: string) => {
      if (setActive) {
        setActive({ organization: orgId })
      }
    },
    [setActive],
  )

  const orgs = useMemo(() => {
    if (!userMemberships?.data) return []
    return userMemberships.data.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      imageUrl: m.organization.imageUrl,
    }))
  }, [userMemberships?.data])

  const activeOrg = useMemo(() => {
    if (!organization) return null
    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      imageUrl: organization.imageUrl,
    }
  }, [organization])

  // In anon mode, return stubs — don't block the app
  if (!isOrgMode()) {
    return {
      activeOrg: null,
      orgs: [],
      switchOrg: () => {},
      isLoading: false,
    }
  }

  return {
    activeOrg,
    orgs,
    switchOrg,
    isLoading: !isOrgLoaded || !isListLoaded,
  }
}
