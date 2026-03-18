-- ============================================================
-- Migration 015: SDK Knowledge Tables
-- Creates sdk_standards, sdk_learnings, sdk_pitfalls, sdk_projects
-- RLS enabled with NO permissive policies (service role only)
-- GIN full-text search indexes on rule/details/context fields
-- ============================================================

-- 1. sdk_standards
CREATE TABLE sdk_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  rule text NOT NULL,
  details text NOT NULL,
  examples text,
  version text NOT NULL DEFAULT 'v1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sdk_standards ENABLE ROW LEVEL SECURITY;

-- 2. sdk_learnings
CREATE TABLE sdk_learnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  rule text NOT NULL,
  context text NOT NULL,
  source_repo text,
  tags jsonb DEFAULT '[]',
  promoted_to uuid REFERENCES sdk_standards(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sdk_learnings ENABLE ROW LEVEL SECURITY;

-- 3. sdk_pitfalls
CREATE TABLE sdk_pitfalls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  rule text NOT NULL,
  context text NOT NULL,
  source_repo text,
  tags jsonb DEFAULT '[]',
  severity text NOT NULL DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sdk_pitfalls ENABLE ROW LEVEL SECURITY;

-- 4. sdk_projects
CREATE TABLE sdk_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  stack_choices jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sdk_projects ENABLE ROW LEVEL SECURITY;

-- 5. GIN full-text search indexes (Portuguese)
CREATE INDEX idx_sdk_standards_search ON sdk_standards USING gin(to_tsvector('portuguese', rule || ' ' || details));
CREATE INDEX idx_sdk_learnings_search ON sdk_learnings USING gin(to_tsvector('portuguese', rule || ' ' || context));
CREATE INDEX idx_sdk_pitfalls_search ON sdk_pitfalls USING gin(to_tsvector('portuguese', rule || ' ' || context));
