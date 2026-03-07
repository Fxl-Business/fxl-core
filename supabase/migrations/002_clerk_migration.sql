-- Migration: Supabase Auth -> Clerk
-- Clerk handles authentication externally. Supabase is used as a pure data store.
-- All access now goes through the anon role (Supabase anon key).

-- 1. Drop old RLS policies FIRST (they reference author_id and block type change)
DROP POLICY IF EXISTS "Authenticated users can read comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
DROP POLICY IF EXISTS "Operators can resolve comments" ON comments;
DROP POLICY IF EXISTS "Operators can manage tokens" ON share_tokens;
DROP POLICY IF EXISTS "Anyone can validate tokens" ON share_tokens;

-- 2. Change author_id from uuid to text (Clerk user IDs are strings like 'user_xxx')
ALTER TABLE public.comments ALTER COLUMN author_id TYPE text;

-- 3. Remove foreign key on share_tokens.created_by and change to text
ALTER TABLE public.share_tokens DROP CONSTRAINT IF EXISTS share_tokens_created_by_fkey;
ALTER TABLE public.share_tokens ALTER COLUMN created_by TYPE text;

-- 4. New RLS policies for anon role
CREATE POLICY "anon_read_comments"
  ON comments FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_comments"
  ON comments FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_resolve_comments"
  ON comments FOR UPDATE TO anon
  USING (true)
  WITH CHECK (resolved = true);

CREATE POLICY "anon_read_tokens"
  ON share_tokens FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_tokens"
  ON share_tokens FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_tokens"
  ON share_tokens FOR UPDATE TO anon USING (true);
