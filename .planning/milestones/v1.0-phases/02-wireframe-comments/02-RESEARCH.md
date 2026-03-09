# Phase 2: Wireframe Comments - Research

**Researched:** 2026-03-07
**Domain:** Supabase integration (auth, database, RLS), comment system architecture, token-based sharing
**Confidence:** HIGH

## Summary

Phase 2 introduces the first Supabase integration in FXL Core. The project currently has zero Supabase dependencies -- this phase adds `@supabase/supabase-js` v2.98.0 for persistent comments, operator authentication (email/password), and token-based client access. The existing `CommentOverlay.tsx` component provides a solid UI foundation but uses only local state -- it needs to be refactored to read/write from Supabase.

The architecture breaks into three distinct concerns: (1) Supabase infrastructure setup (client, env vars, auth context, database tables), (2) comment CRUD with screen-level and block-level anchoring, and (3) the external client access flow using URL tokens with no login required. The biggest technical challenge is the block-level comment anchoring since sections in the current `BlueprintConfig` have no IDs -- a deterministic ID generation strategy using `screenId + sectionIndex` is needed.

**Primary recommendation:** Use `@supabase/supabase-js` v2.98.0 with a React context for auth state, Supabase anonymous sign-ins for external clients (not raw anon key), and a three-table schema (comments, share_tokens, profiles extension via auth.users metadata). Keep all comment UI in the existing `tools/wireframe-builder/components/` directory following the established pattern.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Comments at two levels: screen-level (general) and block/section-level (specific to a KPI grid, chart, table, etc.)
- Block-level comments initiated via hover + click icon; badge count on section corner shows unresolved count
- Comment thread opens in right-side drawer (same pattern as existing CommentOverlay)
- Drawer shows comments for the selected context (screen or specific block)
- External clients access wireframe via shared link with unique token (e.g., `/wireframe-view?token=abc123`)
- No login required for clients -- token in URL grants access
- Tokens expire after a set period and can be revoked by operator
- On first visit, client enters their name (stored in localStorage) -- all comments attributed to that name
- Operator uses basic Supabase Auth (email/password login) -- first auth introduction in FXL Core
- Management panel lives inside the wireframe viewer (not a separate page)
- Comments grouped by screen with expand/collapse headers
- Filter by status only: All, Open, Resolved
- One-click resolve -- operator clicks button, comment marked resolved immediately, no resolution note
- Operator identified by Supabase auth profile name
- Client identified by name entered on first visit
- Small label tag ("Operador" / "Cliente") next to author name
- Flat comment list, no threading or replies
- Resolved comments show "Resolvido" status with visual dimming

### Claude's Discretion
- Supabase table schema design (comments, tokens, auth)
- Exact drawer width and comment card styling
- Hover icon positioning and animation
- Token generation strategy and expiry duration
- Auth flow UX (login page, redirect behavior)
- Empty state messaging
- Error handling for expired/revoked tokens

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WCMT-01 | Comentarios persistentes por tela/bloco salvos em Supabase | Supabase client setup, comments table schema, RLS policies, block-level anchoring via deterministic section IDs |
| WCMT-02 | Usuario externo (cliente) acessa wireframe e deixa comentarios sem precisar de conta dev | Anonymous sign-in via Supabase Auth, share_tokens table, token-gated route, localStorage name entry |
| WCMT-03 | Operador visualiza todos os comentarios e marca como resolvidos | Management panel inside wireframe viewer, comments query grouped by screen, resolve mutation |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | 2.98.0 | Supabase client (auth, database, realtime) | Official JS client, TypeScript-first, handles auth tokens automatically |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-router-dom` | ^6.27.0 (already installed) | Route for shared link, auth redirect | New `/wireframe-view` route with token param |
| `lucide-react` | ^0.460.0 (already installed) | Icons (MessageSquare, CheckCircle, X, User) | Comment UI icons |
| shadcn/ui components | N/A (already installed) | Dialog, Button, Badge | Auth modal, management panel |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase anonymous sign-ins | Raw anon key with RLS | Anonymous sign-in gives user a real `auth.uid()` for RLS policies and attribution; raw anon key has no user identity |
| localStorage for client name | Supabase user metadata | localStorage is simpler and aligns with "zero friction" requirement; metadata would require account management |
| Supabase Realtime | Manual refresh/polling | Realtime adds complexity; polling or refetch-on-focus is simpler for an initial version with low concurrent users |

**Installation:**
```bash
npm install @supabase/supabase-js
```

**Note:** CLAUDE.md says "SEM Supabase neste repositorio" -- this rule must be updated as part of this phase since the REQUIREMENTS.md explicitly calls for Supabase integration for comments. The CONTEXT.md locked decision confirms operator auth with Supabase Auth.

## Architecture Patterns

### Recommended Project Structure
```
src/
  lib/
    supabase.ts              # Supabase client singleton
  contexts/
    AuthContext.tsx           # Auth state provider (session, user, loading)
  pages/
    Login.tsx                 # Operator login page
    SharedWireframeView.tsx   # Token-gated wireframe viewer for clients

