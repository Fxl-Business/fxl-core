# Pitfalls Research

**Domain:** Wireframe evolution -- file-to-DB migration, component library expansion, design system coexistence, AI-assisted blueprint generation
**Researched:** 2026-03-09
**Confidence:** HIGH (grounded in codebase analysis of existing 16,808 LOC TypeScript, verified Supabase JSONB patterns, design system architecture review)

## Critical Pitfalls

### Pitfall 1: Dual Source of Truth During File-to-DB Migration

**What goes wrong:**
The codebase currently has `blueprint.config.ts` as a static file AND `blueprint_configs` table in Supabase. `WireframeViewer.tsx` seeds DB from file on first load (`seedFromFile`), then reads from DB thereafter. `SharedWireframeView.tsx` has a parallel `blueprintMap` with dynamic imports as fallback. During the v1.1 migration to "blueprint as dynamic data in Supabase," both paths continue to exist. Developers edit the `.ts` file thinking it is the source of truth, but the DB already has a diverged copy. Or the DB gets updated through the visual editor, but the `.ts` file stays stale and re-seeds on a fresh Supabase instance, overwriting DB changes.

**Why it happens:**
The `seedFromFile` function in `blueprint-store.ts` checks `if (existing) return` -- it only seeds when DB is empty. This works today because there is one client and one deployment. But in v1.1, blueprints are dynamic DB data. The file still exists as a TypeScript import. Nothing prevents a developer from modifying the file, and nothing warns that the file is now a historical artifact, not the source of truth.

**How to avoid:**
1. Make the migration a clean cutover, not a gradual fade. Pick a date: before it, file is truth. After it, DB is truth. Delete or freeze the file.
2. Rename `blueprint.config.ts` to `blueprint.config.seed.ts` to signal it is seed data only. Add a `/** @deprecated - Source of truth is now Supabase blueprint_configs table */` JSDoc.
3. Remove `seedFromFile` entirely once DB has been seeded for all clients. The fallback import map in `SharedWireframeView.tsx` (lines 39-45) must also be removed.
4. Add a startup check: if a blueprint exists in DB but the `.ts` file has been modified more recently than `updated_at`, log a warning.

**Warning signs:**
- Visual editor changes "disappear" after a fresh Supabase reset
- Two developers see different wireframes for the same client
- `blueprint.config.ts` has uncommitted changes while DB has different data
- `seedFromFile` runs unexpectedly and overwrites DB edits

**Phase to address:**
Phase 1 (Blueprint to DB migration) -- this must be the FIRST thing done. Every subsequent feature depends on a single, clear source of truth.

---

### Pitfall 2: JSONB Schema Drift Without Versioning

**What goes wrong:**
The `blueprint_configs` table stores the entire `BlueprintConfig` as a single `jsonb` column with no schema version. When v1.1 adds new section types (settings pages, filter blocks, input blocks), new screen properties, or changes the `BlueprintSection` discriminated union, existing JSONB documents in the DB become structurally incompatible. The `SectionRenderer.tsx` switch statement (15 cases today) silently returns `undefined` for unknown types. The TypeScript type system cannot validate JSONB at runtime.

**Why it happens:**
JSONB's flexibility is its trap. Adding a field to the TypeScript type is instant. But existing DB rows do not have that field. PostgreSQL JSONB does not enforce structure -- the `config` column accepts anything. The current `config jsonb NOT NULL` constraint only checks for valid JSON, not schema conformance. Today's `BlueprintSection` union has 15 variants. Adding new ones means old data lacks them, but worse: changing the shape of existing variants (adding required fields to `KpiGridSection`, for example) breaks silently.

**How to avoid:**
1. Add a `schemaVersion` field to the JSONB document root: `{ schemaVersion: 2, slug: '...', screens: [...] }`. The config resolver already uses `schemaVersion: '1.0'` in `GenerationManifest` -- extend this pattern to blueprint storage.
2. Write a migration function per schema version bump: `function migrateV1toV2(config: unknown): BlueprintConfigV2`. Run on read, not on write. This avoids batch-migrating all rows and handles lazy migration.
3. Use Supabase's `pg_jsonschema` extension to add a CHECK constraint on the `config` column. This prevents writes of structurally invalid data at the DB level.
4. Make `SectionRenderer` explicitly handle unknown types with a fallback "Unknown section" block in edit mode (to make the problem visible) and `null` in view mode (to not break the wireframe).
5. Never add required fields to existing section types without a default. All new fields on existing types must be optional with a sensible default in the renderer.

