# Phase 142: Integration and QA - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire diagram click-to-scroll navigation (clicking a module node in the SVG diagram scrolls to the corresponding ModuleOverviewCard with a visible ring highlight) and complete a full system QA pass ensuring zero stale references, zero TypeScript errors, and no leftover toggle/tenant-selector UI in ModulesPanel.

</domain>

<decisions>
## Implementation Decisions

### Click-to-Scroll Navigation
- Each ModuleOverviewCard has an `id` attribute matching the module ID (e.g., `id="module-card-docs"`)
- Diagram node onClick calls `document.getElementById('module-card-{moduleId}')?.scrollIntoView({ behavior: 'smooth', block: 'center' })`
- After scrolling, apply a temporary ring highlight class (ring-2 ring-indigo-500) to the target card
- Ring highlight auto-removes after 2 seconds via setTimeout + state cleanup
- No URL hash manipulation — purely visual scroll + highlight

### Ring Highlight Mechanism
- Parent page (ModulesPanel) holds `highlightedModuleId: string | null` state
- Diagram receives an `onNodeClick: (moduleId: string) => void` callback prop
- onNodeClick sets highlightedModuleId, triggers scrollIntoView, and schedules a 2s setTimeout to clear it
- ModuleOverviewCard receives `highlighted: boolean` prop and applies conditional ring classes
- Transition classes for smooth ring appearance: `transition-shadow duration-300`

### Diagram Node Cursor
- Nodes show `cursor-pointer` to indicate clickability
- On click, node briefly flashes (opacity pulse) as visual feedback before scroll begins

### QA Scope
- Verify `grep -r "admin/modules" src/` returns zero results inside TenantDetailPage.tsx (stale deep-link removed in Phase 139)
- Verify `grep -r "<Switch" src/platform/pages/admin/ModulesPanel` returns zero results (toggles removed in Phase 139)
- Verify `npx tsc --noEmit` passes with zero errors
- Visual check: diagram + cards render correctly in both dark and light mode
- Visual check: click any node and confirm smooth scroll + ring highlight on card

### Claude's Discretion
- Exact Tailwind ring color tokens (follow existing indigo accent pattern)
- ScrollIntoView timing and easing details
- Any minor cleanup or import tidying discovered during QA

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- src/platform/pages/admin/ModulesPanel.tsx — page container where diagram and cards coexist (after Phase 140+141)
- src/platform/module-loader/registry.ts — MODULE_REGISTRY array with ModuleDefinition (id, label, description, status, icon, extensions)
- ModuleDependencyDiagram component (created in Phase 140) — SVG diagram with hover highlighting
- ModuleOverviewCard component (created in Phase 141) — read-only card grid

### Established Patterns
- Ring highlight on interactive elements: ring-2 ring-indigo-500/50 dark:ring-indigo-400/50 (used in focus states across admin pages)
- Smooth transitions: transition-shadow duration-300 (consistent with existing card hover effects)
- useState + setTimeout for temporary UI states (toast auto-dismiss pattern)

### Integration Points
- ModuleDependencyDiagram — add onNodeClick prop to existing component
- ModuleOverviewCard — add highlighted prop and id attribute
- ModulesPanel.tsx — wire highlightedModuleId state between diagram and cards
- TenantDetailPage.tsx — verify stale "admin/modules" link is gone (Phase 139 deliverable)

</code_context>

<specifics>
## Specific Ideas

- Use a ref-based approach if getElementById feels too imperative — but getElementById is simpler and avoids ref-forwarding complexity across component boundaries
- The 2-second highlight duration matches typical toast durations and feels natural
- QA grep commands should be run as verification tasks, not just acceptance criteria — the plan should include explicit grep steps

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
