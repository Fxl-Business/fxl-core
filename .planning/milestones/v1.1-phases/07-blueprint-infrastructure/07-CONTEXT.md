# Phase 7: Blueprint Infrastructure - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Migrate blueprint storage from file-based (.ts config) to Supabase-only, with runtime validation via Zod, schema versioning for safe evolution, and optimistic locking to prevent silent overwrites. No new section types or visual changes — pure infrastructure.

</domain>

<decisions>
## Implementation Decisions

### File-to-DB Migration
- Clean cutover: seed pilot client (financeiro-conta-azul) to DB, then remove .ts file from repo entirely (not rename)
- DB is the sole source of truth — no .ts file fallback in rendering path
- Remove `blueprintMap` hardcoded imports from SharedWireframeView.tsx
- New clients created via UI (empty blueprint) or via Claude Code (generated from briefing — Phase 11)
- Both creation paths write directly to Supabase

### seedFromFile Handling
- Claude's Discretion: keep as dev/testing utility or remove entirely. Key constraint: never called in rendering path.

### Conflict UX (Optimistic Locking)
- Modal with two options when conflict detected: "Recarregar" (lose local edits, get DB version) or "Sobrescrever" (overwrite DB with local)
- Primary use case: single operator with 2 tabs open (rare real conflicts)
- Periodic polling (~30s) to detect stale data proactively, not just at save time
- Stale data warning: banner or subtle indicator that blueprint was updated externally

### Validation Errors
- Validate on both load and save (bidirectional protection)
- Error notification via toast (sonner) — non-intrusive
- Claude's Discretion: whether to block rendering entirely or show partial with placeholder for invalid sections

### Schema Evolution
- schemaVersion lives inside the JSON (field in BlueprintConfig), not as DB column
- Lazy migration on read: when loading an older schemaVersion, auto-migrate to current and save back
- New fields on existing section types are always optional with defaults — old blueprints work without migration
- No batch migration scripts needed for v1.1 — lazy migration is the sole strategy

</decisions>

<specifics>
## Specific Ideas

- User explicitly wants polling for stale data detection (not just save-time check) — even though they're the only operator, Claude Code may also modify blueprints
- Blueprint files should be fully removed from git, not renamed or archived — data lives only in Supabase
- Phase 11 (AI Generation) will write blueprints to DB via Claude Code — this path must go through the same validation

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `blueprint-store.ts` (49 lines): loadBlueprint, saveBlueprint, seedFromFile — needs refactoring but base structure is reusable
- `config-validator.ts` (336 lines): Existing validation for TechnicalConfig coverage — patterns reusable for blueprint-only validation
- `SharedWireframeView.tsx`: Main consumer of blueprint data — primary file to modify for DB-only loading

### Established Patterns
- Discriminated union for section types (15 types) — Zod schema must mirror this exactly
- Supabase client via `createClient()` from `@supabase/supabase-js` — already used in blueprint-store, comments
- `as BlueprintConfig` unsafe cast on line 16 of blueprint-store.ts — must be replaced with Zod parse

### Integration Points
- `blueprint_configs` table (migration 003): JSONB `config` column, `updated_at`, `updated_by` — needs schemaVersion in JSON, etag/version for locking
- `BlueprintRenderer` receives `BlueprintScreen` — no changes needed downstream, validation happens before reaching renderer
- `SectionRenderer` switch dispatch — not modified in this phase, but must handle unknown types gracefully after validation
- Editor property panels read/write to blueprint state — save path must include validation + locking

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-blueprint-infrastructure*
*Context gathered: 2026-03-09*
