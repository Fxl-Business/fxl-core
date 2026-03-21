/**
 * Tests for ModulesPanel component
 *
 * TOGL-02: ModulesPanel no longer contains tenant selector or toggle switches.
 *          It is now a scaffold/overview page — per-tenant toggle management
 *          was moved to TenantModulesSection on TenantDetailPage.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mock MODULE_REGISTRY — inline to avoid hoisting issues
// ---------------------------------------------------------------------------

vi.mock('@platform/module-loader/registry', () => ({
  MODULE_REGISTRY: [
    {
      id: 'docs',
      label: 'Documentos',
      status: 'active',
      route: '/docs',
      description: 'Documentacao interna',
      icon: () => null,
    },
    {
      id: 'tasks',
      label: 'Tarefas',
      status: 'beta',
      route: '/tasks',
      description: 'Gestao de tarefas',
      icon: () => null,
    },
  ],
}))

// ---------------------------------------------------------------------------
// Mock child components added in subsequent phases (140/141)
// to keep tests focused on ModulesPanel TOGL-02 contract only
// ---------------------------------------------------------------------------

vi.mock('./components/ModuleDiagram', () => ({
  default: () => <div data-testid="module-diagram" />,
}))

vi.mock('./ModuleOverviewCard', () => ({
  ModuleOverviewCard: ({ mod }: { mod: { id: string; label: string } }) => (
    <div data-testid={`module-card-${mod.id}`}>{mod.label}</div>
  ),
}))

// ---------------------------------------------------------------------------
// Mock module-status-constants re-exported from ModulesPanel
// ---------------------------------------------------------------------------

vi.mock('./module-status-constants', () => ({
  STATUS_LABELS: { active: 'Ativo', beta: 'Beta', 'coming-soon': 'Em breve' },
  STATUS_CLASSES: {
    active: 'bg-emerald-50 text-emerald-700',
    beta: 'bg-amber-50 text-amber-700',
    'coming-soon': 'bg-slate-100 text-slate-500',
  },
}))

// ---------------------------------------------------------------------------
// Component under test (imported after mocks)
// ---------------------------------------------------------------------------

import ModulesPanel from './ModulesPanel'

// ---------------------------------------------------------------------------
// Cleanup after each test
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup()
})

// ---------------------------------------------------------------------------
// TOGL-02: no tenant selector, no toggle switches
// ---------------------------------------------------------------------------

describe('TOGL-02 — ModulesPanel contains no tenant selector or toggle switches', () => {
  it('renders without crashing', () => {
    expect(() => render(<ModulesPanel />)).not.toThrow()
  })

  it('does not render any toggle switch elements', () => {
    render(<ModulesPanel />)
    const switches = screen.queryAllByRole('switch')
    expect(switches).toHaveLength(0)
  })

  it('does not contain a tenant selector dropdown (no "Selecione um tenant" text)', () => {
    render(<ModulesPanel />)
    expect(screen.queryByText(/Selecione um tenant/i)).not.toBeInTheDocument()
  })

  it('does not contain any combobox for tenant selection', () => {
    render(<ModulesPanel />)
    const comboboxes = screen.queryAllByRole('combobox')
    expect(comboboxes).toHaveLength(0)
  })

  it('does not show a "Gerenciar modulos" link pointing to /admin/modules', () => {
    render(<ModulesPanel />)
    expect(screen.queryByText(/Gerenciar modulos/i)).not.toBeInTheDocument()
  })

  it('renders a page header with "Modulos" title', () => {
    render(<ModulesPanel />)
    expect(screen.getByRole('heading', { name: /modulos/i })).toBeInTheDocument()
  })

  it('does not require Clerk org context (no useActiveOrg dependency)', () => {
    // If ModulesPanel used useActiveOrg, rendering without a Clerk provider
    // would throw because useOrganization / useOrganizationList are mocked only
    // in the useActiveOrg test file. Rendering successfully here confirms
    // the component does not depend on Clerk org context.
    expect(() => render(<ModulesPanel />)).not.toThrow()
  })

  it('does not render any listbox or select for tenant switching', () => {
    render(<ModulesPanel />)
    const listboxes = screen.queryAllByRole('listbox')
    expect(listboxes).toHaveLength(0)
  })
})
