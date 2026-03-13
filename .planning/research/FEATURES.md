# Feature Research

**Domain:** Wireframe builder — configurable layout components (sidebar widgets, header configurator, filter bar editor)
**Researched:** 2026-03-13
**Confidence:** HIGH (based on direct codebase analysis) / MEDIUM (for UX pattern conventions)

---

## Context: What Already Exists vs What Is New

This research is scoped to **v2.2 additions only**. The visual editor already exists and works
(AdminToolbar, PropertyPanel via Sheet, ScreenManager, EditableSectionWrapper, 28 property forms).
The goal is to extend it to cover layout-level config: sidebar, header, and filter bar.

### Already built (not in scope)

- PropertyPanel system (Sheet, section-registry-driven property forms)
- ScreenManager (add/rename/delete/reorder screens in sidebar)
- AdminToolbar (edit mode toggle, save, share, comments)
- SidebarConfig schema: `footer?: string`, `groups?: SidebarGroup[]`
- HeaderConfig schema: `showLogo`, `showPeriodSelector`, `showUserIndicator`, `actions.*`
- FilterOption[] per screen (rendered by WireframeFilterBar — select, date-range, multi-select, search, toggle)
- filter-config section block (editable via PropertyPanel)
- WireframeViewer renders sidebar groups and footer from `config.sidebar`
- WireframeHeader renders logo from `config.header.showLogo` + branding.logoUrl

### Not yet built (v2.2 scope)

- Compound sidebar widgets (workspace switcher, account selector, user menu, search)
- SidebarConfig schema extensions for widget fields
- Visual editor panels to edit SidebarConfig (footer text, groups, widgets)
- Visual editor panels to edit HeaderConfig (all fields as toggles/inputs)
- Visual editor to add/remove/configure FilterOption[] per screen (sticky bar filters)
- WireframeHeader wired to respect showPeriodSelector and showUserIndicator (schema exists, render ignores them)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features a wireframe builder operator expects when "configuring the sidebar/header/filter bar."
Missing any of these means the config feels incomplete or read-only.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Toggle header fields on/off (showLogo, showPeriodSelector, showUserIndicator) | HeaderConfig already has these booleans — they should be editable, not dead schema | LOW | Schema exists. Needs: Sheet panel with toggle switches per field. WireframeHeader already reads `showLogo`. `showPeriodSelector` and `showUserIndicator` are schema-only today — render doesn't use them. Need render wiring before editor panel is useful. |
| Toggle header action buttons (manage, share, export) | `actions.*` already in schema — operators want to control which buttons appear in the demo header | LOW | Same gap: schema exists, WireframeHeader render ignores `actions.*`. Need: render wiring + editor panel. |
| Edit sidebar footer text | `footer?: string` is in SidebarConfig and already rendered in WireframeViewer. Operator needs to change it without editing the config file. | LOW | Single text input in sidebar config panel. Already rendered at line 939 of WireframeViewer. |
| Edit sidebar group labels and membership | `groups?: SidebarGroup[]` is in schema and rendered. Needs a visual editor to create/rename groups and assign screens. | MEDIUM | Create/delete group. Rename group label. Assign screens by checkbox or select (no drag-and-drop required — a multi-select per group is sufficient). |
| Add/remove filter controls per screen | FilterOption[] lives on each BlueprintScreen. Operators should be able to add a new filter (select type, key, label, options) and remove existing ones for the currently active screen. | MEDIUM | Panel opens for current screen. "Add filter" button adds a new row. Delete per item. Existing WireframeFilterBar already renders all filterTypes correctly — no render changes needed. |
| Configure filter label and options | Each FilterOption has label, options[], filterType. These need to be editable inline. | MEDIUM | Inline editable rows in filter bar panel. Label text input, filterType select, options as comma-separated or add-one-at-a-time tags. |
| Workspace switcher widget in sidebar header | shadcn sidebar-07 (team-switcher.tsx) pattern: a dropdown chip in the sidebar header showing org/workspace name. For wireframes this is decorative — operator sets the label text. | LOW-MEDIUM | Schema: new `headerWidget?: 'workspace-switcher' \| 'none'` + `workspaceName?: string` in SidebarConfig. Renderer: static mock dropdown chip in sidebar header. Editor: toggle + label input. |
| User menu widget in sidebar footer | shadcn sidebar-07 (nav-user.tsx) pattern: avatar + name + role + dropdown chevron in sidebar footer. For wireframes uses mock data or config-level label. | LOW | Schema: `footerWidget?: 'user-menu' \| 'status' \| 'none'`. Currently footer renders a "Sistema Ativo" status chip (line 931-944 of WireframeViewer). Operator should toggle between status chip and user menu. |

