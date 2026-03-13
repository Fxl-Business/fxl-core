// ---------------------------------------------------------------------------
// KB Module Types
// Re-exports from kb-service + module-specific constants
// ---------------------------------------------------------------------------

export type { KnowledgeEntry, KnowledgeEntryType, CreateKnowledgeEntryParams, UpdateKnowledgeEntryParams } from '@/lib/kb-service'

// KBEntryType alias for ergonomics within the module
export type KBEntryType = 'bug' | 'decision' | 'pattern' | 'lesson'

// Typed constant array for all entry types with Portuguese labels
export const KB_ENTRY_TYPES: { value: KBEntryType; label: string }[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'decision', label: 'Decisao' },
  { value: 'pattern', label: 'Padrao' },
  { value: 'lesson', label: 'Licao' },
]

// ADR template for entries of type 'decision' (KB-06)
// Injected only when body is empty — never overwrites existing content
export const ADR_TEMPLATE = `## Context

Descreva o contexto e o problema que motivou esta decisao.

## Decision

Descreva a decisao tomada.

## Consequences

Descreva as consequencias positivas e negativas desta decisao.
`
