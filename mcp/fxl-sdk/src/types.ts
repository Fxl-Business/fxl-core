// ============================================================
// Types for FXL SDK MCP Server
// Maps to Supabase tables: sdk_standards, sdk_learnings, sdk_pitfalls, sdk_projects
// ============================================================

export interface SdkStandard {
  id: string;
  category: string;
  rule: string;
  details: string;
  examples: string | null;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface SdkLearning {
  id: string;
  category: string;
  rule: string;
  context: string;
  source_repo: string | null;
  tags: string[];
  promoted_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface SdkPitfall {
  id: string;
  category: string;
  rule: string;
  context: string;
  source_repo: string | null;
  tags: string[];
  severity: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface SdkProject {
  id: string;
  slug: string;
  name: string;
  stack_choices: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  table: 'sdk_standards' | 'sdk_learnings' | 'sdk_pitfalls';
  id: string;
  category: string;
  rule: string;
  excerpt: string;
  rank: number;
}

export interface SdkStatus {
  version: string;
  tables: {
    standards: number;
    learnings: number;
    pitfalls: number;
    projects: number;
  };
  last_updated: string | null;
}

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  API_KEY: string;
}
