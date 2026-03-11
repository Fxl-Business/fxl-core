---
phase: quick-7
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/layout/Sidebar.tsx
autonomous: true
requirements: [QUICK-7]
must_haves:
  truths:
    - "Sidebar client section shows items in order: Briefing, Blueprint, Wireframe, Branding, Changelog"
    - "Clicking Wireframe in the sidebar opens it in a new browser tab"
    - "Clicking Abrir (wireframe row) in the client Index page still opens in a new tab"
  artifacts:
    - path: "src/components/layout/Sidebar.tsx"
      provides: "Corrected nav order + new-tab wireframe link"
  key_links:
    - from: "src/components/layout/Sidebar.tsx"
      to: "/clients/financeiro-conta-azul/wireframe"
      via: "<a target='_blank'> instead of NavLink"
      pattern: "target.*_blank"
---

<objective>
Fix two bugs in the client sidebar:
1. Wrong order — Wireframe appears after Branding/Changelog but should come before them (matching the Index page order).
2. Wrong navigation — clicking Wireframe navigates in the current tab but should always open in a new tab.

Purpose: Consistent UX between the client Index page (already correct) and the sidebar navigation.
Output: Updated Sidebar.tsx with corrected order and target="_blank" for the wireframe link.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

The two issues are co-located in a single file and require no new dependencies.
</context>

<interfaces>
<!-- Key implementation facts extracted from codebase. -->

From src/components/layout/Sidebar.tsx — current client nav order (lines 115-121):
```typescript
// WRONG order
{ label: 'Briefing',  href: '/clients/financeiro-conta-azul/briefing' },
{ label: 'Blueprint', href: '/clients/financeiro-conta-azul/blueprint' },
{ label: 'Branding',  href: '/clients/financeiro-conta-azul/branding' },
{ label: 'Changelog', href: '/clients/financeiro-conta-azul/changelog' },
{ label: 'Wireframe', href: '/clients/financeiro-conta-azul/wireframe' },
```

NavItem type (lines 7-11):
```typescript
type NavItem = {
  label: string
  href?: string
  children?: NavItem[]
  external?: boolean  // ADD THIS FIELD to support new-tab links
}
```

NavSection leaf node renderer (lines 152-168) — currently always renders NavLink.
Wireframe link must render as `<a href={item.href} target="_blank" rel="noopener noreferrer">` when `item.external === true`.

From src/pages/clients/FinanceiroContaAzul/Index.tsx — reference pattern already used there:
```tsx
<a
  href={item.href}
  target="_blank"
  rel="noopener noreferrer"
  className="text-indigo-600 ..."
>
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Fix sidebar order and add external link support for Wireframe</name>
  <files>src/components/layout/Sidebar.tsx</files>
  <action>
    Make two targeted changes to Sidebar.tsx:

    **Change 1 — Correct nav order** (Clientes > Financeiro Conta Azul children array):
    Reorder the children array so Wireframe comes BEFORE Branding and Changelog:
    ```
    Briefing -> Blueprint -> Wireframe -> Branding -> Changelog
    ```
    Also add `external: true` to the Wireframe item.

    **Change 2 — Add `external` field to NavItem type**:
    ```typescript
    type NavItem = {
      label: string
      href?: string
      children?: NavItem[]
      external?: boolean
    }
    ```

    **Change 3 — Handle external leaf nodes in NavSection**:
    In the leaf node render branch (the `if (!hasChildren && item.href)` block), add a guard before the NavLink:
    ```tsx
    if (!hasChildren && item.href) {
      if (item.external) {
        return (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm transition-colors text-slate-500 hover:text-indigo-600 dark:text-sidebar-muted-foreground dark:hover:text-sidebar-accent"
          >
            {item.label}
          </a>
        )
      }
      // ...existing NavLink rendering unchanged
    }
    ```

    Do NOT add `external` to any other nav items. Do NOT change any other part of the file.
  </action>
  <verify>
    <automated>cd /Users/cauetpinciara/Documents/fxl/fxl-core && npx tsc --noEmit</automated>
  </verify>
  <done>
    - TypeScript compiles with zero errors
    - Sidebar.tsx children for financeiro-conta-azul are in order: Briefing, Blueprint, Wireframe, Branding, Changelog
    - Wireframe nav item has `external: true`
    - NavSection renders external items as `<a target="_blank">` not NavLink
  </done>
</task>

</tasks>

<verification>
Run `npx tsc --noEmit` — must produce zero errors.

Manual spot-check (after `make dev`):
- Open the sidebar, expand Financeiro Conta Azul
- Confirm order: Briefing, Blueprint, Wireframe, Branding, Changelog
- Click Wireframe — must open in a new browser tab, not navigate in current tab
</verification>

<success_criteria>
Sidebar order matches the Index page order. Clicking Wireframe in the sidebar always opens in a new tab. Zero TypeScript errors.
</success_criteria>

<output>
After completion, create `.planning/quick/7-fix-client-sidebar-order-and-open-wirefr/7-SUMMARY.md`
</output>
