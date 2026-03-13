---
phase: 34
plan: 01
name: Schema Extension + Grouped Bar, Step Line, Lollipop, Polar
status: complete
completed: 2026-03-13
commit: c738499
---

## One-Liner

Extended ChartType union with all 7 new literals and implemented 4 chart components (GroupedBar, StepLine, Lollipop, PolarArea) with full ChartRenderer wiring.

## What Was Done

- Added 7 new values to ChartType union in `types/blueprint.ts`: grouped-bar, bullet, step-line, lollipop, range-bar, bump, polar
- Added 7 new values to z.enum in `lib/blueprint-schema.ts`
- Added 7 new SelectItem entries in `BarLineChartForm.tsx`
- Created 4 leaf chart components: GroupedBarChartComponent, StepLineChartComponent, LollipopChartComponent, PolarAreaChartComponent
- Wired 4 new case branches in ChartRenderer.tsx
- All components use `isAnimationActive={false}`, accept `chartColors`, and use `--wf-*` CSS tokens

## Files Changed

- tools/wireframe-builder/types/blueprint.ts
- tools/wireframe-builder/lib/blueprint-schema.ts
- tools/wireframe-builder/components/editor/property-forms/BarLineChartForm.tsx
- tools/wireframe-builder/components/GroupedBarChartComponent.tsx (new)
- tools/wireframe-builder/components/StepLineChartComponent.tsx (new)
- tools/wireframe-builder/components/LollipopChartComponent.tsx (new)
- tools/wireframe-builder/components/PolarAreaChartComponent.tsx (new)
- tools/wireframe-builder/components/sections/ChartRenderer.tsx

## Deviations

None.
