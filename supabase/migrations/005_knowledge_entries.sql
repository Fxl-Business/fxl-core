-- Migration: Knowledge entries table for internal KB (bugs, decisions, patterns, lessons)
-- Full-text search via PostgreSQL tsvector GENERATED ALWAYS column (Portuguese stemming).
-- All access through anon role (Clerk handles auth externally).

CREATE TABLE public.knowledge_entries (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type  text        NOT NULL CHECK (entry_type IN ('bug', 'decision', 'pattern', 'lesson')),
  title       text        NOT NULL,
  body        text        NOT NULL,
  tags        text[]      NOT NULL DEFAULT '{}',
  client_slug text,
  created_by  text,                          -- Clerk user ID (text, not uuid)
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  search_vec  tsvector    GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(body, ''))
  ) STORED
);

ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_knowledge_entries"
  ON knowledge_entries FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_knowledge_entries"
  ON knowledge_entries FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_knowledge_entries"
  ON knowledge_entries FOR UPDATE TO anon USING (true);

CREATE POLICY "anon_delete_knowledge_entries"
  ON knowledge_entries FOR DELETE TO anon USING (true);

CREATE INDEX idx_knowledge_entries_search     ON knowledge_entries USING GIN (search_vec);
CREATE INDEX idx_knowledge_entries_client_slug ON knowledge_entries (client_slug);
CREATE INDEX idx_knowledge_entries_entry_type  ON knowledge_entries (entry_type);
