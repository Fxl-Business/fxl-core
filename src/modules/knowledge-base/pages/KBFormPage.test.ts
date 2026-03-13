import { describe, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Wave 0 stub — implementation pending (KB-06)
// Tests define expected behaviors for KBFormPage component.
// All tests use it.todo() since the page does not exist yet.
// ---------------------------------------------------------------------------

vi.mock('@/lib/kb-service', () => ({
  createKBEntry: vi.fn(),
  updateKBEntry: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
}))

describe('KBFormPage', () => {
  it.todo('renders form with title, type, body, tags, client fields')
  it.todo('injects ADR template when type changes to \'decision\' and body is empty')
  it.todo('does NOT inject ADR template when type changes to \'decision\' and body has content')
  it.todo('calls createKBEntry on submit in create mode')
  it.todo('calls updateKBEntry on submit in edit mode')
  it.todo('parses comma-separated tags into array on submit')
})