tools/wireframe-builder/
  components/
    CommentOverlay.tsx        # Refactored: Supabase-backed comments drawer
    CommentIcon.tsx           # Hover icon for block-level comments (new)
    CommentBadge.tsx          # Unresolved count badge for sections (new)
    CommentManager.tsx        # Management panel with grouped view (new)
    SectionWrapper.tsx        # Wraps SectionRenderer with comment hover (new)
  lib/
    comments.ts              # Comment CRUD functions (insert, query, resolve)
    tokens.ts                # Token validation and generation helpers
  types/
    comments.ts              # Comment, ShareToken TypeScript types
```

### Pattern 1: Supabase Client Singleton
**What:** Single `createClient` call exported from `src/lib/supabase.ts`, configured with Vite env vars
**When to use:** Every file that needs Supabase access imports from here

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

Source: [Supabase React Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)

### Pattern 2: Auth Context Provider
**What:** React context that wraps the app, exposes `session`, `user`, `loading`, `signIn`, `signOut`
**When to use:** Operator auth state needed across components

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

Source: [Supabase Auth React Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react), [Supabase getSession](https://supabase.com/docs/reference/javascript/auth-getsession)

### Pattern 3: Block-Level Comment Anchoring
**What:** Deterministic section ID using `screenId:sectionIndex` as the `target_id` for comments
**When to use:** When a user clicks a comment icon on a specific section

Current state: `BlueprintScreen` has `id` and `title`. Sections have NO `id` field. Adding IDs to the `BlueprintSection` type would require updating every existing config file. Instead, use positional anchoring:

```typescript
// Comment target types
type CommentTarget =
  | { type: 'screen'; screenId: string }
  | { type: 'section'; screenId: string; sectionIndex: number }

// Deterministic target_id for database storage
function toTargetId(target: CommentTarget): string {
  if (target.type === 'screen') return `screen:${target.screenId}`
  return `section:${target.screenId}:${target.sectionIndex}`
}
```

This avoids schema changes to `BlueprintSection` and works with the existing array index in `BlueprintRenderer`.

### Pattern 4: Token-Gated Client Access
**What:** External clients access wireframe via `/wireframe-view?token=<uuid>`. The app validates the token against `share_tokens` table, creates an anonymous Supabase session, and stores the client's display name in localStorage.
**When to use:** Client access flow (WCMT-02)

Flow:
1. Client opens URL with `?token=abc123`
2. App queries `share_tokens` table to validate token (is it valid? not expired? not revoked?)
3. If valid, call `supabase.auth.signInAnonymously()` -- gives the client a real `auth.uid()` for RLS
4. Prompt for display name, store in localStorage
5. All comments from this client use the anonymous `auth.uid()` as author_id and the localStorage name as display name

### Pattern 5: Supabase Database Schema
**What:** Three tables for the comment system

```sql
-- Comments table
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  target_id text not null,        -- 'screen:resultado-mensal-dfc' or 'section:resultado-mensal-dfc:2'
  author_id uuid not null,        -- auth.uid() (operator or anonymous)
  author_name text not null,      -- Display name
  author_role text not null check (author_role in ('operador', 'cliente')),
  text text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

-- Share tokens table
create table public.share_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default gen_random_uuid()::text,
  client_slug text not null,
  created_by uuid references auth.users(id),
  expires_at timestamptz not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.share_tokens enable row level security;

-- RLS Policies

-- Comments: authenticated users can read all comments for their client
create policy "Authenticated users can read comments"
  on comments for select
  to authenticated
  using (true);