### Differentiators (Competitive Advantage)

Features beyond table stakes that improve the operator's iteration speed or expand wireframe fidelity.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Account selector widget (sidebar secondary slot) | Lets operators mock a "client/account" switcher below the workspace switcher — common in SaaS BI products that support multi-tenant views. Useful for demos. | MEDIUM | Schema: `accountSelector?: { label: string; options?: string[] }` in SidebarConfig. Renderer: a compact dropdown chip in sidebar header, stacked below workspace switcher. Editor: toggle + label + options list. |
| Search widget in sidebar nav | A disabled search box inside the sidebar nav area (above screens list). shadcn sidebar-07 includes this. Purely decorative in wireframe context but signals "this is a real product." | LOW | Schema: `showSearch?: boolean` in SidebarConfig. Renderer: a disabled input with Search icon above the nav list. No state needed. |
| Filter "add from library" presets | Quick-add common BI filter presets: "Período Mensal", "Empresa", "Produto", "Status", "Responsável". Saves operator time vs configuring from scratch. | LOW | Just hardcoded FilterOption templates in the filter editor panel. One-click adds pre-filled rows. No schema change. |
| Header brandLabel override | Currently brandLabel shown in WireframeHeader comes from `config.label`. Operator may want a shorter display name without renaming the whole blueprint. | LOW | Schema: `header.brandLabel?: string`. Editor: text input that falls back to config.label. WireframeHeader already accepts `brandLabel` prop — needs to read from config instead of always using config.label. |
| Period selector type at dashboard level | `hasCompareSwitch` and `periodType` are per-screen. A dashboard-level `header.periodType` lets the header period selector match the default without per-screen override. | LOW | Schema: `header.periodType?: 'mensal' \| 'anual'`. Editor: radio/select in header panel. Improves wireframe coherence for demos. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Drag-and-drop screens between sidebar groups | Intuitive visual reorganization | Requires a second @dnd-kit context inside the sidebar config panel, layered on top of the existing ScreenManager DnD. Adds interaction complexity, testing surface, and conflicts with the existing DnD sortable context in ScreenManager. | Multi-select assign: a simple "Grupo" select or checkbox per screen in the group editor. Same end state, zero DnD complexity. |
| Replace custom sidebar with shadcn SidebarProvider | Code consistency with shadcn sidebar-07 | WireframeViewer sidebar is intentionally a custom fixed-position layout outside the app theme. Switching would require restructuring the entire WireframeViewer layout tree and break the `--wf-sidebar-*` CSS var system and dark chrome. | Use shadcn sidebar-07 as a visual widget reference only, not as structural infrastructure. |
| Full shadcn Sidebar component integration | "Use the component we already have" | The app uses one sidebar (the FXL Core navigation); the wireframe uses a second custom sidebar. Two Sidebar infrastructure systems in the same app creates CSS var collision between `--sidebar-*` (shadcn) and `--wf-sidebar-*` (wireframe). | Design reference only: adopt the visual widget patterns (workspace switcher appearance, user menu appearance) without adopting shadcn Sidebar primitives. |
| Per-screen header config overrides | Flexibility | Adds schema complexity (array of per-screen overrides vs single dashboard-level config), increases PropertyPanel surface area, and the wireframe header is intentionally global chrome. | Dashboard-level HeaderConfig is the right boundary. Screen-level variation belongs in the filter bar, not the header. |
| Live filter logic (filtering actual section content) | Looks "real" | Wireframes use mock data. Implementing real filter dispatch across 28 section types would require connecting all components to a filter context, which is product-level scope (the generated dashboard, not the wireframe tool). | Keep filters as interactive UI decorations: correct visual states (toggles toggle, selects open) without affecting mock data. |
| Sidebar widget drag reordering between zones | Power-user flexibility | The sidebar has three fixed zones (header widget, nav, footer widget). Allowing free zone reorder adds complex config with no meaningful wireframe fidelity gain. | Fixed zone positions (header / nav / footer) with per-zone configuration options. Simple and sufficient for dashboard wireframe demonstrations. |

