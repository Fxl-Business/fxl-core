# Requirements: FXL Core v1.2 Visual Redesign

**Defined:** 2026-03-10
**Core Value:** FXL Core e o cerebro operacional da empresa — documentacao, processo e tooling juntos

## v1.2 Requirements

Requirements for visual redesign milestone. Each maps to roadmap phases.

### Design Foundation

- [ ] **FOUND-01**: App loads Inter font family with weights 300-700 via @fontsource-variable
- [ ] **FOUND-02**: App loads JetBrains Mono font for code blocks via @fontsource-variable
- [ ] **FOUND-03**: CSS vars shift to slate + indigo palette (--primary, --accent, --background, etc.)
- [ ] **FOUND-04**: Scrollbar uses slim 6px styling matching reference (slate-200 thumb)
- [ ] **FOUND-05**: Wireframe --wf-* tokens remain isolated after palette change

### Layout Shell

- [ ] **LAYOUT-01**: Header uses sticky top-0 with backdrop-blur-md and bg-white/80
- [ ] **LAYOUT-02**: Header shows brand "Nucleo FXL" with "FXL-CORE" subtitle
- [ ] **LAYOUT-03**: Search bar integrated in header with Cmd+K shortcut badge
- [ ] **LAYOUT-04**: Three-column layout enabled (sidebar + content + TOC)
- [ ] **LAYOUT-05**: Scroll context uses document body (remove nested overflow-y-auto)

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
| FOUND-01 | TBD | Pending |
| FOUND-02 | TBD | Pending |
| FOUND-03 | TBD | Pending |
| FOUND-04 | TBD | Pending |
| FOUND-05 | TBD | Pending |
| LAYOUT-01 | TBD | Pending |
| LAYOUT-02 | TBD | Pending |
| LAYOUT-03 | TBD | Pending |
| LAYOUT-04 | TBD | Pending |
| LAYOUT-05 | TBD | Pending |
| NAV-01 | TBD | Pending |
| NAV-02 | TBD | Pending |
| NAV-03 | TBD | Pending |
| NAV-04 | TBD | Pending |
| NAV-05 | TBD | Pending |
| DOC-01 | TBD | Pending |
| DOC-02 | TBD | Pending |
| DOC-03 | TBD | Pending |
| DOC-04 | TBD | Pending |
| DOC-05 | TBD | Pending |
| DOC-06 | TBD | Pending |
| DOC-07 | TBD | Pending |
| TOC-01 | TBD | Pending |
| TOC-02 | TBD | Pending |
| TOC-03 | TBD | Pending |
| TOC-04 | TBD | Pending |
| CONSIST-01 | TBD | Pending |
| CONSIST-02 | TBD | Pending |
| CONSIST-03 | TBD | Pending |
| CONSIST-04 | TBD | Pending |

**Coverage:**
- v1.2 requirements: 24 total
- Mapped to phases: 0
- Unmapped: 24

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-10 after initial definition*
