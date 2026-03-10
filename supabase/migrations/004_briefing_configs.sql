-- Migration: Briefing configs table for client briefing data
-- Stores the full BriefingConfig JSON per client slug.
-- All access through anon role (Clerk handles auth externally).

CREATE TABLE public.briefing_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug text NOT NULL UNIQUE,
  config jsonb NOT NULL,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.briefing_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_briefing_configs"
  ON briefing_configs FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_briefing_configs"
  ON briefing_configs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_briefing_configs"
  ON briefing_configs FOR UPDATE TO anon USING (true);

CREATE INDEX idx_briefing_configs_client_slug ON briefing_configs(client_slug);
