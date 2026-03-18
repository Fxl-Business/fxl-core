// ============================================================
// READ tools: get_standards, get_learnings, get_pitfalls, get_checklist, search_knowledge
// ============================================================

import type { DbClient } from '../supabase.js';
import type { SdkStandard, SdkLearning, SdkPitfall, SearchResult } from '../types.js';

export async function getStandards(db: DbClient, category?: string): Promise<SdkStandard[]> {
  let query = db.from('sdk_standards').select('*').order('category').order('created_at');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch standards: ${error.message}`);
  }

  return (data ?? []) as SdkStandard[];
}

export async function getLearnings(db: DbClient, category?: string): Promise<SdkLearning[]> {
  let query = db.from('sdk_learnings').select('*').order('category').order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch learnings: ${error.message}`);
  }

  return (data ?? []) as SdkLearning[];
}

export async function getPitfalls(db: DbClient, category?: string): Promise<SdkPitfall[]> {
  let query = db.from('sdk_pitfalls').select('*').order('severity').order('category').order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch pitfalls: ${error.message}`);
  }

  return (data ?? []) as SdkPitfall[];
}

export async function getChecklist(db: DbClient, name: string): Promise<SdkStandard[]> {
  // Checklists are stored as standards with category = 'checklist'
  const { data, error } = await db
    .from('sdk_standards')
    .select('*')
    .eq('category', 'checklist')
    .ilike('rule', `%${name}%`)
    .order('created_at');

  if (error) {
    throw new Error(`Failed to fetch checklist: ${error.message}`);
  }

  // If no exact match in checklists, search all standards matching the name
  if (!data || data.length === 0) {
    const { data: fallbackData, error: fallbackError } = await db
      .from('sdk_standards')
      .select('*')
      .ilike('rule', `%${name}%`)
      .order('category')
      .order('created_at');

    if (fallbackError) {
      throw new Error(`Failed to fetch checklist: ${fallbackError.message}`);
    }

    return (fallbackData ?? []) as SdkStandard[];
  }

  return data as SdkStandard[];
}

interface StandardSearchRow {
  id: string;
  category: string;
  rule: string;
  details: string;
}

interface KnowledgeSearchRow {
  id: string;
  category: string;
  rule: string;
  context: string;
}

export async function searchKnowledge(db: DbClient, query: string): Promise<SearchResult[]> {
  const searchQuery = query.trim();

  if (!searchQuery) {
    return [];
  }

  const results: SearchResult[] = [];

  // Search across all tables using Promise.allSettled (independent queries)
  const [stdResult, lrnResult, ptfResult] = await Promise.allSettled([
    db
      .from('sdk_standards')
      .select('id, category, rule, details')
      .or(`rule.ilike.%${searchQuery}%,details.ilike.%${searchQuery}%`),
    db
      .from('sdk_learnings')
      .select('id, category, rule, context')
      .or(`rule.ilike.%${searchQuery}%,context.ilike.%${searchQuery}%`),
    db
      .from('sdk_pitfalls')
      .select('id, category, rule, context')
      .or(`rule.ilike.%${searchQuery}%,context.ilike.%${searchQuery}%`),
  ]);

  if (stdResult.status === 'fulfilled' && stdResult.value.data) {
    for (const row of stdResult.value.data as StandardSearchRow[]) {
      results.push({
        table: 'sdk_standards',
        id: row.id,
        category: row.category,
        rule: row.rule,
        excerpt: (row.details ?? '').substring(0, 200),
        rank: 0,
      });
    }
  }
  if (lrnResult.status === 'fulfilled' && lrnResult.value.data) {
    for (const row of lrnResult.value.data as KnowledgeSearchRow[]) {
      results.push({
        table: 'sdk_learnings',
        id: row.id,
        category: row.category,
        rule: row.rule,
        excerpt: (row.context ?? '').substring(0, 200),
        rank: 0,
      });
    }
  }
  if (ptfResult.status === 'fulfilled' && ptfResult.value.data) {
    for (const row of ptfResult.value.data as KnowledgeSearchRow[]) {
      results.push({
        table: 'sdk_pitfalls',
        id: row.id,
        category: row.category,
        rule: row.rule,
        excerpt: (row.context ?? '').substring(0, 200),
        rank: 0,
      });
    }
  }

  return results;
}
