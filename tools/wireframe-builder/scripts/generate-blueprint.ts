/**
 * Node.js CLI entry point for AI-assisted blueprint generation.
 *
 * Reads a BriefingConfig from Supabase, generates a BlueprintConfig using
 * the generation engine, validates with Zod, and saves to Supabase.
 *
 * NOT a Vite module -- uses process.env, not import.meta.env.
 *
 * Usage:
 *   npx tsx --env-file .env.local tools/wireframe-builder/scripts/generate-blueprint.ts <slug> [vertical] [--force]
 */

import { createClient } from '@supabase/supabase-js'
import { BriefingConfigSchema } from '../lib/briefing-schema'
import { BlueprintConfigSchema } from '../lib/blueprint-schema'
import { generateBlueprint } from '../lib/generation-engine'
import type { VerticalId } from '../lib/vertical-templates'

// ---------------------------------------------------------------------------
// Supabase client (standalone -- NOT importing @/lib/supabase)
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.\n' +
    'Run with: npx tsx --env-file .env.local tools/wireframe-builder/scripts/generate-blueprint.ts <slug>'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)
const forceFlag = args.includes('--force')
const positionalArgs = args.filter((a) => a !== '--force')

const clientSlug = positionalArgs[0]
const vertical = positionalArgs[1] as VerticalId | undefined

if (!clientSlug) {
  console.error(
    'Usage: npx tsx --env-file .env.local tools/wireframe-builder/scripts/generate-blueprint.ts <client-slug> [vertical] [--force]\n\n' +
    'Parameters:\n' +
    '  client-slug  (required) slug do cliente\n' +
    '  vertical     (optional) financeiro | varejo | servicos\n' +
    '  --force      (optional) overwrite existing blueprint\n'
  )
  process.exit(1)
}

if (vertical && !['financeiro', 'varejo', 'servicos'].includes(vertical)) {
  console.error(`Invalid vertical: "${vertical}". Must be one of: financeiro, varejo, servicos`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Main flow
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // 1. Load briefing from Supabase
  console.log(`Loading briefing for "${clientSlug}"...`)
  const { data: briefingRow, error: briefingError } = await supabase
    .from('briefing_configs')
    .select('config')
    .eq('client_slug', clientSlug)
    .maybeSingle()

  if (briefingError) {
    console.error(`Supabase error loading briefing: ${briefingError.message}`)
    process.exit(1)
  }

  if (!briefingRow) {
    console.error(`No briefing found for client "${clientSlug}". Fill the briefing form first.`)
    process.exit(1)
  }

  // 2. Validate briefing with Zod
  let briefing
  try {
    briefing = BriefingConfigSchema.parse(briefingRow.config)
  } catch (err) {
    if (err instanceof Error && 'issues' in err) {
      const zodErr = err as { issues: { path: (string | number)[]; message: string }[] }
      console.error('Briefing validation failed:')
      for (const issue of zodErr.issues) {
        console.error(`  ${issue.path.join('.')}: ${issue.message}`)
      }
    } else {
      console.error('Briefing validation failed:', err)
    }
    process.exit(1)
  }

  // 3. Check if blueprint already exists
  const { data: existingBlueprint, error: checkError } = await supabase
    .from('blueprint_configs')
    .select('client_slug')
    .eq('client_slug', clientSlug)
    .maybeSingle()

  if (checkError) {
    console.error(`Supabase error checking existing blueprint: ${checkError.message}`)
    process.exit(1)
  }

  if (existingBlueprint && !forceFlag) {
    console.error(
      `Blueprint already exists for "${clientSlug}". Use --force to overwrite.`
    )
    process.exit(1)
  }

  // 4. Generate blueprint
  console.log(
    `Generating blueprint${vertical ? ` (vertical: ${vertical})` : ' (no vertical)'}...`
  )
  const blueprint = generateBlueprint(briefing, clientSlug, vertical ? { vertical } : undefined)

  // 5. Validate output with Zod
  let validated
  try {
    validated = BlueprintConfigSchema.parse(blueprint)
  } catch (err) {
    if (err instanceof Error && 'issues' in err) {
      const zodErr = err as { issues: { path: (string | number)[]; message: string }[] }
      console.error('Generated blueprint validation failed:')
      for (const issue of zodErr.issues) {
        console.error(`  ${issue.path.join('.')}: ${issue.message}`)
      }
    } else {
      console.error('Generated blueprint validation failed:', err)
    }
    process.exit(1)
  }

  // 6. Upsert to Supabase
  const { error: upsertError } = await supabase
    .from('blueprint_configs')
    .upsert(
      {
        client_slug: clientSlug,
        config: validated,
        updated_by: 'claude:generation',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_slug' }
    )

  if (upsertError) {
    console.error(`Supabase error saving blueprint: ${upsertError.message}`)
    process.exit(1)
  }

  console.log(
    `Blueprint generated for "${clientSlug}": ${validated.screens.length} screens`
  )
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