---

## Feature Dependencies

```
[Header Config Panel]
    └──requires──> [WireframeHeader wires showPeriodSelector + showUserIndicator + actions.* to render]
                       (currently schema only — renderer ignores these fields entirely)
                       (without this wiring, the panel edits fields with no visual effect)

[Filter Bar Editor Panel]
    └──requires──> [updateWorkingScreen() — already exists in WireframeViewer]
                       (same mutation pattern as section operations, just mutates screen.filters instead)
    └──requires──> [Editor entry point in edit mode]
                       (how does the operator open the panel? most natural: click on WireframeFilterBar
                        area in edit mode shows "Configure filtros desta tela" Sheet)

[Sidebar Config Panel]
    └──requires──> [updateWorkingConfig() helper for top-level (non-screen) mutations]
                       (currently only updateWorkingScreen() exists — need a config-root patcher)
    └──requires──> [SidebarConfig schema extension for widget fields]

[SidebarConfig schema extension]
    └──requires──> [Zod schema update in blueprint-schema.ts + TypeScript type update in blueprint.ts]
                       (additive — no breaking change to existing fields)

[Sidebar widget renderers]
    └──requires──> [SidebarConfig schema extension for widgets]
    └──requires──> [WireframeViewer sidebar inline render updated to conditionally show widget slots]

[Account Selector widget]
    └──enhances──> [Workspace Switcher widget]
                       (they occupy different sidebar header slots — stacked vertically, same panel)

[Filter "add from library" presets]
    └──enhances──> [Filter Bar Editor Panel]
                       (preset templates — convenience layer, no schema dependency)
```

### Dependency Notes

- **WireframeHeader render wiring is the critical first step for header config:** `showPeriodSelector` and `showUserIndicator` exist in HeaderConfig schema but WireframeHeader currently only reads `showLogo`. The header config panel has zero visual effect until the renderer is wired. This is a prerequisite, not an assumption.
- **updateWorkingConfig() is the critical first step for sidebar/header panels:** Currently only `updateWorkingScreen()` mutates the working config. Header and sidebar config live at the config root level, not inside a screen. A new helper patching `workingConfig.sidebar` / `workingConfig.header` follows the identical pattern and must exist before any panel can commit changes.
- **Filter Bar Editor uses existing updateWorkingScreen:** Unlike sidebar/header, filters live on each BlueprintScreen (`screen.filters: FilterOption[]`). The existing `updateWorkingScreen()` can mutate this directly — no new helper needed.
- **Schema extension must precede all new renderers and editor panels:** Any new field on SidebarConfig or HeaderConfig must first be added to blueprint-schema.ts (Zod) and blueprint.ts (TypeScript type). Only then can renderers read it and panels write it. This is a single-file change per schema file — low cost, but the order matters.
- **shadcn sidebar-07 is a visual reference, not a code dependency:** The compound widget patterns (workspace switcher = team-switcher.tsx, user menu = nav-user.tsx) inform what the wireframe widgets should look like, but their code should not be imported — the wireframe uses custom components with `--wf-*` tokens.

---

## MVP Definition

### Launch With (v2.2 core)

Minimum viable — makes sidebar, header, and filter bar feel actually configurable, not hardcoded schema.

