import { useOrganization, useOrganizationList } from '@clerk/react'
import { useCallback, useEffect, useMemo } from 'react'

export interface ActiveOrgState {
  /** Currently active Clerk organization (null if user has no orgs) */
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
 * Returns real Clerk organization data.
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

  // Auto-select or fix active org:
  // - No active org but has memberships → select first
  // - Active org not in memberships (stale/removed) → switch to first valid
  useEffect(() => {
    if (!isOrgLoaded || !isListLoaded) return
    if (!setActive) return
    const memberships = userMemberships?.data
    if (!memberships?.length) {
      // No memberships — clear any stale active org so ProtectedRoute can redirect
      if (organization) {
        setActive({ organization: null })
      }
      return
    }

    if (!organization) {
      // No active org — select the first one
      setActive({ organization: memberships[0].organization.id })
      return
    }

    // Active org exists but user is no longer a member — switch to first valid
    const stillMember = memberships.some(m => m.organization.id === organization.id)
    if (!stillMember) {
      setActive({ organization: memberships[0].organization.id })
    }
  }, [isOrgLoaded, isListLoaded, organization, userMemberships?.data, setActive])

  const activeOrg = useMemo(() => {
    if (!organization) return null
    // If memberships are loaded, verify the active org is still valid.
    // Return null for stale orgs to prevent token exchange with an invalid org.
    if (isListLoaded && userMemberships?.data) {
      const stillMember = userMemberships.data.some(m => m.organization.id === organization.id)
      if (!stillMember) return null
    }
    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      imageUrl: organization.imageUrl,
    }
  }, [organization, isListLoaded, userMemberships?.data])

  return {
    activeOrg,
    orgs,
    switchOrg,
    isLoading: !isOrgLoaded || !isListLoaded,
  }
}
