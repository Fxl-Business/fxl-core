# Module: clients

## Purpose
Client workspaces providing briefing forms, blueprint views, and wireframe viewer pages for each FXL client.

## Ownership
- src/modules/clients/**

## Public API

### Types
- No module-specific types exported (types from @tools/wireframe-builder/ are consumed)

### Hooks
- None (hooks/ currently empty)

### Components
- None (components/ currently empty — client-specific UI lives in pages)

### Services
- None (services/ currently empty — data access via @tools/wireframe-builder/lib/)

### Pages
- ClientsIndex: Landing page listing all clients as cards with links (pages/ClientsIndex.tsx)
- BriefingForm: Full CRUD form for structured client briefing with view/edit toggle, Supabase persistence via briefing-store (pages/BriefingForm.tsx)
- BlueprintTextView: Read-only view of client blueprint with collapsible screens and markdown export (pages/BlueprintTextView.tsx)
- WireframeViewer: Full-screen wireframe editor with admin toolbar, property panels, screen manager, comment overlay, branding, and DnD support (pages/WireframeViewer.tsx)
- FinanceiroContaAzul/Index: Pilot client landing page (pages/FinanceiroContaAzul/Index.tsx)
- FinanceiroContaAzul/DocViewer: Client-specific doc renderer (pages/FinanceiroContaAzul/DocViewer.tsx)
- FinanceiroContaAzul/Wireframe: Client-specific wireframe entry (pages/FinanceiroContaAzul/Wireframe.tsx)
- FinanceiroContaAzul/WireframeViewer: Client-specific wireframe viewer (pages/FinanceiroContaAzul/WireframeViewer.tsx)

## Dependencies

### From shared/
- @shared/ui/button — Button
- @shared/ui/input — Input
- @shared/ui/textarea — Textarea
- @shared/ui/label — Label
- @shared/ui/card — Card, CardContent, CardHeader, CardTitle, CardDescription
- @shared/ui/select — Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- @shared/ui/badge — Badge
- @shared/ui/popover — Popover, PopoverContent, PopoverTrigger
- @shared/ui/context-menu — ContextMenu components
- @shared/ui/PromptBlock — PromptBlock (used in FinanceiroContaAzul/Index)
- @shared/utils — cn (class merging)

### From platform/
- @platform/module-loader/registry — ModuleDefinition type (used in manifest)
- @platform/module-loader/module-ids — MODULE_IDS.CLIENTS (used in manifest)

### From other modules
- None — no direct cross-module imports

### From tools/
- @tools/wireframe-builder/lib/briefing-store — loadBriefing, saveBriefing
- @tools/wireframe-builder/lib/blueprint-store — loadBlueprint, saveBlueprint, checkForUpdates
- @tools/wireframe-builder/lib/blueprint-text — extractBlueprintSummary
- @tools/wireframe-builder/lib/blueprint-export — exportBlueprintMarkdown, downloadMarkdown
- @tools/wireframe-builder/lib/branding — resolveBranding, getChartPalette, getFontLinks, brandingToWfOverrides
- @tools/wireframe-builder/components/ — BlueprintRenderer, CommentOverlay, CommentManager, WireframeHeader, AdminToolbar, ShareModal, PropertyPanel, HeaderPropertyPanel, SidebarPropertyPanel, FilterPropertyPanel, FilterBarActionsPanel, ScreenManager, IconPicker
- @tools/wireframe-builder/types/ — BriefingConfig, BlueprintConfig, BrandingConfig, Comment, and related types

### From external/
- @clerk/react — useUser (auth context in BriefingForm, WireframeViewer)
- @dnd-kit/sortable — arrayMove (section reordering in WireframeViewer)
- sonner — toast notifications

## Validation
- BriefingForm must load/save correctly via Supabase briefing-store
- WireframeViewer must handle real-time comment overlay and branding resolution
- Client slug must be validated from URL params before rendering

## Agent Rules
- **Write:** Only files under `src/modules/clients/`
- **Read:** Entire codebase
- **Shared writes:** Request via lead -> platform agent
- **Cross-module writes:** Never — report to lead
- **Do NOT run** `tsc --noEmit` individually (lead runs full-project check)
