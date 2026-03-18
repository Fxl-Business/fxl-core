// ============================================================
// WRITE tools: add_learning, add_pitfall, promote_to_standard, register_project
// ============================================================

import type { DbClient } from '../supabase.js';
import type { SdkLearning, SdkPitfall, SdkProject, SdkStandard } from '../types.js';

interface AddLearningInput {
  rule: string;
  context: string;
  category: string;
  source_repo?: string;
  tags?: string[];
}

export async function addLearning(db: DbClient, input: AddLearningInput): Promise<SdkLearning> {
  const { data, error } = await db
    .from('sdk_learnings')
    .insert({
      rule: input.rule,
      context: input.context,
      category: input.category,
      source_repo: input.source_repo ?? null,
      tags: input.tags ?? [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add learning: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to add learning: no data returned');
  }

  return data as SdkLearning;
}

interface AddPitfallInput {
  rule: string;
  context: string;
  category: string;
  source_repo?: string;
  tags?: string[];
  severity?: 'low' | 'medium' | 'high';
}

export async function addPitfall(db: DbClient, input: AddPitfallInput): Promise<SdkPitfall> {
  const { data, error } = await db
    .from('sdk_pitfalls')
    .insert({
      rule: input.rule,
      context: input.context,
      category: input.category,
      source_repo: input.source_repo ?? null,
      tags: input.tags ?? [],
      severity: input.severity ?? 'medium',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add pitfall: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to add pitfall: no data returned');
  }

  return data as SdkPitfall;
}

interface PromoteInput {
  learning_id: string;
  details?: string;
  examples?: string;
}

export async function promoteToStandard(db: DbClient, input: PromoteInput): Promise<SdkStandard> {
  // 1. Fetch the learning
  const { data: rawLearning, error: fetchError } = await db
    .from('sdk_learnings')
    .select('*')
    .eq('id', input.learning_id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch learning: ${fetchError.message}`);
  }

  if (!rawLearning) {
    throw new Error(`Learning not found: ${input.learning_id}`);
  }

  const learning = rawLearning as SdkLearning;

  // 2. Check if already promoted
  if (learning.promoted_to) {
    throw new Error(`Learning already promoted to standard: ${learning.promoted_to}`);
  }

  // 3. Create the standard from the learning
  const { data: rawStandard, error: insertError } = await db
    .from('sdk_standards')
    .insert({
      category: learning.category,
      rule: learning.rule,
      details: input.details ?? learning.context,
      examples: input.examples ?? null,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create standard: ${insertError.message}`);
  }

  if (!rawStandard) {
    throw new Error('Failed to create standard: no data returned');
  }

  const standard = rawStandard as SdkStandard;

  // 4. Update the learning with the promoted_to FK
  const { error: updateError } = await db
    .from('sdk_learnings')
    .update({ promoted_to: standard.id, updated_at: new Date().toISOString() })
    .eq('id', input.learning_id);

  if (updateError) {
    throw new Error(`Standard created but failed to update learning FK: ${updateError.message}`);
  }

  return standard;
}

interface RegisterProjectInput {
  slug: string;
  name: string;
  stack_choices: Record<string, string>;
}

export async function registerProject(db: DbClient, input: RegisterProjectInput): Promise<SdkProject> {
  // Check if project already exists (upsert on slug)
  const { data: existing } = await db
    .from('sdk_projects')
    .select('*')
    .eq('slug', input.slug)
    .single();

  if (existing) {
    // Update existing project
    const { data, error } = await db
      .from('sdk_projects')
      .update({
        name: input.name,
        stack_choices: input.stack_choices,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', input.slug)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to update project: no data returned');
    }

    return data as SdkProject;
  }

  // Insert new project
  const { data, error } = await db
    .from('sdk_projects')
    .insert({
      slug: input.slug,
      name: input.name,
      stack_choices: input.stack_choices,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to register project: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to register project: no data returned');
  }

  return data as SdkProject;
}
