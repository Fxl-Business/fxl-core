-- Migration: Blueprint configs table for wireframe visual editor
-- Stores the full BlueprintConfig JSON per client slug.
-- All access through anon role (Clerk handles auth externally).

CREATE TABLE public.blueprint_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug text NOT NULL UNIQUE,
  config jsonb NOT NULL,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blueprint_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_blueprint_configs"
  ON blueprint_configs FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_blueprint_configs"
  ON blueprint_configs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_blueprint_configs"
  ON blueprint_configs FOR UPDATE TO anon USING (true);

CREATE INDEX idx_blueprint_configs_client_slug ON blueprint_configs(client_slug);
