---
phase: 02-wireframe-comments
plan: 02
subsystem: ui, comments
tags: [supabase, react, comment-overlay, section-wrapper, wireframe-viewer, hover-ui]

# Dependency graph
requires:
  - phase: 02-wireframe-comments
    plan: 01
    provides: Comment/CommentTarget types, addComment/getCommentsByScreen CRUD, AuthContext/useAuth hook, Supabase client
provides:
  - Supabase-backed CommentOverlay drawer with add/display (tools/wireframe-builder/components/CommentOverlay.tsx)
  - Hover-visible CommentIcon for section-level comments (tools/wireframe-builder/components/CommentIcon.tsx)
  - Unresolved comment count CommentBadge (tools/wireframe-builder/components/CommentBadge.tsx)
  - SectionWrapper wrapping each section with icon and badge (tools/wireframe-builder/components/SectionWrapper.tsx)
  - BlueprintRenderer updated with optional comment support (tools/wireframe-builder/components/BlueprintRenderer.tsx)
  - WireframeViewer wired to Supabase comment flow (src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx)
affects: [02-wireframe-comments, comment-manager, client-access, wireframe-viewer]

# Tech tracking
tech-stack:
  added: []
  patterns: [controlled-drawer-component, section-hover-comments, badge-count-pattern, comment-refetch-on-close]

key-files:
  created:
    - tools/wireframe-builder/components/CommentIcon.tsx
    - tools/wireframe-builder/components/CommentBadge.tsx
    - tools/wireframe-builder/components/SectionWrapper.tsx
  modified:
    - tools/wireframe-builder/components/CommentOverlay.tsx
    - tools/wireframe-builder/components/BlueprintRenderer.tsx
    - src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx
    - src/pages/tools/ComponentGallery.tsx
    - src/pages/tools/galleryMockData.ts

key-decisions:
  - "CommentOverlay is now a controlled component (open/onClose props) instead of managing its own visibility"
  - "Comments refetched on drawer close to update badge counts across sections"
  - "BlueprintRenderer backward compatible -- renders without comment support when props omitted"
  - "ComponentGallery uses static preview for CommentOverlay (avoids Supabase dependency in gallery)"

patterns-established:
  - "Controlled drawer: parent manages open state and target, drawer displays filtered comments"
  - "Section hover UX: group-hover on wrapper shows CommentIcon, CommentBadge always visible if count > 0"
  - "Comment target flow: WireframeViewer -> BlueprintRenderer -> SectionWrapper -> CommentIcon -> CommentOverlay"

requirements-completed: [WCMT-01]

# Metrics
duration: 4min
completed: 2026-03-07
---

# Phase 2 Plan 02: Comment UI Summary

**Supabase-backed comment drawer with section-level hover icons, unresolved count badges, and screen/section targeting in the wireframe viewer**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-07T19:52:58Z
- **Completed:** 2026-03-07T19:56:56Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- CommentOverlay fully refactored from local state to Supabase-backed controlled drawer with role labels and resolved styling
- Section-level hover comment icons (CommentIcon) and unresolved count badges (CommentBadge) for granular feedback
- SectionWrapper wraps each section in BlueprintRenderer with comment interactivity
- WireframeViewer wired with screen-level FAB, section-level click, and auto-refetch on drawer close

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor CommentOverlay to Supabase-backed and create CommentIcon + CommentBadge** - `c81db4b` (feat)
2. **Task 2: Create SectionWrapper, update BlueprintRenderer, and wire into WireframeViewer** - `1874924` (feat)

## Files Created/Modified
- `tools/wireframe-builder/components/CommentOverlay.tsx` - Rewritten: controlled drawer fetching/writing comments via Supabase, with role labels and resolved styling
- `tools/wireframe-builder/components/CommentIcon.tsx` - New: hover-visible MessageSquare icon for section-level comments
- `tools/wireframe-builder/components/CommentBadge.tsx` - New: amber badge showing unresolved comment count (hidden when zero)
- `tools/wireframe-builder/components/SectionWrapper.tsx` - New: wraps sections with CommentIcon and CommentBadge, computes target ID and unresolved count
- `tools/wireframe-builder/components/BlueprintRenderer.tsx` - Updated: accepts optional clientSlug, comments, onOpenComments props; wraps sections in SectionWrapper when provided
- `src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx` - Updated: fetches comments from Supabase, manages drawer state, passes comment props to BlueprintRenderer, screen-level FAB
- `src/pages/tools/ComponentGallery.tsx` - Updated: static preview for CommentOverlay (removed live Supabase rendering)
- `src/pages/tools/galleryMockData.ts` - Updated: commentOverlayMock uses new Props interface

## Decisions Made
- CommentOverlay silently fails on fetch/submit errors (graceful degradation vs error toasts) -- simpler UX for initial release
- Ctrl/Cmd+Enter keyboard shortcut for quick comment submission
- Section labels use "Secao N" format (simple and functional, section object not available in SectionWrapper)
- ComponentGallery shows static description instead of live Supabase-backed component to avoid auth dependency in gallery

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated ComponentGallery mock and preview for new CommentOverlay props**
- **Found during:** Task 1 (CommentOverlay refactor)
- **Issue:** ComponentGallery.tsx and galleryMockData.ts used old CommentOverlay props (screenName, comments array), causing TypeScript errors
- **Fix:** Updated mock to match new Props interface, changed preview to static description (avoids Supabase dependency in gallery)
- **Files modified:** src/pages/tools/ComponentGallery.tsx, src/pages/tools/galleryMockData.ts
- **Verification:** npx tsc --noEmit passes with zero errors
- **Committed in:** c81db4b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to maintain build integrity after CommentOverlay props change. No scope creep.

## Issues Encountered
None

## User Setup Required
None - this plan uses Supabase infrastructure created in Plan 01. No additional configuration needed.

## Next Phase Readiness
- Comment UI complete: operators can view, add, and see comments at both screen and section level
- Plan 03 can build CommentManager (resolve/filter) and client access flow on top of this UI
- Badge counts automatically update when drawer closes, ready for real-time enhancement later

## Self-Check: PASSED

All 8 files verified present. Both task commits (c81db4b, 1874924) verified in git log.

---
*Phase: 02-wireframe-comments*
*Completed: 2026-03-07*