**Warning signs:**
- `SectionRenderer` returns nothing for a section (blank gap in the wireframe)
- TypeScript compiles but runtime data does not match the type (no runtime validation)
- A newly added section type works in the visual editor but existing clients see blank spaces
- DB has rows with different structural shapes for the same field

**Phase to address:**
Phase 1 (Blueprint to DB migration) -- add `schemaVersion` and migration infrastructure before any schema changes. Every subsequent phase that adds new section types depends on this.

---

### Pitfall 3: Component Library Sprawl Without Governance

**What goes wrong:**
The component library grows from 15 section types to 20+ as settings pages, filter components, input blocks, and new chart types are added. Each new component gets its own renderer, property form, and default factory in `defaults.ts`. But without governance: visual styling diverges (some components use raw Tailwind, others use CSS vars, others use shadcn tokens), prop interfaces become inconsistent (some use `title`, others `label`, others `heading`), and the `BlueprintSection` discriminated union becomes a dumping ground where adding one variant requires touching 5+ files.

**Why it happens:**
The current architecture requires changes in 5-6 places to add a new section type:
1. Type definition in `blueprint.ts` (add to union)
2. Default factory in `defaults.ts` (add case)
3. Section renderer in `SectionRenderer.tsx` (add case)
4. Component implementation (new file)
5. Property form in `editor/property-forms/` (new file)
6. Component picker in `ComponentPicker.tsx` (add to list)

This is already 6 touchpoints for 15 types. At 25 types, the combinatorial overhead becomes the primary source of bugs. Developers skip the property form ("we'll add it later"), skip defaults ("just copy from another component"), or skip the picker entry. The result is components that exist in the type system but cannot be added via the visual editor.

**How to avoid:**
1. Create a component registry pattern: a single `SECTION_REGISTRY` object that maps type string to `{ renderer, propertyForm, defaultFactory, pickerMeta }`. Adding a new section type = adding one entry to the registry. No switch statements, no scattered cases.
2. Enforce a component contract interface: every section component must accept `section: T` and optional `editMode` props. Property forms must implement `PropertyFormProps<T>`. Use TypeScript generics to enforce this at compile time.
3. Add a lint rule or test: "every type in the `BlueprintSection` union must have a corresponding entry in `SECTION_REGISTRY`." This catches missing registrations at build time.
4. Standardize prop naming: `title` (not `label` or `heading`), `items` for arrays, `variant` for visual variations. Document this convention in the SKILL.md.

**Warning signs:**
- A section type exists in `blueprint.ts` but has no property form (cannot be edited)
- Two section components use different approaches for the same visual pattern (one uses `bg-muted`, another uses `bg-gray-100`)
- Adding a new section type requires modifying more than 3 files
- `SectionRenderer.tsx` switch statement exceeds 20 cases
- `defaults.ts` has inconsistent default structures (some return minimal objects, others return fully populated mock data)

**Phase to address:**
Phase 2 (Component library expansion) -- refactor to registry pattern BEFORE adding new components. Adding new components to the old scattered architecture will make the refactor harder later.

---

### Pitfall 4: Theme Collision Between App Design System and Wireframe Design System

**What goes wrong:**
The FXL Core app uses shadcn/ui semantic tokens (`--primary`, `--accent`, `--foreground`, `--background`) defined in `globals.css`. Wireframe rendering uses `--brand-*` prefixed CSS variables injected at the wireframe container level via `brandingToCssVars()`. The v1.1 redesign introduces a third layer: a wireframe-specific design system with white/black/gray/gold palette for wireframe chrome (headers, sidebars, navigation) distinct from both the app theme and the client brand colors. This creates three competing CSS variable namespaces on the same page, and any leak between them causes visual corruption.

