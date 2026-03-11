# Requirements: FXL Core v1.4

**Defined:** 2026-03-11
**Core Value:** FXL Core e o cerebro operacional da empresa — documentacao, processo e tooling juntos

## v1.4 Requirements

Requirements for wireframe visual redesign. Each maps to roadmap phases.

### Token Foundation

- [x] **TOK-01**: Wireframe palette uses slate color scale (replacing warm stone grays) with primary blue #1152d4 (replacing gold #d4a017)
- [x] **TOK-02**: Both light and dark theme blocks in wireframe-tokens.css update simultaneously with new values
- [x] **TOK-03**: --wf-accent-muted uses color-mix() derived from --wf-accent (replacing hardcoded rgba)
- [x] **TOK-04**: Three new tokens added: --wf-header-search-bg, --wf-table-footer-bg, --wf-table-footer-fg
- [x] **TOK-05**: Background tokens update to #f6f6f8 (light) and #101622 (dark)
- [x] **TOK-06**: All hardcoded colors in components (e.g., GaugeChart #f59e0b) replaced with token references
- [x] **TOK-07**: Client branding brandingToWfOverrides() updated to emit --wf-primary from primaryColor, wired into WireframeThemeProvider callers

### Sidebar

- [x] **SIDE-01**: Sidebar uses dark slate-900/950 background with slate-300/400 text
- [x] **SIDE-02**: Active nav item uses primary/10 background with primary text color
- [x] **SIDE-03**: Nav items have hover:bg-slate-800 hover:text-white transitions
- [x] **SIDE-04**: Section group labels use 10px uppercase tracking-wider slate-500 style
- [x] **SIDE-05**: Sidebar footer shows status indicator (dot + label) in bordered card

### Header

- [x] **HEAD-01**: Header uses white/slate-900 background with bottom border, 14-unit height
- [x] **HEAD-02**: Header contains search input with icon, styled as rounded-lg with slate-100/800 background
- [x] **HEAD-03**: Header right side has notification icon, dark mode toggle, and user chip with avatar
- [x] **HEAD-04**: User chip displays name and role with right-aligned text and rounded-lg avatar

### Filter Bar

- [ ] **FILT-01**: Filter bar is sticky with backdrop-blur and semi-transparent background
- [ ] **FILT-02**: Filter selects use transparent background with bold primary text and no border
- [ ] **FILT-03**: Filter labels use 10px uppercase bold slate-500 style
- [ ] **FILT-04**: Action buttons (date picker, share, export) use rounded-lg with specific button hierarchy (outline vs filled)
- [ ] **FILT-05**: Compare toggle uses primary-colored switch with 11px bold label

### Cards

- [x] **CARD-01**: KPI cards use white/slate-900 background with rounded-xl border and shadow-sm
- [x] **CARD-02**: KPI cards have group-hover effect: icon container transitions from primary/10 to solid primary
- [x] **CARD-03**: Trend badges use rounded-full pill with color-coded background (emerald for positive, rose for negative)
- [x] **CARD-04**: Card values use text-2xl font-extrabold, labels use text-sm font-medium slate-500
- [x] **CARD-05**: Comparison text uses text-[10px] text-slate-400 below value

### Tables

- [ ] **TBL-01**: Table headers use text-[10px] font-black uppercase tracking-widest slate-500 on slate-50/800 background
- [ ] **TBL-02**: Table rows have hover:bg-slate-100 dark:hover:bg-slate-800 transitions with cursor-pointer
- [ ] **TBL-03**: Highlight/total rows use primary-colored text with font-extrabold uppercase styling
- [ ] **TBL-04**: Dark footer row (bg-slate-900 text-white) with font-black totals for analytical tables
- [ ] **TBL-05**: Trend indicators in table cells use color-coded icons with scale-110 hover

### Charts

- [ ] **CHRT-01**: Chart palette uses primary blue + indigo + blue-400 + slate scale (replacing gold/amber)
- [ ] **CHRT-02**: Chart containers use white/slate-900 background with rounded-xl border and shadow-sm
- [ ] **CHRT-03**: Chart headers have font-bold title with legend dots (rounded-full colored indicators)
- [ ] **CHRT-04**: Bar charts support group-hover transitions from muted to full opacity
- [ ] **CHRT-05**: CompositionBar component (new): horizontal stacked bar with hover:brightness-90 and legend grid

### Editor Sync

- [ ] **EDIT-01**: ScreenManager sidebar styling matches the new wireframe sidebar visual

### Gallery

- [ ] **GAL-01**: All gallery component previews reflect the new visual design
- [ ] **GAL-02**: Gallery validation checklist: dark mode toggle pass, branding-applied check, all 6 sections verified

## Future Requirements

### Advanced Visual Polish

- **ADVPOL-01**: Animated transitions on KPI card value changes
- **ADVPOL-02**: CSS-only chart tooltips with hover data display
- **ADVPOL-03**: Container query responsive cards (@container)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Material Symbols icon migration | lucide-react already in 86 files, tree-shaken, sufficient vocabulary |
| Tailwind v4 upgrade | Breaking config/plugin API changes far beyond v1.4 scope |
| New component types | v1.4 is visual redesign only. CompositionBar is the sole exception. |
| Mobile responsive wireframe | v2 concern. Desktop-first dashboard aesthetic. |
| Dark mode fine-tuning beyond token parity | Tokens update both modes simultaneously. Per-component dark adjustments are v2. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOK-01 | Phase 22 | Complete |
| TOK-02 | Phase 22 | Complete |
| TOK-03 | Phase 22 | Complete |
| TOK-04 | Phase 22 | Complete |
| TOK-05 | Phase 22 | Complete |
| TOK-06 | Phase 22 | Complete |
| TOK-07 | Phase 22 | Complete |
| SIDE-01 | Phase 23 | Complete |
| SIDE-02 | Phase 23 | Complete |
| SIDE-03 | Phase 23 | Complete |
| SIDE-04 | Phase 23 | Complete |
| SIDE-05 | Phase 23 | Complete |
| HEAD-01 | Phase 23 | Complete |
| HEAD-02 | Phase 23 | Complete |
| HEAD-03 | Phase 23 | Complete |
| HEAD-04 | Phase 23 | Complete |
| FILT-01 | Phase 26 | Pending |
| FILT-02 | Phase 26 | Pending |
| FILT-03 | Phase 26 | Pending |
| FILT-04 | Phase 26 | Pending |
| FILT-05 | Phase 26 | Pending |
| CARD-01 | Phase 24 | Complete |
| CARD-02 | Phase 24 | Complete |
| CARD-03 | Phase 24 | Complete |
| CARD-04 | Phase 24 | Complete |
| CARD-05 | Phase 24 | Complete |
| TBL-01 | Phase 25 | Pending |
| TBL-02 | Phase 25 | Pending |
| TBL-03 | Phase 25 | Pending |
| TBL-04 | Phase 25 | Pending |
| TBL-05 | Phase 25 | Pending |
| CHRT-01 | Phase 27 | Pending |
| CHRT-02 | Phase 27 | Pending |
| CHRT-03 | Phase 27 | Pending |
| CHRT-04 | Phase 27 | Pending |
| CHRT-05 | Phase 27 | Pending |
| EDIT-01 | Phase 28 | Pending |
| GAL-01 | Phase 28 | Pending |
| GAL-02 | Phase 28 | Pending |

**Coverage:**
- v1.4 requirements: 39 total
- Mapped to phases: 39
- Unmapped: 0

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after roadmap creation (v1.4 phases 22-28)*
