# RLS (Row Level Security) Checklist

Verify Supabase Row Level Security configuration for data isolation.

## Table Configuration

For EVERY table in the database, verify:

- [ ] **[Critical]** RLS is enabled (`ALTER TABLE {table} ENABLE ROW LEVEL SECURITY`)
- [ ] **[Critical]** Table has `org_id text NOT NULL` column
- [ ] **[Critical]** At least one RLS policy exists for the table
- [ ] **[Critical]** RLS policy filters by `org_id` from JWT claims

## Policy Pattern

The standard RLS policy pattern for FXL spoke projects:

```sql
-- Standard policy: org-scoped access with anon fallback
CREATE POLICY "{table}_org_access" ON {table}
  FOR ALL USING (
    org_id = COALESCE(
      (current_setting('request.jwt.claims', true)::jsonb->>'org_id'),
      org_id
    )
  );
```

**Explanation:**
- `current_setting('request.jwt.claims', true)` reads the JWT claims (returns NULL if no JWT)
- `->>'org_id'` extracts the org_id from claims
- `COALESCE(..., org_id)` falls back to self-reference when no JWT (anon/dev mode)
- `FOR ALL` applies to SELECT, INSERT, UPDATE, DELETE

For each table, verify:

- [ ] **[Critical]** Policy uses `org_id` from JWT claims (not from request parameters)
- [ ] **[Important]** Policy covers all operations (FOR ALL or separate policies per operation)
- [ ] **[Important]** No policy with `USING (true)` in production (bypasses all isolation)
- [ ] **[Normal]** COALESCE pattern used for anon/dev fallback

## Index Configuration

- [ ] **[Important]** Index exists on `org_id` for every table: `CREATE INDEX idx_{table}_org_id ON {table}(org_id)`
- [ ] **[Normal]** Composite indexes exist for common query patterns (e.g., `org_id + created_at`)

## Verification Steps

### 1. List all tables and check RLS status

```sql
SELECT tablename,
       rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

Every table should have `rowsecurity = true`.

### 2. List all RLS policies

```sql
SELECT tablename,
       policyname,
       permissive,
       cmd,
       qual
FROM pg_policies
WHERE schemaname = 'public';
```

Every table should have at least one policy with `org_id` in the `qual` column.

### 3. Test isolation

```sql
-- Set JWT claims for org A
SELECT set_config('request.jwt.claims', '{"org_id": "org_a"}', true);

-- Query table — should only return org_a rows
SELECT * FROM {table};

-- Set JWT claims for org B
SELECT set_config('request.jwt.claims', '{"org_id": "org_b"}', true);

-- Query table — should only return org_b rows (NOT org_a)
SELECT * FROM {table};
```

### 4. Verify no data leaks

```sql
-- With org A context, try to read org B data
SELECT set_config('request.jwt.claims', '{"org_id": "org_a"}', true);
SELECT count(*) FROM {table} WHERE org_id = 'org_b';
-- Should return 0
```

## Per-Table Checklist Template

Copy this for each table in your project:

### Table: `{table_name}`

- [ ] RLS enabled
- [ ] `org_id text NOT NULL` column exists
- [ ] Default value set for `org_id` (or application always provides it)
- [ ] Policy `{table}_org_access` exists
- [ ] Policy uses `org_id` from JWT claims
- [ ] Index `idx_{table}_org_id` exists
- [ ] Tested: org A cannot read org B data
- [ ] Tested: org A cannot write to org B data

## Common Issues

| Issue | Severity | Fix |
|-------|----------|-----|
| RLS not enabled on table | Critical | `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY` |
| Missing org_id column | Critical | `ALTER TABLE {table} ADD COLUMN org_id text NOT NULL DEFAULT '{default}'` |
| No policy on table | Critical | Add standard policy (see pattern above) |
| Policy uses `USING (true)` | Critical | Replace with org_id-based policy |
| Missing org_id index | Important | `CREATE INDEX idx_{table}_org_id ON {table}(org_id)` |
| Policy only covers SELECT | Important | Change to `FOR ALL` or add policies for INSERT/UPDATE/DELETE |

## Scoring

| Severity | Weight |
|----------|--------|
| Critical | 10 |
| Important | 5 |
| Normal | 2 |
