# Module: projects

## Purpose
Project workspaces providing briefing forms, blueprint views, and wireframe viewer pages for each FXL project.
Formerly src/modules/clients/ — renamed in v6.0 Phase 113.

## Ownership
- src/modules/projects/**

## Public API

### Pages
- ProjectsIndex: Landing page listing all projects as cards with links (pages/ProjectsIndex.tsx)
- ProjectIndex: Generic project landing page with document table, parametric by slug (pages/ProjectIndex.tsx)
- ProjectDocViewer: Generic doc viewer for project sub-pages (pages/ProjectDocViewer.tsx)
- BriefingForm: Full CRUD form for structured project briefing (pages/BriefingForm.tsx)
- BlueprintTextView: Read-only view of project blueprint (pages/BlueprintTextView.tsx)
- WireframeViewer: Full-screen wireframe editor (pages/WireframeViewer.tsx)

## Dependencies

### From platform/
- @platform/module-loader/registry — ModuleDefinition type (used in manifest)
- @platform/module-loader/module-ids — MODULE_IDS.PROJECTS (used in manifest)

### From tools/
- @tools/wireframe-builder/ — all wireframe builder components and libs

## Agent Rules
- **Write:** Only files under `src/modules/projects/`
- **Read:** Entire codebase
- **Do NOT** confuse with src/modules/clients/ (simple CRUD for client registration)
