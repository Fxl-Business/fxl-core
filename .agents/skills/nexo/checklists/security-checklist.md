# Security Checklist

Verify security posture of an FXL spoke project. Each item has a severity level.

## Authentication

- [ ] **[Critical]** Clerk is configured as auth provider (`@clerk/react` in dependencies)
- [ ] **[Critical]** `ClerkProvider` wraps the entire app with correct publishable key
- [ ] **[Critical]** All routes except public pages are wrapped in auth guards
- [ ] **[Critical]** API endpoints validate Clerk JWT on every request
- [ ] **[Important]** JWT validation uses JWKS (not hardcoded secret)
- [ ] **[Important]** `org_id` is extracted from server-validated JWT (never from client request body/query)

## Environment Variables

- [ ] **[Critical]** `.env.local` is in `.gitignore`
- [ ] **[Critical]** No secrets (API keys, service role keys) in source code
- [ ] **[Critical]** `SUPABASE_SERVICE_ROLE_KEY` is NOT prefixed with `VITE_`
- [ ] **[Critical]** `CLERK_SECRET_KEY` is NOT prefixed with `VITE_`
- [ ] **[Important]** `.env.example` exists with placeholder values for all required vars
- [ ] **[Normal]** Only `VITE_` prefixed vars are used in client-side code

## Supabase RLS

- [ ] **[Critical]** RLS is ENABLED on every table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] **[Critical]** Every table has an RLS policy filtering by `org_id`
- [ ] **[Critical]** No table has a permissive `USING (true)` policy in production
- [ ] **[Important]** Service role key is NOT used in client-side code
- [ ] **[Important]** Anon key is used for client-side queries (RLS handles isolation)
- [ ] **[Normal]** RLS policies are tested with queries from different org contexts

## Security Headers

- [ ] **[Important]** `vercel.json` exists with security headers
- [ ] **[Important]** `X-Frame-Options: DENY` is set
- [ ] **[Important]** `X-Content-Type-Options: nosniff` is set
- [ ] **[Normal]** `X-XSS-Protection: 1; mode=block` is set
- [ ] **[Normal]** `Referrer-Policy: strict-origin-when-cross-origin` is set
- [ ] **[Normal]** `Permissions-Policy` restricts camera, microphone, geolocation

## Input Handling

- [ ] **[Important]** User input is validated before database operations
- [ ] **[Important]** Pagination has a maximum page size (100 items)
- [ ] **[Important]** Search queries are parameterized (no SQL injection via raw strings)
- [ ] **[Normal]** Zod or similar schema validation is used for complex inputs
- [ ] **[Normal]** No use of `dangerouslySetInnerHTML` with user-provided content

## Dependencies

- [ ] **[Important]** No known vulnerable dependencies (`bun audit`)
- [ ] **[Normal]** `bun.lockb` is committed
- [ ] **[Normal]** Dependencies are up to date (no major version behind)

## Scoring

| Severity | Weight |
|----------|--------|
| Critical | 10 |
| Important | 5 |
| Normal | 2 |
