# Module: Wireframe (Ferramentas)

## Scope

Wireframe builder tools — component gallery, shared wireframe viewer.
This is a hybrid module: pages and manifest live here, but visual
components live in tools/wireframe-builder/ (imported via @tools/).

## Structure

- `manifest.tsx` — Module registration (routes, nav with all block links)
- `pages/` — ComponentGallery, SharedWireframeView, galleryMockData
- `components/` — (currently empty — builder components stay in @tools/wireframe-builder/)
- `hooks/` — (currently empty)
- `types/` — (currently empty)
- `services/` — (currently empty)

## Rules

- Visual builder components MUST stay in tools/wireframe-builder/components/
- Import builder components via @tools/wireframe-builder/...
- Never import from other modules directly
- UI components from @shared/ui/, utilities from @shared/utils/
- Platform imports from @platform/ (supabase, module-loader)
- MODULE_IDS value is 'ferramentas' (preserved for URL and localStorage compatibility)

## Hybrid Exception

The wireframe module is intentionally split:
- src/modules/wireframe/ — manifest, pages, hooks (module system integration)
- tools/wireframe-builder/ — visual components, editor, types (reusable outside module)

This is documented in the design spec Section 4.3. Builder components are shared
across contexts (module page, client wireframe, spoke export).

## Key Patterns

- ComponentGallery renders all available block types with mock data
- SharedWireframeView is a public (unauthenticated) route for sharing wireframes
- Manifest navChildren list all block documentation pages (docs module renders them)
