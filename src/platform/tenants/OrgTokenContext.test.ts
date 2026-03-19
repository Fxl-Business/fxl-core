import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import type { Mock } from 'vitest'

// --- Mocks ---

vi.mock('@clerk/react', () => ({
  useSession: vi.fn(),
}))

vi.mock('./token-exchange', () => ({
  exchangeToken: vi.fn(),
}))

vi.mock('@platform/supabase', () => ({
  _setTokenGetter: vi.fn(),
  _setSignalGetter: vi.fn(),
  getOrgAccessToken: vi.fn(() => null),
}))

vi.mock('./useActiveOrg', () => ({
  useActiveOrg: vi.fn(),
}))

import { useSession } from '@clerk/react'
import { exchangeToken } from './token-exchange'
import { useActiveOrg } from './useActiveOrg'
import { OrgTokenProvider, useOrgToken } from './OrgTokenContext'

const mockUseSession = useSession as Mock
const mockExchangeToken = exchangeToken as Mock
const mockUseActiveOrg = useActiveOrg as Mock

function wrapper({ children }: { children: ReactNode }) {
  return createElement(OrgTokenProvider, null, children)
}

function wrapperWithCallback(onOrgChange: () => void) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(OrgTokenProvider, { onOrgChange, children })
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('OrgTokenContext', () => {
  it('exchanges token on happy path — isReady becomes true and orgToken is set', async () => {
    const mockSession = { id: 'sess_1', getToken: vi.fn().mockResolvedValue('clerk-jwt') }
    mockUseSession.mockReturnValue({ session: mockSession, isLoaded: true })
    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_1', name: 'Test', slug: 'test', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })
    mockExchangeToken.mockResolvedValue({ access_token: 'sb-token', expires_in: 3600 })

    const { result } = renderHook(() => useOrgToken(), { wrapper })

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
    expect(result.current.error).toBeNull()
    expect(result.current.orgToken).toBe('sb-token')
  })

  it('sets error when exchange fails', async () => {
    const mockSession = { id: 'sess_1', getToken: vi.fn().mockResolvedValue('clerk-jwt') }
    mockUseSession.mockReturnValue({ session: mockSession, isLoaded: true })
    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_1', name: 'Test', slug: 'test', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })
    mockExchangeToken.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useOrgToken(), { wrapper })

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

    const { result } = renderHook(() => useOrgToken(), { wrapper })

    expect(result.current.isReady).toBe(false)
    expect(mockExchangeToken).not.toHaveBeenCalled()
  })

  it('does not exchange when activeOrg is null', () => {
    const mockSession = { id: 'sess_1', getToken: vi.fn().mockResolvedValue('clerk-jwt') }
    mockUseSession.mockReturnValue({ session: mockSession, isLoaded: true })
    mockUseActiveOrg.mockReturnValue({
      activeOrg: null,
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })

    const { result } = renderHook(() => useOrgToken(), { wrapper })

    expect(result.current.isReady).toBe(false)
    expect(mockExchangeToken).not.toHaveBeenCalled()
  })

  it('resets isReady to false during org switch then sets it back to true', async () => {
    const mockSession = { id: 'sess_1', getToken: vi.fn().mockResolvedValue('clerk-jwt') }
    mockUseSession.mockReturnValue({ session: mockSession, isLoaded: true })

    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_A', name: 'Org A', slug: 'a', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })
    mockExchangeToken.mockResolvedValue({ access_token: 'token-A', expires_in: 3600 })

    const { result, rerender } = renderHook(() => useOrgToken(), { wrapper })

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })

    // Switch to org_B with a deferred promise
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

    await waitFor(() => {
      expect(result.current.isReady).toBe(false)
    })

    await act(async () => {
      resolveB!({ access_token: 'token-B', expires_in: 3600 })
    })

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
    expect(result.current.orgToken).toBe('token-B')
  })

  it('aborts previous controller on org switch — signal passed to exchangeToken is aborted', async () => {
    const mockSession = { id: 'sess_1', getToken: vi.fn().mockResolvedValue('clerk-jwt') }
    mockUseSession.mockReturnValue({ session: mockSession, isLoaded: true })

    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_A', name: 'Org A', slug: 'a', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })

    // First exchange — capture the signal passed
    let firstSignal: AbortSignal | undefined
    mockExchangeToken.mockImplementation((_t: string, _o: string, signal?: AbortSignal) => {
      firstSignal = signal
      return Promise.resolve({ access_token: 'token-A', expires_in: 3600 })
    })

    const { result, rerender } = renderHook(() => useOrgToken(), { wrapper })

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })

    // First signal should not be aborted yet
    expect(firstSignal).toBeDefined()
    const firstSignalRef = firstSignal!

    // Now switch org — the previous controller should be aborted
    mockExchangeToken.mockResolvedValue({ access_token: 'token-B', expires_in: 3600 })
    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_B', name: 'Org B', slug: 'b', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })

    rerender()

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })

    // The first signal should now be aborted
    expect(firstSignalRef.aborted).toBe(true)
  })

  it('silences AbortError — error stays null when exchange throws AbortError', async () => {
    const mockSession = { id: 'sess_1', getToken: vi.fn().mockResolvedValue('clerk-jwt') }
    mockUseSession.mockReturnValue({ session: mockSession, isLoaded: true })
    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_1', name: 'Test', slug: 'test', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })

    const abortError = new DOMException('The operation was aborted', 'AbortError')
    mockExchangeToken.mockRejectedValue(abortError)

    const { result } = renderHook(() => useOrgToken(), { wrapper })

    // Give time for the exchange to complete (and be caught)
    await new Promise(resolve => setTimeout(resolve, 50))

    // Error should remain null — AbortError is silenced
    expect(result.current.error).toBeNull()
    expect(result.current.isReady).toBe(false)
  })

  it('fires onOrgChange callback on org switch', async () => {
    const onOrgChange = vi.fn()
    const mockSession = { id: 'sess_1', getToken: vi.fn().mockResolvedValue('clerk-jwt') }
    mockUseSession.mockReturnValue({ session: mockSession, isLoaded: true })

    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_A', name: 'Org A', slug: 'a', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })
    mockExchangeToken.mockResolvedValue({ access_token: 'token-A', expires_in: 3600 })

    const { result, rerender } = renderHook(() => useOrgToken(), {
      wrapper: wrapperWithCallback(onOrgChange),
    })

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })

    // First load fires onOrgChange (prevOrgIdRef.current === null)
    expect(onOrgChange).toHaveBeenCalledTimes(1)

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
    expect(onOrgChange).toHaveBeenCalledTimes(2)
  })

  it('setTokenOverride changes orgToken and clearTokenOverride restores it', async () => {
    const mockSession = { id: 'sess_1', getToken: vi.fn().mockResolvedValue('clerk-jwt') }
    mockUseSession.mockReturnValue({ session: mockSession, isLoaded: true })
    mockUseActiveOrg.mockReturnValue({
      activeOrg: { id: 'org_1', name: 'Test', slug: 'test', imageUrl: '' },
      orgs: [],
      switchOrg: vi.fn(),
      isLoading: false,
    })
    mockExchangeToken.mockResolvedValue({ access_token: 'original-token', expires_in: 3600 })

    const { result } = renderHook(() => useOrgToken(), { wrapper })

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
    expect(result.current.orgToken).toBe('original-token')

    // Override token
    act(() => {
      result.current.setTokenOverride('override-token')
    })
    expect(result.current.orgToken).toBe('override-token')

    // Clear override — should restore original
    act(() => {
      result.current.clearTokenOverride()
    })
    expect(result.current.orgToken).toBe('original-token')
  })

  it('throws when useOrgToken is used outside OrgTokenProvider', () => {
    // Suppress console.error for the expected error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(() => {
      renderHook(() => useOrgToken())
    }).toThrow('useOrgToken must be used inside OrgTokenProvider')

    consoleSpy.mockRestore()
  })
})
