---
phase: 02-wireframe-comments
plan: 01
subsystem: auth, database, infra
tags: [supabase, auth, rls, comments, tokens, react-context]

# Dependency graph
requires:
  - phase: 01-documentation
    provides: App shell with React Router, Tailwind CSS, wireframe-builder types
provides:
  - Supabase client singleton (src/lib/supabase.ts)
  - AuthProvider and useAuth hook (src/contexts/AuthContext.tsx)
  - Login page at /login route (src/pages/Login.tsx)
  - Comment, CommentTarget, ShareToken types (tools/wireframe-builder/types/comments.ts)
  - Comment CRUD functions (tools/wireframe-builder/lib/comments.ts)
  - Token validation and generation helpers (tools/wireframe-builder/lib/tokens.ts)
  - SQL migration with comments + share_tokens tables and RLS policies (supabase/migrations/001_comments_schema.sql)
affects: [02-wireframe-comments, comment-ui, client-access, wireframe-viewer]

# Tech tracking
tech-stack:
  added: ["@supabase/supabase-js 2.x"]
  patterns: [supabase-client-singleton, auth-context-provider, deterministic-section-targeting, rls-policies]

key-files:
  created:
    - src/lib/supabase.ts
    - src/contexts/AuthContext.tsx
    - src/pages/Login.tsx
    - tools/wireframe-builder/types/comments.ts
    - tools/wireframe-builder/lib/comments.ts
    - tools/wireframe-builder/lib/tokens.ts
    - supabase/migrations/001_comments_schema.sql
    - .env.local.example
  modified:
    - CLAUDE.md
    - package.json
    - src/App.tsx
    - src/main.tsx

key-decisions:
  - "Supabase client configured via VITE_ env vars with runtime validation"
  - "AuthContext wraps entire app via main.tsx for global auth state"
  - "Login page is full-screen outside Layout (no sidebar)"
  - "Comment target anchoring uses deterministic screenId:sectionIndex pattern"
  - "Token validation uses server-side expires_at comparison via Supabase query"

patterns-established:
  - "Supabase singleton: all files import from @/lib/supabase, never create new clients"
  - "Auth context: useAuth() hook provides session, user, loading, signIn, signOut"
  - "Comment CRUD: getUser() for security-critical operations, not getSession()"
  - "Block-level targeting: toTargetId/parseTargetId for deterministic section IDs"

requirements-completed: [WCMT-01, WCMT-02]

# Metrics
duration: 4min
completed: 2026-03-07
---

# Phase 2 Plan 01: Foundation Summary

**Supabase client, operator auth with email/password login, comment/token types, CRUD functions, and SQL migration with RLS policies**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-07T19:44:39Z
- **Completed:** 2026-03-07T19:48:59Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Supabase client singleton with env var validation, ready for import across the project
- AuthProvider + useAuth hook providing session management, signIn/signOut actions
- Login page with FXL branding, email/password form, error handling, and redirect logic
- Comment and ShareToken types with deterministic target ID generation (toTargetId/parseTargetId)
- Full comment CRUD (addComment, getCommentsByScreen, getCommentsForClient, resolveComment)
- Token helpers (validateToken, createShareToken, revokeToken) for client access flow
- SQL migration with 2 tables (comments, share_tokens), RLS enabled, 5 policies

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Supabase, update CLAUDE.md, create client singleton, types, and migration SQL** - `12b1e72` (feat)
2. **Task 2: Create AuthContext, Login page, CRUD functions, token helpers, and wire auth into App** - `ea2b262` (feat)

## Files Created/Modified
- `src/lib/supabase.ts` - Supabase client singleton with env var validation
- `src/contexts/AuthContext.tsx` - Auth context provider with session/user state and signIn/signOut
- `src/pages/Login.tsx` - Operator login page with email/password form
- `tools/wireframe-builder/types/comments.ts` - Comment, CommentTarget, ShareToken types + target ID helpers
- `tools/wireframe-builder/lib/comments.ts` - Comment CRUD functions (add, query by screen, query by client, resolve)
- `tools/wireframe-builder/lib/tokens.ts` - Token validation, creation, and revocation helpers
- `supabase/migrations/001_comments_schema.sql` - Database schema with 2 tables and 5 RLS policies
- `.env.local.example` - Placeholder env vars for Supabase configuration
- `CLAUDE.md` - Updated stack section: replaced "SEM Supabase" with Supabase dependency and env vars docs
- `package.json` - Added @supabase/supabase-js dependency
- `src/App.tsx` - Added /login route outside Layout
- `src/main.tsx` - Wrapped App with AuthProvider

## Decisions Made
- Used runtime throw for missing env vars (descriptive error with .env.local instructions) instead of silent fallback
- Login page styled with FXL navy color (#1e3a5f) consistent with app branding
- AuthContext uses shadowed variable names in useEffect to avoid noUnusedLocals errors with strict TypeScript
- Token validation uses Supabase query with gt('expires_at', now) rather than client-side date comparison

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

This plan creates infrastructure that requires external Supabase configuration before use:

1. Create a Supabase project at https://supabase.com/dashboard
2. Enable Email Auth provider (Authentication -> Providers -> Email)
3. Enable Anonymous sign-ins (Authentication -> Settings -> Enable anonymous sign-ins)
4. Run migration SQL in SQL Editor (paste contents of supabase/migrations/001_comments_schema.sql)
5. Create operator account (Authentication -> Users -> Add User with email/password)
6. Copy project URL and anon key to .env.local (see .env.local.example)

## Next Phase Readiness
- All types, CRUD functions, and auth infrastructure are importable and ready for Plans 02 and 03
- Plan 02 can build comment UI against the stable Comment/ShareToken types and CRUD functions
- Plan 03 can build client access flow using validateToken and anonymous sign-in patterns
- SQL migration is ready to be applied to a Supabase project

## Self-Check: PASSED

All 8 created files verified present. Both task commits (12b1e72, ea2b262) verified in git log.

---
*Phase: 02-wireframe-comments*
*Completed: 2026-03-07*
