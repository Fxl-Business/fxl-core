import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { Mock } from 'vitest'

vi.mock('@clerk/react', () => ({
  useOrganization: vi.fn(),
  useOrganizationList: vi.fn(),
}))

import { useOrganization, useOrganizationList } from '@clerk/react'
import { useActiveOrg } from './useActiveOrg'

const mockUseOrganization = useOrganization as Mock
const mockUseOrganizationList = useOrganizationList as Mock

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useActiveOrg', () => {
  it('returns activeOrg when organization is set and user is a member', () => {
    const org = { id: 'org_1', name: 'My Org', slug: 'my-org', imageUrl: 'https://img.png' }
    mockUseOrganization.mockReturnValue({ organization: org, isLoaded: true })
    mockUseOrganizationList.mockReturnValue({
      userMemberships: {
        data: [{ organization: org }],
      },
      setActive: vi.fn(),
      isLoaded: true,
    })

    const { result } = renderHook(() => useActiveOrg())

    expect(result.current.activeOrg).toEqual({
      id: 'org_1',
      name: 'My Org',
      slug: 'my-org',
      imageUrl: 'https://img.png',
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.orgs).toHaveLength(1)
  })

  it('returns null activeOrg when organization is set but user is NOT a member (stale org)', () => {
    const staleOrg = { id: 'org_stale', name: 'Stale', slug: 'stale', imageUrl: '' }
    const validOrg = { id: 'org_valid', name: 'Valid', slug: 'valid', imageUrl: '' }
    mockUseOrganization.mockReturnValue({ organization: staleOrg, isLoaded: true })
    mockUseOrganizationList.mockReturnValue({
      userMemberships: {
        data: [{ organization: validOrg }],
      },
      setActive: vi.fn(),
      isLoaded: true,
    })

    const { result } = renderHook(() => useActiveOrg())

    expect(result.current.activeOrg).toBeNull()
  })

  it('returns isLoading true while Clerk is loading', () => {
    mockUseOrganization.mockReturnValue({ organization: null, isLoaded: false })
    mockUseOrganizationList.mockReturnValue({
      userMemberships: { data: [] },
      setActive: vi.fn(),
      isLoaded: false,
    })

    const { result } = renderHook(() => useActiveOrg())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.activeOrg).toBeNull()
  })
})