**Why it happens:**
CSS custom properties inherit through the DOM tree. The wireframe renders inside the FXL Core app shell (at least in the editor/preview path). The current `--brand-*` prefix was a deliberate decision (noted in KEY_DECISIONS: "Avoid collision with FXL Core app theme") and it works today. But adding a wireframe chrome design system (`--wf-*` or similar) creates a third layer. Worse: if the wireframe uses shadcn/ui components internally (the component library already imports from `@/components/ui/`), those components inherit `--primary` from the app, not from the wireframe context.

The `WireframeViewer` mounts as a full-screen view outside the Layout component, which reduces collision risk. But `SharedWireframeView` and the visual editor run within the app shell, where both variable sets coexist.

**How to avoid:**
1. Strict three-tier variable namespace with NO overlap:
   - `--primary`, `--accent`, etc: FXL Core app only. Never referenced in wireframe components.
   - `--brand-*`: Client brand identity (already exists). Applied at wireframe container.
   - `--wf-*`: Wireframe chrome (new). Applied at wireframe container alongside `--brand-*`.
2. Wireframe components must NEVER import from `@/components/ui/` directly. Create wireframe-specific wrappers in `tools/wireframe-builder/components/ui/` that remap variables or use explicit values.
3. The wireframe container (`WireframeViewer`, `SharedWireframeView`) should use CSS `all: initial` or a CSS layer (`@layer wireframe { ... }`) to prevent app token inheritance.
4. Test for collision explicitly: render a wireframe with brand primary = red inside the app shell with app primary = blue. If any element is blue inside the wireframe, there is a leak.

**Warning signs:**
- Wireframe sidebar shows the FXL Core gold accent instead of the client's brand color
- shadcn/ui `Button` inside wireframe uses app theme instead of wireframe theme
- Dark mode toggle in the app affects wireframe rendering
- Chart colors in the wireframe change when the app's color scheme changes

**Phase to address:**
Phase 1 (Design system setup) -- establish variable namespaces and isolation strategy BEFORE the visual redesign. Retrofitting CSS isolation is much harder than establishing it upfront.

---

### Pitfall 5: Breaking Existing Wireframes When Expanding Blueprint Schema

**What goes wrong:**
The v1.1 milestone adds new capabilities to blueprints: page types beyond dashboards (settings pages, forms), configurable filters, dynamic input blocks. This means changing the `BlueprintScreen` type (new fields like `pageType`, `layoutMode`) and the `BlueprintSection` union (new variants). The pilot client `financeiro-conta-azul` has 10 screens with 50+ sections already in the DB. Schema changes that add required fields or restructure existing types break the pilot's wireframe rendering.

**Why it happens:**
TypeScript types evolve at compile time. DB data does not. The `BlueprintConfig` type is the contract between the visual editor (writes), the renderer (reads), and the DB (stores). Changing the type without migrating existing data creates a runtime mismatch. The `as BlueprintConfig` cast in `blueprint-store.ts` line 16 (`return data.config as BlueprintConfig`) suppresses all type checking on data read from DB -- the actual JSON could be anything.

**How to avoid:**
1. Every new field on existing types MUST be optional with a default. Example: `pageType?: 'dashboard' | 'settings' | 'form'` defaults to `'dashboard'` in the renderer if absent.
2. Replace the `as BlueprintConfig` cast with a runtime validation function using a schema library (zod or valibot). Parse, don't assert. `const result = BlueprintConfigSchema.safeParse(data.config)`. This catches mismatches at read time with clear error messages.
3. Write the migration function BEFORE changing the type. The sequence is: (a) write `migrateV1toV2`, (b) update the type, (c) update the renderers. Never do (b) and (c) without (a).
4. Keep backward compatibility tests: a fixture of the v1.0 `financeiro-conta-azul` config must render without errors in the v1.1 renderer. Add this as a test case.

**Warning signs:**
- The pilot client's wireframe crashes after a type change
- `as BlueprintConfig` hides a runtime type error
- New optional fields are not handled in renderers (showing `undefined` in the UI)
- A "working" wireframe in development breaks when loaded from DB because the dev was using the local seed file (which has the new fields) not the DB data (which does not)

**Phase to address:**
Phase 1 (Schema evolution infrastructure) -- add runtime validation and migration framework. Then Phase 2 (component expansion) can safely add new types knowing the infrastructure catches incompatibilities.

