-- Migration: Documents table for dynamic doc content (from docs/ filesystem)
-- Stores title, badge, description (frontmatter) + body (markdown) + navigation structure.
-- All access through anon role (Clerk handles auth externally).

CREATE TABLE public.documents (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  badge       text        NOT NULL,
  description text        NOT NULL DEFAULT '',
  slug        text        NOT NULL UNIQUE,
  parent_path text        NOT NULL,
  body        text        NOT NULL,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_documents"
  ON documents FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_documents"
  ON documents FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_documents"
  ON documents FOR UPDATE TO anon USING (true);

CREATE POLICY "anon_delete_documents"
  ON documents FOR DELETE TO anon USING (true);

CREATE INDEX idx_documents_parent_path       ON documents (parent_path);
CREATE INDEX idx_documents_parent_path_order ON documents (parent_path, sort_order);
