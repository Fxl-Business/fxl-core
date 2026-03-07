# Research Summary: FXL Automated BI Dashboard Generation

**Domain:** Automated BI Dashboard Generation from Declarative Blueprints
**Researched:** 2026-03-07
**Overall confidence:** HIGH

## Executive Summary

FXL needs to bridge the gap between approved wireframes (Phase 2) and functional BI dashboards (Phase 3). The existing system has a strong declarative foundation: a typed `BlueprintConfig` with 15 section types drives wireframe rendering through a discriminated union dispatch pattern. The pilot client (`financeiro-conta-azul`) has a complete 10-screen financial dashboard blueprint with 1400+ lines of declarative config. The missing piece is a `TechnicalConfig` that adds data semantics (data sources, business logic, auth, normalization rules) to the visual specification, plus a code generator that transforms both configs into a standalone Next.js project.

The recommended stack for generated projects is **Next.js 16 (App Router) + Supabase + Tailwind 3.x**, deployed on **Vercel**. This aligns with FXL's existing Tech Radar -- Supabase and Vercel are active standards, and Next.js is the documented exception for projects needing API routes (which BI dashboards with CSV import do). The key architectural decision is using Next.js Route Handlers for server-side data processing (CSV/XLSX parsing, KPI aggregation) rather than a pure SPA approach that would require a separate backend.

The code generator lives in FXL Core as a new tool (`tools/project-generator/`) following the existing `tools/wireframe-builder/` pattern. It reads three inputs (BlueprintConfig + TechnicalConfig + Branding), merges them into a GenerationManifest, and produces concrete TypeScript code that looks hand-written. The output project is fully standalone with zero runtime dependency on FXL Core.

The most critical pitfall is conflating wireframe types with data types. The existing BlueprintConfig has hardcoded display values (`value: 'R$ 485.200'`) that cannot drive a real system. The TechnicalConfig schema design is the single most important architectural decision -- getting it wrong forces a rewrite of everything built on top.

## Key Findings

**Stack:** Next.js 16.1.6 + Supabase JS 2.98.0 + recharts 3.8.0 + TanStack Table 8.21.3 + Tailwind 3.x, deployed on Vercel. All versions verified via npm registry 2026-03-07.

**Architecture:** Three-config merge (Blueprint + Technical + Branding) into GenerationManifest, then section-type dispatch to generate concrete code. Server-side data processing via Next.js Route Handlers.

**Critical pitfall:** Treating the wireframe BlueprintConfig as a data model. It describes display layout, not data semantics. The TechnicalConfig is the bridge that must be designed first and right.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **TechnicalConfig Schema + Config Resolver** - Define the new type system that bridges wireframe and functional system
   - Addresses: Data source declaration, KPI formula definitions, cross-screen dependencies
   - Avoids: Wireframe-as-data-model pitfall, compare mode complexity explosion
   - Likely needs: Deeper research on formula expression engine approach

2. **Scaffold Generation + Template Registry** - Generate runnable (empty) Next.js 16 projects from config
   - Addresses: Project scaffolding, environment setup, Supabase migration templates
   - Avoids: Wrong Next.js patterns pitfall (verify all templates against v16 docs)
   - Standard patterns: unlikely to need additional research

3. **Data Pipeline (Upload + Processing + Storage)** - Build Tela 9 upload and data normalization first
   - Addresses: CSV/XLSX import, Brazilian format handling, validation feedback
   - Avoids: Upload/ETL underestimation pitfall
   - Likely needs: Deeper research on Conta Azul export format specifics

4. **Dashboard Screen Generation** - Generate pages, components, and hooks for data-displaying screens
   - Addresses: KPI cards, charts, tables, drill-down, filters
   - Avoids: Monolithic components pitfall (enforce 150-line limit)
   - Includes: Compare mode as first-class concern, not afterthought

5. **Auth + Configuration + Polish** - Add auth, Tela 10 with cross-screen deps, empty states
   - Addresses: Authentication, role-based access, runtime configuration, onboarding flow
   - Avoids: RLS-missing pitfall, config-screen-disconnected pitfall

**Phase ordering rationale:**
- TechnicalConfig first because it is the foundation. Every other phase depends on its schema.
- Scaffold before data pipeline because it proves the generation engine works on the simplest case.
- Data pipeline before dashboard screens because screens without data are useless. Upload is the foundation.
- Dashboard generation is the bulk phase but builds on proven foundations.
- Auth and config last because they enhance but do not block the core data-to-visualization pipeline. (However, RLS in migrations is enforced from phase 2 onward.)

**Research flags for phases:**
- Phase 1: Likely needs deeper research on expression engine for KPI formulas. Should the formula be SQL-like, JavaScript-like, or a custom DSL?
- Phase 3: Likely needs deeper research on Conta Azul export formats. Column names may vary by account type or export version.
- Phase 4: Standard patterns (React Query hooks, recharts components), unlikely to need research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via npm registry. Next.js docs verified via WebFetch. FXL Tech Radar aligns with recommendations. |
| Features | HIGH | Feature landscape derived directly from the pilot client's complete 10-screen blueprint specification. |
| Architecture | HIGH | Architecture extends proven patterns already in FXL Core (discriminated union dispatch, declarative config). TechnicalConfig schema needs validation during implementation. |
| Pitfalls | HIGH | Pitfalls grounded in codebase analysis (hardcoded display values in BlueprintConfig, 1400-line config file, compare mode rules in blueprint.md). Next.js 16 specifics verified in official docs. |

## Gaps to Address

- **Formula expression engine:** The TechnicalConfig needs KPI formulas. Is a SQL subset sufficient, or does it need a custom expression language? Needs phase-specific research.
- **Conta Azul export specifics:** Column names, date formats, and number formats in real Conta Azul exports. The blueprint references these but the actual files have not been analyzed.
- **Supabase views vs RPC for aggregations:** For KPI computation, should the generator create Postgres views or Supabase RPC functions? Both are valid. Needs experimentation during Phase 3.
- **recharts 2.x to 3.x migration patterns:** FXL Core uses recharts 2.13.3. Generated projects will use 3.8.0. API differences between major versions need mapping.
- **Tailwind 3 vs 4 timeline:** Generated projects use Tailwind 3.x for compatibility with FXL Core's component library. When should the ecosystem migrate to Tailwind 4? Not blocking but worth tracking.
- **@supabase/ssr integration specifics:** Cookie-based auth with Next.js 16 App Router requires middleware configuration. Patterns exist but need verification with current SDK version.

---
*Research summary for: FXL Automated BI Dashboard Generation*
*Researched: 2026-03-07*
