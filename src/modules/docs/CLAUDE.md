# Module: docs

## Purpose
Renders FXL documentation pages (processo, padroes, ferramentas, referencias) from Supabase-stored markdown with custom tag parsing.

## Ownership
- src/modules/docs/**

## Public API

### Types
- DocFrontmatter: Parsed YAML frontmatter (title, badge, description) (services/docs-parser.ts)
- DocSection: Union type for markdown | prompt | callout | operational | phase-card sections (services/docs-parser.ts)
- DocHeading: Extracted h2/h3 heading with id, text, level (services/docs-parser.ts)
- ParsedDoc: Full parsed document (frontmatter, sections, headings, rawBody) (services/docs-parser.ts)
- DocumentRow: Supabase row shape for documents table (services/docs-service.ts)
- SearchEntry: Flattened doc entry for Cmd+K search index (services/search-index.ts)

### Hooks
- useDoc(slug): Fetches and parses a single document by slug (hooks/useDoc.ts)
- useDocsNav(): Builds NavItem[] tree from all documents for sidebar navigation (hooks/useDocsNav.ts)

### Components
- MarkdownRenderer: Renders markdown content with react-markdown, remarkGfm, rehypeHighlight (components/MarkdownRenderer.tsx)
- Callout: Info/warning callout block (components/Callout.tsx)
- Operational: Collapsible operational section for Claude-only content (components/Operational.tsx)
- PromptBlock: Copyable prompt block with label (components/PromptBlock.tsx)
- PhaseCard: Card linking to a processo phase (components/PhaseCard.tsx)
- DocBreadcrumb: Breadcrumb showing section > title (components/DocBreadcrumb.tsx)
- DocPageHeader: Page header with badge, title, description (components/DocPageHeader.tsx)
- DocTableOfContents: Right-side sticky TOC from extracted headings (components/DocTableOfContents.tsx)
- InfoBlock: Styled info block (components/InfoBlock.tsx)
- PageHeader: Generic page header (components/PageHeader.tsx)

### Services
- docs-service: Supabase CRUD with in-memory cache — getDocBySlug, getAllDocuments, getDocsByParentPath, invalidateDocsCache (services/docs-service.ts)
- docs-parser: Markdown parsing with custom tags — parseDoc, parseRawMarkdown, extractHeadings (services/docs-parser.ts)
- search-index: Builds flat SearchEntry[] from all docs for Cmd+K — buildSearchIndex (services/search-index.ts)

### Pages
- DocRenderer: Main page component — resolves slug from URL, renders parsed doc with TOC (pages/DocRenderer.tsx)

## Dependencies

### From shared/
- @shared/utils — cn (class merging)
- @shared/ui/button — Button component (used in PromptBlock)

### From platform/
- @platform/supabase — supabase client (used in docs-service)
- @platform/module-loader/registry — ModuleDefinition, NavItem types (used in manifest, useDocsNav)
- @platform/module-loader/module-ids — MODULE_IDS.DOCS (used in manifest)

### From other modules
- None — this module has no cross-module imports

## Validation
- Custom tags (callout, prompt, operational, phase-card) must be correctly parsed by docs-parser
- Navigation tree built by useDocsNav must match the hardcoded navChildren in manifest as fallback
- Search index must include all documents from Supabase

## Agent Rules
- **Write:** Only files under `src/modules/docs/`
- **Read:** Entire codebase
- **Shared writes:** Request via lead -> platform agent
- **Cross-module writes:** Never — report to lead
- **Do NOT run** `tsc --noEmit` individually (lead runs full-project check)