- [ ] Wire `showPeriodSelector` and `showUserIndicator` in WireframeHeader render — prerequisite for header config panel to have any visual effect
- [ ] Wire `actions.*` in WireframeHeader render — actions.manage/share/export toggle visibility
- [ ] `updateWorkingConfig()` helper in WireframeViewer for config-level (sidebar/header) mutations
- [ ] SidebarConfig schema extension: `headerWidget`, `workspaceName`, `footerWidget`, `showSearch` fields (Zod + TypeScript)
- [ ] Header Config Panel (Sheet) — toggles for showLogo, showPeriodSelector, showUserIndicator, actions.manage/share/export — opened from AdminToolbar in edit mode
- [ ] Sidebar Config Panel (Sheet) — text input for footer, group editor (create/rename/delete groups, assign screens by checkbox)
- [ ] Filter Bar Editor Panel (Sheet) — add/remove FilterOption rows per screen, configure key/label/filterType/options — opened by clicking WireframeFilterBar in edit mode
- [ ] Workspace Switcher widget renderer in sidebar header (decorative — dropdown chip with label + chevron)
- [ ] User Menu widget renderer in sidebar footer (alternate to status chip — shows avatar initials + name/role)

### Add After Core Is Working (v2.2 polish)

- [ ] Search widget in sidebar nav top (showSearch: boolean, decorative disabled input above nav)
- [ ] Account Selector widget in sidebar header (secondary slot below workspace switcher)
- [ ] Filter "add from library" presets (Período, Empresa, Produto, Status, Responsável templates)
- [ ] Header brandLabel override field in Header Config Panel
- [ ] AdminToolbar explicit buttons for sidebar and header panels (visible in edit mode alongside "Editar")

### Future Consideration (v2.3+)

- [ ] Header periodType at dashboard level (header.periodType: 'mensal' | 'anual')
- [ ] Sidebar icon assignment via sidebar config panel (currently only via ScreenManager per-screen)
- [ ] Sidebar badge count configuration per screen (currently schema-only, not editable)
- [ ] Mobile sidebar drawer mode (responsive — explicitly out of scope per PROJECT.md)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Wire showPeriodSelector / showUserIndicator / actions.* in WireframeHeader | HIGH — blocks all header config having any visual effect | LOW (3-4 conditional renders in WireframeHeader.tsx) | P1 |
| updateWorkingConfig() for top-level mutations | HIGH — blocks sidebar + header panels from working | LOW (copy updateWorkingScreen pattern, targets config root) | P1 |
| Filter Bar Editor Panel | HIGH — filter bar is the most per-screen-variable element | MEDIUM (list CRUD + filterType dispatch in Sheet) | P1 |
| SidebarConfig schema extension for widget fields | HIGH — blocks widget renderers from compiling | LOW (additive Zod + TypeScript fields) | P1 |
| Header Config Panel | HIGH — operators need to control logo/period/user/actions visibility | LOW (4-6 toggles in Sheet) | P1 |
| Sidebar Config Panel (footer + groups) | HIGH — groups and footer text are schema-only today | MEDIUM (group CRUD with screen assignment checkboxes) | P1 |
| Workspace Switcher widget renderer | MEDIUM — visible sidebar widget for demos | LOW (static dropdown mock in sidebar header zone) | P2 |
| User Menu widget renderer | MEDIUM — sidebar footer alt to status chip | LOW (static avatar chip, replaces status chip) | P2 |
| Search widget in sidebar | LOW — decorative, purely visual | LOW (disabled input) | P2 |
| Filter "add from library" presets | MEDIUM — saves operator time | LOW (hardcoded templates, no schema change) | P2 |
| Account Selector widget | LOW — secondary sidebar slot, niche use | MEDIUM (new schema slot + renderer) | P3 |
| Header brandLabel override | LOW — rarely needed separately from config.label | LOW | P3 |
| Header periodType at dashboard level | LOW — per-screen periodType is sufficient | LOW | P3 |

**Priority key:**
- P1: Must have for v2.2 — milestone is incomplete without these
- P2: Should have — improves operator experience noticeably
- P3: Nice to have — defer to v2.3 if time-constrained

---

## Existing Editor Architecture (Dependency Context)

Understanding the existing patterns is critical — new features must follow them exactly to maintain consistency.

### Pattern: Sheet-based property panels

PropertyPanel uses shadcn `<Sheet side="right">`. New sidebar/header/filter panels follow the
same pattern: a `<Sheet>` opened by a trigger in AdminToolbar or by clicking the respective chrome
area in edit mode. Each Sheet renders a form that calls an `onChange`/`onUpdate` callback with the
updated config object. All existing 28 property forms follow this contract.

