# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-09
**Phases:** 9 | **Plans:** 27 | **Timeline:** 4 days

### What Was Built
- Documentation platform with 4-section taxonomy and operator onboarding
- Wireframe comment system with Supabase persistence, Clerk auth, and client share links
- 22 block specs as detailed prompts for component generation
- Production-grade visual redesign with semantic tokens and dark mode
- Full wireframe visual editor with drag-reorder, property panels, screen management
- Structured branding process with automatic CSS var and chart color application
- TechnicalConfig schema + Config Resolver → GenerationManifest pipeline
- Product spec generator producing 6 files for BI dashboard generation

### What Worked
- **Rapid iteration:** 27 plans across 9 phases completed in 4 days (~3.5 min avg per plan)
- **Decimal phase insertion:** 02.1, 02.2, 02.3 inserted cleanly without disrupting existing numbering
- **Blueprint-driven architecture:** BlueprintConfig as single source of truth enabled clean editor, branding, and generation pipelines
- **Pure function pattern:** Config Resolver as deterministic pure function made testing trivial
- **Semantic token system:** One migration (Phase 02.3) enabled dark mode across entire app
- **GSD workflow:** Phase → Plan → Execute → Verify cycle kept work focused and traceable

### What Was Inefficient
- **GSKILL requirements orphaned:** Phase 02.3 was repurposed from "Global Skills" to "Reformulacao Visual" but GSKILL-01/02 requirements were not moved to v2 until audit caught it
- **Traceability table drift:** REQUIREMENTS.md traceability table had wrong phase mappings (VISUAL-01/02 mapped to non-existent Phase 02.4) — discovered only during audit
- **Phase 04 missing VERIFICATION.md:** Only phase without independent verification, caught during audit
- **Performance metrics in STATE.md grew unwieldy:** Two separate table formats accumulated, formatting inconsistent

### Patterns Established
- `--brand-*` CSS variable prefix for client branding (avoids collision with app theme)
- `getChartPalette()` returns hex array (recharts SVG doesn't support CSS vars)
- `maybeSingle()` pattern for Supabase queries that may return null
- Spec template: Props table + Visual Description + Conditional States + Sizing Rules
- Screen recipes with layout hints in block spec index
- Spec-gallery sync convention: component changes must update both spec and gallery

### Key Lessons
1. **Run audit before milestone completion** — the audit caught 2 orphaned requirements and 1 missing verification that would have been silently accepted
2. **Update traceability when repurposing phases** — when a phase scope changes, immediately update REQUIREMENTS.md traceability table
3. **Decimal phases work well for urgent insertions** — 3 phases inserted without renumbering, but require careful traceability maintenance
4. **Pure functions for data pipelines** — resolveConfig as pure function was the right call; easy to test and reason about
5. **Verification per phase is non-negotiable** — Phase 04 skipped it and was the only gap flagged

### Cost Observations
- Model mix: ~70% opus, ~30% sonnet (balanced profile)
- Sessions: multiple (context resets between phases)
- Notable: Average plan execution ~3.5 min; total milestone in 4 calendar days

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Timeline | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 4 days | 9 | First milestone — established GSD workflow, decimal phases, audit process |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | Vitest (Phase 06) | spec-generator only | 3 (recharts, @supabase/supabase-js, @clerk/react) |

### Top Lessons (Verified Across Milestones)

1. Run `/gsd:audit-milestone` before completing — catches gaps that session-level verification misses
2. Traceability maintenance is as important as code execution
