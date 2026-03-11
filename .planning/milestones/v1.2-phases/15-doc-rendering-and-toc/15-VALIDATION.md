---
phase: 15
slug: doc-rendering-and-toc
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler (tsc --noEmit) + visual verification |
| **Config file** | tsconfig.json |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | DOC-01, DOC-02 | type-check + visual | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 15-01-02 | 01 | 1 | DOC-03, DOC-04, DOC-05 | type-check + visual | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 15-02-01 | 02 | 1 | DOC-06, DOC-07 | type-check + visual | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 15-02-02 | 02 | 1 | TOC-01, TOC-02, TOC-03, TOC-04 | type-check + visual | `npx tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test framework needed — this phase is CSS restyling plus one rehype plugin.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Breadcrumb displays section > page | DOC-01 | Visual layout | Navigate to any doc page, verify breadcrumb trail |
| Badge pill matches frontmatter badge | DOC-02 | Visual color mapping | Check badge on Processo, Ferramentas, Padroes pages |
| Title typography 4xl/5xl extrabold | DOC-03 | Visual sizing | Compare title sizes across pages |
| Description paragraph in slate-600 | DOC-04 | Visual color | Check description text below title |
| Code block dark theme with terminal dots | DOC-05, DOC-06 | Visual rendering | Find page with code blocks, verify dark bg + dots |
| Syntax highlighting colors distinct | DOC-07 | Visual color distinction | Verify keywords, strings, comments have different colors |
| TOC heading "NESTA PAGINA" | TOC-01 | Visual label | Check right sidebar on doc page with headings |
| TOC click scrolls correctly | TOC-02 | Scroll behavior | Click TOC items, verify scroll position with header offset |
| Active TOC heading updates on scroll | TOC-03 | Scroll tracking | Scroll through page, verify active indicator moves |
| Nested h3 indented under h2 | TOC-04 | Visual indentation | Check TOC on page with h2 and h3 headings |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
