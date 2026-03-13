import { describe, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Wave 0 stub — implementation pending Plan 02 (KB-06)
// Tests define expected behaviors for KBFormPage component.
// Tests use it.todo() since KBFormPage does not exist yet.
// ---------------------------------------------------------------------------

vi.mock('@/lib/kb-service', () => ({
  createKnowledgeEntry: vi.fn(),
  updateKnowledgeEntry: vi.fn(),
  getKnowledgeEntry: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
  Link: vi.fn(),
}))

describe('KBFormPage', () => {
  it.todo('renders form with title, type, body, tags, client fields')
  it.todo("injects ADR template when type changes to 'decision' and body is empty")
  it.todo("does NOT overwrite body when type changes to 'decision' and body has content")
  it.todo('calls createKnowledgeEntry on submit in create mode')
  it.todo('calls updateKnowledgeEntry on submit in edit mode')
  it.todo('parses comma-separated tags into array on submit')
  it.todo('navigates back to /knowledge-base after successful save')
})
