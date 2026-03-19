import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import type { Mock } from 'vitest'

// --- Mocks ---

vi.mock('@clerk/react', () => ({
  useSession: vi.fn(),
}))

vi.mock('./token-exchange', () => ({
  exchangeToken: vi.fn(),
}))

vi.mock('@platform/supabase', () => ({
  setOrgAccessToken: vi.fn(),
  getOrgAccessToken: vi.fn(() => null),
}))

vi.mock('./useActiveOrg', () => ({
  useActiveOrg: vi.fn(),
}))

import { useSession } from '@clerk/react'
import { exchangeToken } from './token-exchange'
import { setOrgAccessToken, getOrgAccessToken } from '@platform/supabase'
import { useActiveOrg } from './useActiveOrg'
import { useOrgTokenExchange } from './useOrgTokenExchange'

const mockUseSession = useSession as Mock
const mockExchangeToken = exchangeToken as Mock
const mockSetOrgAccessToken = setOrgAccessToken as Mock
const mockGetOrgAccessToken = getOrgAccessToken as Mock
const mockUseActiveOrg = useActiveOrg as Mock

beforeEach(() => {
  vi.clearAllMocks()
  mockGetOrgAccessToken.mockReturnValue(null)
})

describe('useOrgTokenExchange', () => {
  it('exchanges token on happy path — isReady becomes true', async () => {
    const mockSession = { getToken: vi.fn().mockResolvedValue('clerk-jwt') }
    mockUseSession.mockReturnValue({ session: mockSession, isLoaded: true })
    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_1', name: 'Test', slug: 'test', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })
    mockExchangeToken.mockResolvedValue({ access_token: 'sb-token', expires_in: 3600 })

    const { result } = renderHook(() => useOrgTokenExchange())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
    expect(result.current.error).toBeNull()
    expect(mockSetOrgAccessToken).toHaveBeenCalledWith('sb-token')
  })

  it('sets error when exchange fails', async () => {
    const mockSession = { getToken: vi.fn().mockResolvedValue('clerk-jwt') }
    mockUseSession.mockReturnValue({ session: mockSession, isLoaded: true })
    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_1', name: 'Test', slug: 'test', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })
    mockExchangeToken.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useOrgTokenExchange())

    await waitFor(() => {
      expect(result.current.error).toBe('Network error')
    })
    expect(result.current.isReady).toBe(false)
  })

  it('does not exchange when session is null', () => {
    mockUseSession.mockReturnValue({ session: null, isLoaded: true })
    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_1', name: 'Test', slug: 'test', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })

    const { result } = renderHook(() => useOrgTokenExchange())

    expect(result.current.isReady).toBe(false)
    expect(mockExchangeToken).not.toHaveBeenCalled()
  })

  it('does not exchange when activeOrg is null', () => {
    const mockSession = { getToken: vi.fn().mockResolvedValue('clerk-jwt') }
    mockUseSession.mockReturnValue({ session: mockSession, isLoaded: true })
    mockUseActiveOrg.mockReturnValue({
      activeOrg: null,
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })

    const { result } = renderHook(() => useOrgTokenExchange())

    expect(result.current.isReady).toBe(false)
    expect(mockExchangeToken).not.toHaveBeenCalled()
  })

  it('resets isReady to false during org switch then sets it back to true', async () => {
    const mockSession = { getToken: vi.fn().mockResolvedValue('clerk-jwt') }
    mockUseSession.mockReturnValue({ session: mockSession, isLoaded: true })

    // Start with org_A
    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_A', name: 'Org A', slug: 'a', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })

    // First exchange resolves immediately
    mockExchangeToken.mockResolvedValue({ access_token: 'token-A', expires_in: 3600 })

    const { result, rerender } = renderHook(() => useOrgTokenExchange())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })

    // Now switch to org_B — use a deferred promise to control timing
    let resolveB: (value: { access_token: string; expires_in: number }) => void
    const exchangePromiseB = new Promise<{ access_token: string; expires_in: number }>((resolve) => {
      resolveB = resolve
    })
    mockExchangeToken.mockReturnValue(exchangePromiseB)

    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_B', name: 'Org B', slug: 'b', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })

    rerender()

    // isReady should be false immediately (race condition fix)
    await waitFor(() => {
      expect(result.current.isReady).toBe(false)
    })
    expect(mockSetOrgAccessToken).toHaveBeenCalledWith(null)

    // Resolve the exchange
    await act(async () => {
      resolveB!({ access_token: 'token-B', expires_in: 3600 })
    })

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
  })

  it('fires onOrgChange callback on org switch (not on first load)', async () => {
    const onOrgChange = vi.fn()
    const mockSession = { getToken: vi.fn().mockResolvedValue('clerk-jwt') }
    mockUseSession.mockReturnValue({ session: mockSession, isLoaded: true })

    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_A', name: 'Org A', slug: 'a', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })
    mockExchangeToken.mockResolvedValue({ access_token: 'token-A', expires_in: 3600 })

    const { result, rerender } = renderHook(() => useOrgTokenExchange({ onOrgChange }))

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })

    // First load — callback should NOT have been called
    expect(onOrgChange).not.toHaveBeenCalled()

    // Switch org
    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_B', name: 'Org B', slug: 'b', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })
    mockExchangeToken.mockResolvedValue({ access_token: 'token-B', expires_in: 3600 })

    rerender()

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
    expect(onOrgChange).toHaveBeenCalledTimes(1)
  })
})
