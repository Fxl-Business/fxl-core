/**
 * Tests for TenantModulesSection component
 *
 * TOGL-01: Admin can toggle modules on TenantDetailPage — TenantModulesSection
 *          fetches from Supabase tenant_modules table and renders toggle switches.
 * TOGL-03: TenantModulesSection is reusable with a single orgId prop interface.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Hoisted mock functions — must be declared before vi.mock factories are called
// ---------------------------------------------------------------------------

const { mockFrom, mockSelect, mockEq, mockUpsert } = vi.hoisted(() => {
  const mockEq = vi.fn()
  const mockUpsert = vi.fn()
  const mockSelect = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({ select: mockSelect, upsert: mockUpsert }))
  return { mockFrom, mockSelect, mockEq, mockUpsert }
})

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

vi.mock('@platform/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}))

// ---------------------------------------------------------------------------
// Mock sonner toast
// ---------------------------------------------------------------------------

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

// ---------------------------------------------------------------------------
// Mock MODULE_REGISTRY — inline, no top-level variable reference in factory
// ---------------------------------------------------------------------------

vi.mock('@platform/module-loader/registry', () => ({
  MODULE_REGISTRY: [
    {
      id: 'docs',
      label: 'Documentos',
      status: 'active',
      route: '/docs',
      icon: () => null,
    },
    {
      id: 'tasks',
      label: 'Tarefas',
      status: 'beta',
      route: '/tasks',
      icon: () => null,
    },
  ],
}))

vi.mock('@platform/module-loader/module-ids', () => ({
  MODULE_IDS: { DOCS: 'docs', TASKS: 'tasks' },
}))

// ---------------------------------------------------------------------------
// Component under test (imported after mocks)
// ---------------------------------------------------------------------------

import TenantModulesSection from './TenantModulesSection'

// ---------------------------------------------------------------------------
// Local constants reflecting the mock registry
// ---------------------------------------------------------------------------

const MOCK_MODULE_COUNT = 2

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildSelectResult(rows: { module_id: string; enabled: boolean }[], error = null) {
  return { data: rows, error }
}

function renderSection(orgId = 'org_test_123') {
  return render(<TenantModulesSection orgId={orgId} />)
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()

  // Default: supabase returns empty list (no rows in tenant_modules)
  mockEq.mockResolvedValue(buildSelectResult([]))
  // Default: upsert succeeds
  mockUpsert.mockResolvedValue({ error: null })
})

afterEach(() => {
  cleanup()
})

// ---------------------------------------------------------------------------
// TOGL-03: reusable with orgId prop interface
// ---------------------------------------------------------------------------

describe('TOGL-03 — TenantModulesSection accepts orgId prop', () => {
  it('renders without crashing when given a valid orgId string', async () => {
    renderSection('org_abc_456')

    await waitFor(() => {
      expect(screen.queryByText('Documentos')).toBeInTheDocument()
    })
  })

  it('queries Supabase using the provided orgId as filter', async () => {
    renderSection('org_specific_tenant')

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('tenant_modules')
    })

    expect(mockEq).toHaveBeenCalledWith('org_id', 'org_specific_tenant')
  })

  it('re-fetches from Supabase when orgId prop changes', async () => {
    const { rerender } = renderSection('org_first')

    await waitFor(() => {
      expect(mockEq).toHaveBeenCalledWith('org_id', 'org_first')
    })

    vi.clearAllMocks()
    mockEq.mockResolvedValue(buildSelectResult([]))

    rerender(<TenantModulesSection orgId="org_second" />)

    await waitFor(() => {
      expect(mockEq).toHaveBeenCalledWith('org_id', 'org_second')
    })
  })
})

// ---------------------------------------------------------------------------
// TOGL-01: fetches from Supabase and renders toggle switches
// ---------------------------------------------------------------------------

describe('TOGL-01 — TenantModulesSection fetches and renders toggles', () => {
  it('shows loading skeletons while fetching module states', () => {
    // Never resolve — keep in loading state
    mockEq.mockImplementation(() => new Promise(() => {}))

    renderSection()

    // Skeleton divs are rendered (animate-pulse) during loading
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders a toggle switch for each module in the registry after fetch', async () => {
    renderSection()

    await waitFor(() => {
      expect(screen.getAllByText('Documentos').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Tarefas').length).toBeGreaterThan(0)
    })

    // Each module should have a Switch (role=switch for Radix/shadcn)
    const switches = screen.getAllByRole('switch')
    expect(switches).toHaveLength(MOCK_MODULE_COUNT)
  })

  it('defaults all modules to enabled when tenant_modules table has no rows (opt-out model)', async () => {
    mockEq.mockResolvedValue(buildSelectResult([]))

    renderSection()

    await waitFor(() => {
      expect(screen.getByText('Documentos')).toBeInTheDocument()
    })

    const switches = screen.getAllByRole('switch')
    switches.forEach(sw => {
      expect(sw).toHaveAttribute('aria-checked', 'true')
    })
  })

  it('respects stored enabled=false from tenant_modules table', async () => {
    mockEq.mockResolvedValue(
      buildSelectResult([
        { module_id: 'docs', enabled: false },
        { module_id: 'tasks', enabled: true },
      ]),
    )

    renderSection()

    await waitFor(() => {
      expect(screen.getByText('Documentos')).toBeInTheDocument()
    })

    const switches = screen.getAllByRole('switch')
    // docs = disabled, tasks = enabled (registry order: docs first, tasks second)
    expect(switches[0]).toHaveAttribute('aria-checked', 'false')
    expect(switches[1]).toHaveAttribute('aria-checked', 'true')
  })

  it('displays active count badge showing how many modules are enabled', async () => {
    mockEq.mockResolvedValue(
      buildSelectResult([
        { module_id: 'docs', enabled: true },
        { module_id: 'tasks', enabled: false },
      ]),
    )

    renderSection()

    await waitFor(() => {
      // "1 de 2 ativos"
      expect(screen.getByText(/1 de 2 ativos/)).toBeInTheDocument()
    })
  })

  it('shows error message and retry button when Supabase fetch fails', async () => {
    mockEq.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    renderSection()

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar modulos do tenant')).toBeInTheDocument()
    })

    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
  })

  it('re-fetches when user clicks "Tentar novamente" after an error', async () => {
    // First call: error
    mockEq.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })
    // Second call: success
    mockEq.mockResolvedValueOnce(buildSelectResult([]))

    renderSection()

    await waitFor(() => {
      expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Tentar novamente'))

    await waitFor(() => {
      expect(screen.getByText('Documentos')).toBeInTheDocument()
    })

    // Supabase was called twice total
    expect(mockFrom).toHaveBeenCalledTimes(2)
  })

  it('performs optimistic upsert when admin toggles a module', async () => {
    mockEq.mockResolvedValue(
      buildSelectResult([{ module_id: 'docs', enabled: true }]),
    )

    renderSection()

    await waitFor(() => {
      expect(screen.getByText('Documentos')).toBeInTheDocument()
    })

    const switches = screen.getAllByRole('switch')
    // docs is enabled — clicking it should disable it
    fireEvent.click(switches[0])

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ org_id: 'org_test_123', module_id: 'docs', enabled: false }),
        expect.objectContaining({ onConflict: 'org_id,module_id' }),
      )
    })
  })

  it('reverts optimistic update when upsert fails', async () => {
    mockEq.mockResolvedValue(
      buildSelectResult([{ module_id: 'docs', enabled: true }]),
    )
    mockUpsert.mockResolvedValue({ error: { message: 'DB write error' } })

    renderSection()

    await waitFor(() => {
      expect(screen.getByText('Documentos')).toBeInTheDocument()
    })

    const switches = screen.getAllByRole('switch')
    // docs is enabled — click to disable (optimistic: goes false)
    fireEvent.click(switches[0])

    // After upsert error, switch should be reverted back to true
    await waitFor(() => {
      expect(switches[0]).toHaveAttribute('aria-checked', 'true')
    })
  })
})