### Pattern: updateWorkingScreen for screen-level mutations

```typescript
// Existing (in WireframeViewer.tsx line ~458)
function updateWorkingScreen(updater: (screen: BlueprintScreen) => BlueprintScreen) {
  setWorkingConfig(prev => {
    if (!prev) return prev
    const newScreens = [...prev.screens]
    newScreens[safeActiveIndex] = updater(newScreens[safeActiveIndex])
    return { ...prev, screens: newScreens }
  })
  setEditMode(prev => ({ ...prev, dirty: true }))
}

// New: updateWorkingConfig for root-level mutations (sidebar, header)
function updateWorkingConfig(updater: (config: BlueprintConfig) => BlueprintConfig) {
  setWorkingConfig(prev => prev ? updater(prev) : prev)
  setEditMode(prev => ({ ...prev, dirty: true }))
}
```

### Pattern: section-registry for section property forms

Section-level edit forms live in `components/editor/property-forms/`. Each is a standalone
component accepting `section` and `onChange` props. The section-registry maps `section.type →
form component`.

New config panels (header, sidebar, filter bar) operate at config or screen level, not section
level. They are **not** routed through section-registry. They are separate Sheet components opened
from AdminToolbar buttons or chrome click targets in edit mode.

### Pattern: SidebarConfig rendering in WireframeViewer

The sidebar is inline in WireframeViewer, not a separate component. Key zones:
- Line ~783: sidebar header (label + collapse toggle) — workspace switcher widget goes here
- Line ~839: nav area with ScreenManager / partitionScreensByGroups — search widget goes above this
- Line ~930: footer block showing status chip — user menu widget replaces/alternates this

New widget slots are added inline in the same sidebar `<aside>` block, conditionally rendered
based on `activeConfig.sidebar.headerWidget`, `activeConfig.sidebar.showSearch`, and
`activeConfig.sidebar.footerWidget`.

### Pattern: WireframeHeader props gap

Currently WireframeHeader accepts: `title`, `logoUrl`, `brandLabel`, `showLogo`.
The fields `showPeriodSelector`, `showUserIndicator`, and `actions.*` exist in HeaderConfig
schema but are never passed to WireframeHeader. The fix:
1. Add these as optional props to WireframeHeader
2. Pass them from WireframeViewer (`activeConfig.header.showPeriodSelector` etc.)
3. Apply conditional renders inside WireframeHeader

This is a small change (3-4 prop additions + conditional wraps) but it must happen before
building the Header Config Panel or the panel's toggles have no visible effect.

---

## Sources

- Codebase analysis: `tools/wireframe-builder/lib/blueprint-schema.ts` — SidebarConfigSchema, HeaderConfigSchema, FilterOptionSchema (lines 50–76)
- Codebase analysis: `tools/wireframe-builder/types/blueprint.ts` — SidebarConfig, HeaderConfig, BlueprintScreen types (lines 397–425)
- Codebase analysis: `src/pages/clients/WireframeViewer.tsx` — updateWorkingScreen pattern (line ~458), sidebar render zones (lines 764–944), WireframeHeader invocation (line 957-961)
- Codebase analysis: `tools/wireframe-builder/components/WireframeHeader.tsx` — current props accepted vs schema fields (props: title, logoUrl, brandLabel, showLogo only)
- Codebase analysis: `tools/wireframe-builder/components/WireframeFilterBar.tsx` — FilterOption rendering, 5 filter sub-components
- Codebase analysis: `tools/wireframe-builder/components/editor/PropertyPanel.tsx` — Sheet pattern for property panels
- Codebase analysis: `tools/wireframe-builder/components/editor/AdminToolbar.tsx` — existing edit mode entry points
- [shadcn/ui sidebar blocks — sidebar-07 compound widget reference (team-switcher.tsx, nav-user.tsx)](https://ui.shadcn.com/blocks/sidebar)
- .planning/PROJECT.md — milestone scope, out-of-scope constraints, existing validated requirements

---

*Feature research for: v2.2 Wireframe Builder — Configurable Layout Components*
*Researched: 2026-03-13*