---

### Pitfall 6: AI-Assisted Blueprint Generation Producing Inconsistent or Invalid Output

**What goes wrong:**
The v1.1 milestone includes "blueprint generation via Claude Code from briefing + history." Claude Code reads the briefing, analyzes patterns, and generates a `BlueprintConfig` JSON. The output is structurally valid JSON but semantically inconsistent: section types that do not match the visual intent, KPI labels that are generic placeholders, filter configurations that reference nonexistent data fields, screen IDs that collide, or sections that reference component types not yet in the registry.

**Why it happens:**
LLM-generated code suffers from inconsistency at scale. Research shows only 68.3% of AI-generated projects are reproducible without manual intervention. For structured JSON like `BlueprintConfig` (which has a 15-variant discriminated union, nested arrays, cross-references between screens and filters), the probability of a valid-but-wrong output is high. The model may generate a `drill-down-table` when a `data-table` is appropriate, or omit required fields that TypeScript would catch at compile time but that JSONB storage does not enforce.

Additionally, the generation context is massive: the briefing document, the existing component catalog (22 block specs), the type definitions, and example configs. Claude Code may not consistently apply all constraints from all sources simultaneously.

**How to avoid:**
1. Generate in two passes: (a) structure pass -- screen list, section types, layout -- validated against the type schema before proceeding; (b) detail pass -- populate section properties, KPI labels, filter configs.
2. Validate generated output with the same runtime schema validator from Pitfall 5 (zod/valibot). The generation pipeline must include `BlueprintConfigSchema.parse(output)` before writing to DB. Invalid output should produce actionable error messages, not silent data corruption.
3. Provide Claude Code with a minimal, focused prompt -- not the entire codebase. Include: the `BlueprintSection` type union, the `BlueprintScreen` type, one example config (the pilot), and the specific briefing. Exclude: renderer implementation details, editor code, CSS.
4. Add a "blueprint review" UI step between generation and acceptance. The operator sees the generated blueprint as a textual summary (not just the rendered wireframe) and can approve, reject, or modify before it becomes the source of truth.
5. Enforce uniqueness constraints: screen IDs must be unique slugs, section types must be from the known union, filter keys must not collide within a screen.

**Warning signs:**
- Generated blueprints render but have wrong section types (chart where a table should be)
- Generated screen IDs contain spaces or special characters (breaking URL routing)
- Generated KPI labels are generic ("KPI 1", "Metric 2") instead of domain-specific
- Two consecutive generations from the same briefing produce structurally different blueprints
- Generated config references a section type that does not exist in `SectionRenderer`

**Phase to address:**
Phase 4 (AI-assisted generation) -- this is a later phase because it depends on runtime validation (Phase 1) and the expanded component registry (Phase 2). AI generation without validation infrastructure is dangerous.

---

### Pitfall 7: Bidirectional Sync Complexity When Blueprint Moves to DB

**What goes wrong:**
Today, the visual editor creates a `workingConfig` (deep clone via `structuredClone`), mutates it in memory during editing, and saves the entire config to Supabase on explicit "Save." This is a simple optimistic update pattern. But v1.1 introduces new sync requirements: blueprint must be accessible to Claude Code (for AI generation), must be renderable as text in the UI, must support concurrent editing scenarios (operator edits in UI while Claude Code generates sections), and must handle the transition period where some clients have file-based configs and others have DB configs.

The existing save pattern (`upsert` with `onConflict: 'client_slug'`) does a full document replacement. If Claude Code generates a blueprint section while an operator is editing a different section in the visual editor, the operator's save overwrites Claude's changes (or vice versa).

**Why it happens:**
Document-level granularity (save entire config as one JSONB blob) is simple and worked for single-user editing. Multi-actor editing (human + AI) with document-level saves creates last-write-wins conflicts. The `updated_at` timestamp exists but is not used for conflict detection -- it is informational only.

