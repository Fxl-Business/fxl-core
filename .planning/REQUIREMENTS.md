# Requirements: FXL Core v1.2 Visual Redesign

**Defined:** 2026-03-10
**Core Value:** FXL Core e o cerebro operacional da empresa -- documentacao, processo e tooling juntos

## v1.2 Requirements

Requirements for visual redesign milestone. Each maps to roadmap phases.

### Design Foundation

- [ ] **FOUND-01**: App loads Inter font family with weights 300-700 via @fontsource-variable
- [ ] **FOUND-02**: App loads JetBrains Mono font for code blocks via @fontsource-variable
- [ ] **FOUND-03**: CSS vars shift to slate + indigo palette (--primary, --accent, --background, etc.)
- [ ] **FOUND-04**: Scrollbar uses slim 6px styling matching reference (slate-200 thumb)
- [ ] **FOUND-05**: Wireframe --wf-* tokens remain isolated after palette change

### Layout Shell

- [x] **LAYOUT-01**: Header uses sticky top-0 with backdrop-blur-md and bg-white/80
- [x] **LAYOUT-02**: Header shows brand "Nucleo FXL" with "FXL-CORE" subtitle
- [x] **LAYOUT-03**: Search bar integrated in header with Cmd+K shortcut badge
- [x] **LAYOUT-04**: Three-column layout enabled (sidebar + content + TOC)
- [x] **LAYOUT-05**: Scroll context uses document body (remove nested overflow-y-auto)

### Sidebar Navigation

- [ ] **NAV-01**: Sidebar uses bg-slate-50/50 with border-r and sticky positioning
- [ ] **NAV-02**: Section headers are uppercase, xs, bold, tracking-wider, text-slate-900
- [ ] **NAV-03**: Nav items have border-l left border with indigo-600 active state
- [ ] **NAV-04**: Collapsible sections show chevron icon with expand/collapse
- [ ] **NAV-05**: Sub-items indent with pl-4 under parent with consistent spacing

### Doc Rendering

- [ ] **DOC-01**: Doc pages show breadcrumbs (section > page name)
- [ ] **DOC-02**: Badge pill shows frontmatter badge value (indigo-50 bg, indigo-600 text, ring)
- [ ] **DOC-03**: Page title uses text-4xl/5xl font-extrabold tracking-tight
- [ ] **DOC-04**: Description paragraph below title in text-lg text-slate-600
- [ ] **DOC-05**: Code blocks use dark theme (rounded-xl, bg-slate-900, terminal dots)
- [ ] **DOC-06**: Syntax highlighting via rehype-highlight for code fences
- [ ] **DOC-07**: Consistent typography hierarchy (h2 2xl bold, h3 xl semibold, p relaxed)

### Table of Contents

- [ ] **TOC-01**: Right sidebar shows "NESTA PAGINA" heading with page headings
- [ ] **TOC-02**: Active heading highlighted via IntersectionObserver scroll tracking
- [ ] **TOC-03**: Nested heading levels with border-l and indentation
- [ ] **TOC-04**: TOC hidden on screens < xl breakpoint

### Consistency Pass

- [ ] **CONSIST-01**: Home page uses new typography and color system
- [ ] **CONSIST-02**: Client pages (Index, DocViewer) use new visual language
- [ ] **CONSIST-03**: Login/Profile pages use slate + indigo palette
- [ ] **CONSIST-04**: PromptBlock and Callout components updated to new palette

## Future Requirements

### Advanced Doc Features

- **ADOC-01**: Copy button on code blocks
- **ADOC-02**: Language label on code blocks
- **ADOC-03**: Code block file name header
- **ADOC-04**: Mobile hamburger menu for sidebar

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dark mode redesign | v1.2 focuses on light mode; dark mode inherits tokens automatically but fine-tuning deferred |
| Mobile responsive sidebar drawer | Reference uses hidden lg:block; hamburger drawer is v2 |
| @tailwindcss/typography plugin | Custom prose styles sufficient; plugin adds complexity |
| shiki/react-syntax-highlighter | rehype-highlight is lighter and integrates with existing pipeline |
| Animated page transitions | Visual polish, not visual redesign |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 12 | Pending |
| FOUND-02 | Phase 12 | Pending |
| FOUND-03 | Phase 12 | Pending |
| FOUND-04 | Phase 12 | Pending |
| FOUND-05 | Phase 12 | Pending |
| LAYOUT-01 | Phase 13 | Complete |
| LAYOUT-02 | Phase 13 | Complete |
| LAYOUT-03 | Phase 13 | Complete |
| LAYOUT-04 | Phase 13 | Complete |
| LAYOUT-05 | Phase 13 | Complete |
| NAV-01 | Phase 14 | Pending |
| NAV-02 | Phase 14 | Pending |
| NAV-03 | Phase 14 | Pending |
| NAV-04 | Phase 14 | Pending |
| NAV-05 | Phase 14 | Pending |
| DOC-01 | Phase 15 | Pending |
| DOC-02 | Phase 15 | Pending |
| DOC-03 | Phase 15 | Pending |
| DOC-04 | Phase 15 | Pending |
| DOC-05 | Phase 15 | Pending |
| DOC-06 | Phase 15 | Pending |
| DOC-07 | Phase 15 | Pending |
| TOC-01 | Phase 15 | Pending |
| TOC-02 | Phase 15 | Pending |
| TOC-03 | Phase 15 | Pending |
| TOC-04 | Phase 15 | Pending |
| CONSIST-01 | Phase 16 | Pending |
| CONSIST-02 | Phase 16 | Pending |
| CONSIST-03 | Phase 16 | Pending |
| CONSIST-04 | Phase 16 | Pending |

**Coverage:**
- v1.2 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-10 after roadmap creation*