-- Comments: authenticated users can insert their own comments
create policy "Authenticated users can insert comments"
  on comments for insert
  to authenticated
  with check (author_id = (select auth.uid()));

-- Comments: only operators can resolve comments
create policy "Operators can resolve comments"
  on comments for update
  to authenticated
  using ((select (auth.jwt()->>'is_anonymous')::boolean) is false)
  with check (resolved = true);

-- Share tokens: only non-anonymous authenticated users can manage tokens
create policy "Operators can manage tokens"
  on share_tokens for all
  to authenticated
  using ((select (auth.jwt()->>'is_anonymous')::boolean) is false);

-- Share tokens: anonymous can read valid tokens (for validation)
create policy "Anyone can validate tokens"
  on share_tokens for select
  to anon, authenticated
  using (revoked = false and expires_at > now());
```

### Anti-Patterns to Avoid
- **Storing Supabase URL/key in code:** Always use `import.meta.env` vars. Never hardcode project URL or keys.
- **Using `getSession()` for security decisions:** The session is stored locally and can be tampered with. Use `getUser()` when verifying identity for security-critical operations.
- **Creating a Supabase client per component:** Always import from the singleton `src/lib/supabase.ts`.
- **Using `any` for Supabase responses:** Type the responses properly. Supabase-js v2 is TypeScript-first and supports generated types.
- **Adding section IDs to BlueprintSection type:** This would require updating every blueprint config file. Use positional anchoring instead.
- **Making operator login a separate SPA/page outside the app:** Keep login within the React Router flow as a simple page route.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth session management | Custom JWT/cookie handling | `supabase.auth` + `onAuthStateChange` | Supabase handles token refresh, session persistence, and tab sync automatically |
| UUID generation for tokens | Custom random string generator | `gen_random_uuid()` in Postgres | Cryptographically secure, built into Postgres, no JS dependency needed |
| Token expiry checking | JS Date comparison logic | SQL `expires_at > now()` in RLS policy | Database enforces expiry at the data layer; client-side checks can be bypassed |
| Real-time comment updates | WebSocket implementation | Simple refetch-on-action pattern | Low concurrency scenario, realtime adds unnecessary complexity for v1 |
| Comment list scrolling | Custom scroll implementation | `@radix-ui/react-scroll-area` (already installed) | Already in the project, consistent with shadcn/ui patterns |

**Key insight:** Supabase handles the entire auth lifecycle (sign up, sign in, session refresh, sign out) and RLS enforces data access at the database level. The application code should focus on UI/UX, not security plumbing.

## Common Pitfalls

### Pitfall 1: Env Vars Not Prefixed with VITE_
**What goes wrong:** Environment variables are not accessible in client-side code
**Why it happens:** Vite only exposes env vars with the `VITE_` prefix to the browser bundle
**How to avoid:** Always name Supabase vars as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
**Warning signs:** `undefined` when accessing `import.meta.env.SUPABASE_URL` (missing VITE_ prefix)

### Pitfall 2: RLS Blocks All Data After Enable
**What goes wrong:** After enabling RLS on a table, all queries return empty results
**Why it happens:** RLS with no policies = deny all. This is by design.
**How to avoid:** Always create at least one SELECT policy immediately after enabling RLS
**Warning signs:** Queries return empty arrays with no error

### Pitfall 3: Anonymous Users vs Anon Role Confusion
**What goes wrong:** Using `to anon` in RLS policies thinking it covers anonymous sign-in users
**Why it happens:** Supabase anonymous sign-ins use the `authenticated` role (not `anon`). The `anon` role is for completely unauthenticated requests.
**How to avoid:** Use `to authenticated` and check `(auth.jwt()->>'is_anonymous')::boolean` to distinguish
**Warning signs:** Anonymous users can't access data despite `to anon` policies

### Pitfall 4: Section Index Drift
**What goes wrong:** Comments anchored to section index N point to the wrong section after blueprint edits
**Why it happens:** Adding/removing sections shifts indices
**How to avoid:** Store the section `type` and a label/title alongside the index as a fallback display. Accept this as a known limitation for v1 -- full section IDs are a future enhancement.
**Warning signs:** Comment shows "on Grafico de Barras" but is positioned on a KPI grid

### Pitfall 5: Token Validation Race Condition
**What goes wrong:** Client opens link, token is validated, but anonymous sign-in fails or is slow
**Why it happens:** Two async operations (token validation + anonymous auth) need to complete in sequence
**How to avoid:** Show a loading state. Validate token first, then create anonymous session, then show the wireframe.
**Warning signs:** Flash of error state before wireframe loads

### Pitfall 6: CLAUDE.md Stack Rule Conflict
**What goes wrong:** CLAUDE.md says "SEM Supabase neste repositorio" but this phase requires Supabase
**Why it happens:** CLAUDE.md was written before the wireframe comments phase was planned
**How to avoid:** Update CLAUDE.md stack section as the first task of this phase to add `@supabase/supabase-js` to the approved stack
**Warning signs:** Linting or review flags Supabase as an unauthorized dependency

## Code Examples

### Creating the Supabase Client
```typescript
// src/lib/supabase.ts
// Source: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Operator Sign-In
```typescript
// Source: https://supabase.com/docs/guides/auth/passwords
async function signInOperator(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}
```

