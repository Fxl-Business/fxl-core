-- Migration: Tasks table for internal task management (Kanban-style)
-- Status and priority enforced via CHECK constraints.
-- All access through anon role (Clerk handles auth externally).

CREATE TABLE public.tasks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  description text        NOT NULL DEFAULT '',
  status      text        NOT NULL DEFAULT 'todo'
                          CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
  priority    text        NOT NULL DEFAULT 'medium'
                          CHECK (priority IN ('low', 'medium', 'high')),
  client_slug text,
  due_date    date,
  created_by  text,                          -- Clerk user ID (text, not uuid)
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_tasks"
  ON tasks FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_tasks"
  ON tasks FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_tasks"
  ON tasks FOR UPDATE TO anon USING (true);

CREATE POLICY "anon_delete_tasks"
  ON tasks FOR DELETE TO anon USING (true);

CREATE INDEX idx_tasks_client_slug ON tasks (client_slug);
CREATE INDEX idx_tasks_status      ON tasks (status);
