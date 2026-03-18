// ============================================================
// META tools: get_sdk_status, get_project_config
// ============================================================

import type { DbClient } from '../supabase.js';
import type { SdkProject, SdkStatus } from '../types.js';

const SDK_VERSION = 'v1.0.0';

export async function getSdkStatus(db: DbClient): Promise<SdkStatus> {
  // Fetch counts from all tables using Promise.allSettled
  const [standardsResult, learningsResult, pitfallsResult, projectsResult, lastUpdatedResult] =
    await Promise.allSettled([
      db.from('sdk_standards').select('id', { count: 'exact', head: true }),
      db.from('sdk_learnings').select('id', { count: 'exact', head: true }),
      db.from('sdk_pitfalls').select('id', { count: 'exact', head: true }),
      db.from('sdk_projects').select('id', { count: 'exact', head: true }),
      db
        .from('sdk_standards')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single(),
    ]);

  const standardsCount =
    standardsResult.status === 'fulfilled' ? (standardsResult.value.count ?? 0) : 0;
  const learningsCount =
    learningsResult.status === 'fulfilled' ? (learningsResult.value.count ?? 0) : 0;
  const pitfallsCount =
    pitfallsResult.status === 'fulfilled' ? (pitfallsResult.value.count ?? 0) : 0;
  const projectsCount =
    projectsResult.status === 'fulfilled' ? (projectsResult.value.count ?? 0) : 0;

  let lastUpdated: string | null = null;
  if (lastUpdatedResult.status === 'fulfilled' && lastUpdatedResult.value.data) {
    const row = lastUpdatedResult.value.data as { updated_at: string };
    lastUpdated = row.updated_at;
  }

  return {
    version: SDK_VERSION,
    tables: {
      standards: standardsCount,
      learnings: learningsCount,
      pitfalls: pitfallsCount,
      projects: projectsCount,
    },
    last_updated: lastUpdated,
  };
}

export async function getProjectConfig(db: DbClient, slug: string): Promise<SdkProject | null> {
  const { data, error } = await db
    .from('sdk_projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    // PGRST116 = "no rows returned" — not found, not an error
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch project config: ${error.message}`);
  }

  return (data as SdkProject) ?? null;
}