### Anonymous Sign-In for Clients
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-signinanonymously
async function signInClient() {
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data
}
```

### Inserting a Comment
```typescript
async function addComment(params: {
  clientSlug: string
  targetId: string
  authorName: string
  authorRole: 'operador' | 'cliente'
  text: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('comments')
    .insert({
      client_slug: params.clientSlug,
      target_id: params.targetId,
      author_id: user.id,
      author_name: params.authorName,
      author_role: params.authorRole,
      text: params.text,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Querying Comments by Screen
```typescript
async function getCommentsByScreen(clientSlug: string, screenId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('client_slug', clientSlug)
    .like('target_id', `%${screenId}%`)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}
```

### Resolving a Comment
```typescript
async function resolveComment(commentId: string) {
  const { error } = await supabase
    .from('comments')
    .update({ resolved: true })
    .eq('id', commentId)

  if (error) throw error
}
```

### Validating a Share Token
```typescript
async function validateToken(token: string): Promise<{ valid: boolean; clientSlug: string | null }> {
  const { data, error } = await supabase
    .from('share_tokens')
    .select('client_slug')
    .eq('token', token)
    .eq('revoked', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) return { valid: false, clientSlug: null }
  return { valid: true, clientSlug: data.client_slug }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `supabase-js` v1 `setAuth()` | v2 `signInAnonymously()` | supabase-js v2 (2023) | Anonymous users get real auth.uid(), RLS works natively |
| `anon` key for shared access | Anonymous sign-ins + RLS | Supabase Auth anonymous feature (2024) | Better security, per-user attribution possible |
| `getSession()` for identity | `getUser()` for security, `getSession()` for convenience | supabase-js v2.x (2024) | getSession reads local storage (tamperable); getUser calls server |
| `process.env` in React | `import.meta.env` with VITE_ prefix | Vite 1.0+ | Required by Vite bundler |

**Deprecated/outdated:**
- `supabase.auth.session()` -- removed in v2, use `getSession()` instead
- `supabase.auth.user()` -- removed in v2, use `getUser()` instead
- `supabase.auth.setAuth()` -- removed in v2, no direct replacement needed

## Open Questions

1. **Supabase Project Setup**
   - What we know: A Supabase project is needed with auth enabled and email provider configured
   - What's unclear: Whether the operator will set this up manually or if we provide migration scripts
   - Recommendation: Provide SQL migration scripts in `docs/` or a `supabase/migrations/` folder. Document the setup steps. For local dev, use `.env.local.example` with placeholder values.

2. **Token Expiry Duration**
   - What we know: Tokens expire after a set period (user decision)
   - What's unclear: What duration is appropriate
   - Recommendation: Default to 30 days. Make it configurable in the token creation UI. Store as `expires_at` timestamp so it's easy to change.

3. **Comment Deletion**
   - What we know: Requirements mention "resolve" but not "delete"
   - What's unclear: Whether operators should be able to delete comments
   - Recommendation: Don't implement delete for v1. Resolve is sufficient. If needed later, add a soft-delete (`deleted_at`) column.

4. **Multi-Client Isolation**
   - What we know: `client_slug` is used to scope comments and tokens
   - What's unclear: Whether RLS should enforce client_slug isolation (one operator seeing only their assigned clients)
   - Recommendation: For v1, operators can see all comments across clients. Multi-tenant isolation is deferred to v2 (SEC-01, SEC-02 in REQUIREMENTS.md).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed |
| Config file | None -- see Wave 0 |
| Quick run command | `npx tsc --noEmit` (type checking only) |
| Full suite command | `npx tsc --noEmit` (no test runner yet) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WCMT-01 | Comments persist in Supabase after page reload | manual-only | Manual: create comment, reload page, verify presence | N/A -- requires Supabase instance |
| WCMT-01 | Block-level comment anchoring uses correct target_id | unit | `npx tsc --noEmit` (type safety on target_id generation) | Wave 0 |
| WCMT-02 | Token validation accepts valid token, rejects expired/revoked | unit | Testable as pure function if Supabase client is mocked | Wave 0 |
| WCMT-02 | Anonymous client can create comments | manual-only | Manual: open shared link, enter name, post comment | N/A -- requires Supabase instance |
| WCMT-03 | Resolve marks comment as resolved in database | manual-only | Manual: click resolve, verify dimmed UI + DB update | N/A -- requires Supabase instance |
| WCMT-03 | Management panel shows all comments grouped by screen | manual-only | Manual: open panel, verify grouping and filter | N/A -- requires Supabase instance |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (zero TypeScript errors is the acceptance criterion per CLAUDE.md)
- **Per wave merge:** `npx tsc --noEmit` + manual smoke test of comment flow
- **Phase gate:** Full manual walkthrough of all three success criteria before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No test framework installed (Vitest would be the natural fit for Vite projects but is not required for this phase)
- [ ] No Supabase test instance -- most testing is manual against a real Supabase project
- [ ] Type-checking (`npx tsc --noEmit`) serves as the primary automated validation per CLAUDE.md conventions

Note: Given that this phase is heavily integration-focused (Supabase as external dependency) and the project's acceptance criterion is zero TypeScript errors, the validation strategy leans manual. The type system enforces correct usage of Supabase client, comment types, and auth context. A test framework could be introduced but is not blocking for this phase.

## Sources

### Primary (HIGH confidence)
- [Supabase React Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs) -- client setup, env vars, basic usage
- [Supabase Auth Password Docs](https://supabase.com/docs/guides/auth/passwords) -- signUp, signInWithPassword
- [Supabase Auth Anonymous Docs](https://supabase.com/docs/guides/auth/auth-anonymous) -- signInAnonymously, RLS for anonymous users, is_anonymous JWT claim
- [Supabase Auth React Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react) -- onAuthStateChange, session management
- [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) -- enabling RLS, policy syntax, auth.uid(), auth.jwt()
- [Supabase getSession Reference](https://supabase.com/docs/reference/javascript/auth-getsession) -- getSession vs getUser security considerations
- [Supabase signInAnonymously Reference](https://supabase.com/docs/reference/javascript/auth-signinanonymously) -- API, parameters, return values
- [supabase-js Releases](https://github.com/supabase/supabase-js/releases) -- v2.98.0 is latest stable (2026-02-26)

### Secondary (MEDIUM confidence)
- Existing codebase analysis: `CommentOverlay.tsx`, `WireframeViewer.tsx`, `BlueprintRenderer.tsx`, `SectionRenderer.tsx` -- verified current component structure and integration points
- `tools/wireframe-builder/types/blueprint.ts` -- confirmed BlueprintSection has no `id` field, BlueprintScreen has `id`

### Tertiary (LOW confidence)
- Token expiry duration (30 days recommendation) -- no authoritative source, based on common practice for review/feedback tools
- Supabase anonymous sign-ins for shared link pattern -- this is an unconventional use of the feature; most docs show it for guest checkout or trial accounts. It works technically but is not a documented best practice for link sharing specifically.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- `@supabase/supabase-js` v2.98.0 is the only option, well-documented
- Architecture: HIGH -- patterns verified from official Supabase docs, existing codebase structure is clear
- Database schema: MEDIUM -- schema is our design, RLS policies follow documented patterns but token-validation-via-anonymous-signin is a novel combination
- Pitfalls: HIGH -- RLS, env vars, anon vs anonymous confusion are well-documented in Supabase community
- Block anchoring: MEDIUM -- positional anchoring is pragmatic but fragile if sections are reordered

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (stable -- Supabase JS client changes slowly within major version)