**How to avoid:**
1. Add optimistic locking: include `updated_at` in the save query's WHERE clause. `UPDATE blueprint_configs SET config = $1, updated_at = now() WHERE client_slug = $2 AND updated_at = $3`. If the row was modified since read, the update affects 0 rows -- detect this and show a conflict resolution UI.
2. For Claude Code access: provide a read-only export path (MD or JSON) that does not participate in the editing flow. Claude Code reads from DB, generates a proposed config, and presents it to the operator for merge -- it does not write directly to the live blueprint.
3. Do NOT implement real-time collaborative editing (Supabase Realtime + OT/CRDT). This is massive complexity for a 1-2 operator tool. Optimistic locking with manual conflict resolution is sufficient.
4. Keep the `structuredClone` + explicit save pattern. It is correct for this scale. Just add conflict detection.

**Warning signs:**
- An operator's edits disappear after saving (overwritten by another actor)
- Claude Code's generated sections do not appear in the wireframe (overwritten by operator save)
- The `updated_at` field shows a time that does not match the operator's last save
- Two browser tabs editing the same client silently overwrite each other

**Phase to address:**
Phase 1 (Blueprint to DB migration) -- add optimistic locking to the save path before any multi-actor scenarios exist. Retrofitting conflict detection after data loss incidents is reactive, not preventive.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `as BlueprintConfig` cast on DB read | Avoids writing a validator | Silent runtime failures when schema evolves | Never after schema versioning is needed (i.e., now) |
| Full-document upsert without version check | Simple save logic | Last-write-wins data loss with multiple actors | Only while single-operator editing is guaranteed |
| Hardcoded `blueprintMap` in SharedWireframeView | Quick client lookup for seeding | Must be updated for every new client; prevents dynamic client discovery | Only during migration period; remove once all clients are DB-only |
| Switch statements in SectionRenderer + defaults.ts | Clear, readable dispatch | Adding a section type requires 6 file changes; easy to miss one | Acceptable at 15 types; unacceptable at 25+. Refactor to registry. |
| CSS variables without namespace enforcement | Less typing | Theme collision between app, brand, and wireframe chrome | Never -- establish prefixes from day one |
| Importing shadcn/ui components inside wireframe components | Reuse existing UI primitives | App theme leaks into wireframe rendering | Only if components are wrapped to remap variables |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase JSONB storage | Trusting `as T` casts -- no runtime validation of stored JSON | Parse with zod/valibot on read. Log validation failures. Return null + show recovery UI rather than crash. |
| Supabase upsert | Using `onConflict` without checking affected row count | Check response `count` or use `updated_at` in WHERE clause for optimistic locking |
| Supabase RLS with anon | Current `anon_*` policies allow any anonymous user to read/write all blueprints | Acceptable for internal tool; but if share links expose blueprint data, scope policies to read-only for share token holders |
| Clerk auth + Supabase | Assuming Clerk user ID format is stable | Store Clerk user ID as `text` (already done). Never parse or structure it. Use as opaque string. |
| Claude Code DB access | Giving Claude Code direct write access to live blueprint | Claude Code should propose, not commit. Read access via MD export or Supabase read query. Write access only through operator-approved merge. |
| pg_jsonschema extension | Adding CHECK constraint on existing column with non-conforming data | Run data migration FIRST, then add constraint. Or use `ALTER TABLE ... ADD CONSTRAINT ... NOT VALID` followed by `VALIDATE CONSTRAINT` |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading entire BlueprintConfig on every page render | Slow initial load for complex wireframes | Cache in React state (already done). Add stale-while-revalidate pattern if adding realtime updates. | At 50+ screens per client (unlikely for dashboards; possible for forms/settings expansion) |
| `structuredClone` on every edit toggle | Noticeable freeze on large configs | Already acceptable at current size. Monitor if configs grow past 500KB. Consider immer for structural sharing. | At 1MB+ config size |
| Unrestricted JSONB column size | Supabase query timeouts on large documents | Add application-level size check before save (warn at 500KB, reject at 2MB). Consider normalizing screens into separate rows if size becomes an issue. | At 2MB+ per config row |
| No index on JSONB contents | Cannot query blueprints by screen type or section type | Add GIN index on `config` column if cross-client queries are needed. Not needed for single-client lookups by `client_slug`. | When searching across all clients' blueprints |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Share links exposing blueprint edit capability | External client could modify the wireframe | Share link flow already uses read-only path. Verify new DB-backed blueprint does not accidentally expose write endpoints via share tokens. |
| AI generation writing directly to production blueprint | LLM hallucination corrupts live wireframe | Generation writes to a `draft` status or separate `blueprint_drafts` table. Operator promotes draft to live. |
| Blueprint JSONB containing client-sensitive data | If blueprints include real financial figures from briefings, share links expose them | Blueprint should contain display labels and mock data only. Real financial data stays in briefing docs (not in DB). |
| Anon RLS policies on blueprint_configs | Any Supabase anon key holder can read/write all blueprints | Acceptable for internal tool. If deploying externally, scope write policies to authenticated Clerk users only. Current migration 003 has full anon read/write. |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual diff when blueprint schema migrates | Operator does not know what changed in their wireframe after an update | Show a "migration applied" banner listing changes: "2 new section types available, 1 field added to KPI cards" |
| Component picker showing all 25+ types in a flat list | Operator overwhelmed; picks wrong component type | Group by category: Charts, Tables, Inputs, Layout, Info. Show preview thumbnails. |
| AI-generated blueprint replacing existing without comparison | Operator loses manual customizations | Show side-by-side diff of current vs generated. Allow per-section accept/reject. |
| Edit mode changes lost on accidental navigation | Operator loses 20 minutes of work | Already partially addressed with `dirty` state and exit confirmation. Extend to browser `beforeunload` event. |
| Wireframe redesign changes client-facing appearance without operator preview | Client sees unexpected visual changes in share link | Add "preview as client" mode that shows exactly what the share link renders |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Blueprint DB migration:** Seed function removed or deprecated, not just bypassed. Check that `seedFromFile` is not silently re-seeding on fresh deploys.
- [ ] **Schema versioning:** `schemaVersion` field exists in stored JSON, not just in TypeScript types. Verify by querying Supabase directly.
- [ ] **New section types:** Every new type has ALL 6 touchpoints: type definition, default factory, section renderer, component, property form, component picker entry.
- [ ] **CSS isolation:** Render wireframe inside app shell with conflicting theme. Verify no app tokens leak into wireframe.
- [ ] **Backward compatibility:** Load the v1.0 pilot config JSON (before v1.1 schema changes) and verify it renders without errors or blank sections.
- [ ] **Optimistic locking:** Open two browser tabs, edit in both, save from both. Second save must show conflict warning, not silently overwrite.
- [ ] **AI generation validation:** Generate a blueprint from a briefing. Verify all section types are in the registry. Verify all screen IDs are valid URL slugs. Verify no required fields are missing.
- [ ] **Dark mode wireframe:** Toggle dark mode in FXL Core app. Verify wireframe rendering is unaffected (wireframe has its own dark/light mode independent of app).
- [ ] **Component picker completeness:** Open component picker in edit mode. Verify every type in `BlueprintSection` union appears. Verify clicking each one adds a valid default section.
- [ ] **Share link after migration:** Access a share link for the pilot client. Verify it loads from DB, not from file fallback.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Dual source of truth (file + DB diverged) | LOW | Query DB for current state. Freeze file. Manually reconcile if needed. One-time operation. |
| JSONB schema drift (old data incompatible) | MEDIUM | Write migration function for each version gap. Run `UPDATE blueprint_configs SET config = migrate(config)` per row. Test each migrated config in renderer. |
| Component sprawl (inconsistent implementations) | HIGH | Audit all section components against contract interface. Refactor to registry. Requires touching every component file. |
| Theme collision (app tokens in wireframe) | MEDIUM | Add CSS layer or `all: initial` to wireframe container. Find-and-replace direct `--primary` references in wireframe components with `--brand-primary` or `--wf-primary`. |
| Broken pilot wireframe after schema change | LOW | Restore from `schemaVersion` migration. If no versioning exists: query Supabase for last known good config via `updated_at`, or restore from seed file. |
| AI generation overwrites manual edits | LOW-MEDIUM | If using draft table: discard draft, keep production config. If wrote directly to production: restore from Supabase backup or version history (if implemented). Without either: manual recreation from memory/screenshots. |
| Last-write-wins conflict (operator changes lost) | HIGH without prevention, LOW with optimistic locking | Without locking: lost data requires manual recreation. With locking: conflict is detected, operator resolves by choosing which version to keep. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Dual source of truth (Pitfall 1) | Phase 1 -- Blueprint DB migration | `seedFromFile` removed. No file-based imports in rendering paths. DB is the only read source. |
| JSONB schema drift (Pitfall 2) | Phase 1 -- Schema versioning infrastructure | `schemaVersion` field in all stored configs. Migration function exists for v1->v2 transition. |
| Component sprawl (Pitfall 3) | Phase 2 -- Component expansion, but refactor BEFORE adding | Registry pattern in place. Adding a new type = 1 registry entry + 2 new files (component + form). |
| Theme collision (Pitfall 4) | Phase 1 -- Design system setup | Variable namespace documented. CSS isolation tested. No `--primary` references in wireframe components. |
| Breaking existing wireframes (Pitfall 5) | Phase 1 -- Runtime validation | zod/valibot schema exists. `as BlueprintConfig` cast replaced with `parse()`. Backward compat test passes. |
| AI generation inconsistency (Pitfall 6) | Phase 4 -- AI-assisted generation | Validation pipeline in place. Two-pass generation. Operator review before commit. |
| Bidirectional sync conflicts (Pitfall 7) | Phase 1 -- Blueprint DB migration | Optimistic locking on save. `updated_at` in WHERE clause. Conflict UI exists. |

