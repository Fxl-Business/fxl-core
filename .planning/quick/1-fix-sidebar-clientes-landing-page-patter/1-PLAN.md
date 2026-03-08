---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified: [src/components/layout/Sidebar.tsx]
autonomous: true
requirements: [QUICK-1]

must_haves:
  truths:
    - "Clicking 'Financeiro Conta Azul' in sidebar navigates to /clients/financeiro-conta-azul"
    - "'Visao Geral' no longer appears as a separate child under Financeiro Conta Azul"
    - "Wireframe Builder sub-items (Blocos Disponiveis, Galeria) are visually indented deeper than their parent"
  artifacts:
    - path: "src/components/layout/Sidebar.tsx"
      provides: "Fixed sidebar navigation data and depth-based padding"
  key_links:
    - from: "Clientes > Financeiro Conta Azul"
      to: "/clients/financeiro-conta-azul"
      via: "href on parent NavItem"
      pattern: "label.*Financeiro Conta Azul.*href.*clients/financeiro-conta-azul"
---

<objective>
Fix two sidebar navigation issues: (1) Make Clientes section use the landing page pattern where the client name itself is clickable and navigates to the overview page, removing the redundant "Visao Geral" child. (2) Increase left padding on deeply nested items (depth 2+) so Wireframe Builder sub-items are visually distinguishable from their parent.

Purpose: Consistent navigation patterns across all sidebar sections and better visual hierarchy for nested items.
Output: Updated Sidebar.tsx with both fixes.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/layout/Sidebar.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix Clientes landing page pattern and sub-item indentation</name>
  <files>src/components/layout/Sidebar.tsx</files>
  <action>
Two changes in Sidebar.tsx:

**Change 1 — Clientes navigation data (lines 109-124):**

Replace the current Clientes entry:
```ts
{
  label: 'Clientes',
  children: [
    {
      label: 'Financeiro Conta Azul',
      children: [
        { label: 'Visao Geral', href: '/clients/financeiro-conta-azul' },
        { label: 'Briefing', href: '/clients/financeiro-conta-azul/briefing' },
        ...
      ],
    },
  ],
}
```

With the landing page pattern (matching Processo, Fases, Tech Radar):
```ts
{
  label: 'Clientes',
  children: [
    {
      label: 'Financeiro Conta Azul',
      href: '/clients/financeiro-conta-azul',
      children: [
        { label: 'Briefing', href: '/clients/financeiro-conta-azul/briefing' },
        { label: 'Blueprint', href: '/clients/financeiro-conta-azul/blueprint' },
        { label: 'Branding', href: '/clients/financeiro-conta-azul/branding' },
        { label: 'Changelog', href: '/clients/financeiro-conta-azul/changelog' },
        { label: 'Wireframe', href: '/clients/financeiro-conta-azul/wireframe' },
      ],
    },
  ],
}
```

Key changes:
- Add `href: '/clients/financeiro-conta-azul'` to "Financeiro Conta Azul" entry
- Remove the `{ label: 'Visao Geral', href: '/clients/financeiro-conta-azul' }` child entirely

**Change 2 — Increase depth-based padding for leaf nodes (lines 158-160):**

In the leaf node NavLink className, update the depth-based padding classes:
- `depth === 2 && 'pl-6'` -> `depth === 2 && 'pl-8'`
- `depth === 3 && 'pl-9'` -> `depth === 3 && 'pl-11'`
- Add: `depth >= 4 && 'pl-14'` for the deepest items (individual block spec pages under Blocos Disponiveis)

Also add depth-based padding to the "parent with href" branch (lines 176-217) since parents like "Blocos Disponiveis" (depth=3) and "Wireframe Builder" (depth=2) need matching indentation. In the outer div's className on line 176, add depth-based padding:
- `depth === 2 && 'pl-8'`
- `depth === 3 && 'pl-11'`

And in the "parent without href" branch (lines 221-246), the button className also needs matching padding for depth >= 2:
- `depth === 2 && 'pl-8'`
- `depth === 3 && 'pl-11'`

This ensures both parent items and their leaf children align at the same indentation level per depth.
  </action>
  <verify>
    <automated>cd /Users/cauetpinciara/Documents/fxl/fxl-core && npx tsc --noEmit</automated>
  </verify>
  <done>
    - "Financeiro Conta Azul" has href pointing to /clients/financeiro-conta-azul
    - No "Visao Geral" child exists under Financeiro Conta Azul
    - Depth 2 items have pl-8, depth 3 items have pl-11, depth 4+ items have pl-14
    - All three NavSection branches (leaf, parent-with-href, parent-without-href) apply consistent depth padding
    - TypeScript compiles with zero errors
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with zero errors
- Grep for "Visao Geral" in Sidebar.tsx returns zero matches (under Clientes section)
- Grep for "financeiro-conta-azul" shows href on the parent item
- Grep for "pl-8" and "pl-11" confirms new padding values
</verification>

<success_criteria>
- Clientes > Financeiro Conta Azul is clickable and navigates to /clients/financeiro-conta-azul
- No separate "Visao Geral" child under Financeiro Conta Azul
- Wireframe Builder sub-items (Blocos Disponiveis, Galeria) are visually indented further from their parent
- TypeScript compiles cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/1-fix-sidebar-clientes-landing-page-patter/1-SUMMARY.md`
</output>