## Sources

- FXL Core codebase: `tools/wireframe-builder/lib/blueprint-store.ts` -- current seed/load/save implementation with `as BlueprintConfig` cast (line 16)
- FXL Core codebase: `supabase/migrations/003_blueprint_configs.sql` -- `config jsonb NOT NULL` without schema constraint, anon RLS policies
- FXL Core codebase: `tools/wireframe-builder/types/blueprint.ts` -- 15-variant `BlueprintSection` union, `BlueprintScreen` with optional `rows` field for backward compat
- FXL Core codebase: `tools/wireframe-builder/components/sections/SectionRenderer.tsx` -- switch dispatch returning undefined for unmatched types
- FXL Core codebase: `tools/wireframe-builder/lib/defaults.ts` -- 15-case switch for default section creation
- FXL Core codebase: `src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx` -- `seedFromFile` pattern, `structuredClone` for edit mode, full-document `saveBlueprintToDb`
- FXL Core codebase: `src/pages/SharedWireframeView.tsx` -- hardcoded `blueprintMap` for dynamic imports, parallel seed fallback
- FXL Core codebase: `tools/wireframe-builder/types/branding.ts` -- `--brand-*` prefix convention, JSDoc noting "never --primary/--accent"
- FXL Core codebase: `src/styles/globals.css` -- shadcn semantic tokens (`--primary`, `--accent`), chart tokens, sidebar tokens
- FXL Core codebase: `tools/wireframe-builder/lib/config-resolver.ts` -- `schemaVersion: '1.0'` pattern in GenerationManifest
- FXL Core PROJECT.md: KEY_DECISIONS -- `--brand-*` CSS var prefix to avoid collision, `seedFromFile` only-if-empty pattern
- [Supabase JSONB docs](https://supabase.com/docs/guides/database/json) -- JSONB usage guidelines, schema validation options
- [pg_jsonschema extension](https://supabase.com/docs/guides/database/extensions/pg_jsonschema) -- JSON Schema validation for Postgres CHECK constraints
- [PostgreSQL JSONB migration guide](https://medium.com/@shinyjai2011/zero-downtime-postgresql-jsonb-migration-a-practical-guide-for-scalable-schema-evolution-9f74124ef4a1) -- version tracking, batched migration, transformation functions
- [Design system implementation challenges](https://www.uxpin.com/studio/blog/solving-common-design-system-implementation-challenges/) -- component sprawl, version mismatches, governance
- [AI code generation reproducibility](https://arxiv.org/html/2512.22387v2) -- 68.3% reproducibility rate, dependency gaps
- [Addy Osmani's LLM coding workflow](https://addyosmani.com/blog/ai-coding-workflow/) -- incremental generation, human oversight, context management

---
*Pitfalls research for: Wireframe evolution -- file-to-DB migration, component expansion, design system coexistence, AI blueprint generation*
*Researched: 2026-03-09*
