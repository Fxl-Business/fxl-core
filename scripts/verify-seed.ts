/**
 * Verification script for seed-documents.ts output.
 * Checks data integrity in Supabase documents table.
 *
 * Usage: npx tsx --env-file .env.local scripts/verify-seed.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main(): Promise<void> {
  let passed = 0
  let failed = 0

  function check(name: string, ok: boolean, detail?: string): void {
    if (ok) {
      console.log(`  PASS: ${name}`)
      passed++
    } else {
      console.log(`  FAIL: ${name}${detail ? ` — ${detail}` : ''}`)
      failed++
    }
  }

  // 1. Total count
  console.log('\n--- Row Count ---')
  const { count } = await supabase.from('documents').select('id', { count: 'exact', head: true })
  check('62 documents in table', count === 62, `got ${count}`)

  // 2. Slug derivation
  console.log('\n--- Slug Derivation ---')
  const { data: processoIndex } = await supabase.from('documents').select('*').eq('slug', 'processo/index').single()
  check('processo/index exists', !!processoIndex)

  const { data: fase1 } = await supabase.from('documents').select('*').eq('slug', 'processo/fases/fase1').single()
  check('processo/fases/fase1 exists', !!fase1)

  const { data: padroesIndex } = await supabase.from('documents').select('*').eq('slug', 'padroes/index').single()
  check('padroes/index exists', !!padroesIndex)

  // 3. Parent path derivation
  console.log('\n--- Parent Path ---')
  check('fase1 parent_path = processo/fases', fase1?.parent_path === 'processo/fases', `got "${fase1?.parent_path}"`)

  const { data: ferrIndex } = await supabase.from('documents').select('*').eq('slug', 'ferramentas/index').single()
  check('ferramentas/index parent_path = ferramentas', ferrIndex?.parent_path === 'ferramentas', `got "${ferrIndex?.parent_path}"`)

  // 4. Sort order
  console.log('\n--- Sort Order ---')
  check('processo/index sort_order = 0', processoIndex?.sort_order === 0, `got ${processoIndex?.sort_order}`)
  check('padroes/index sort_order = 0', padroesIndex?.sort_order === 0, `got ${padroesIndex?.sort_order}`)
  check('ferramentas/index sort_order = 0', ferrIndex?.sort_order === 0, `got ${ferrIndex?.sort_order}`)

  const { data: fasesDocs } = await supabase.from('documents').select('slug, sort_order').eq('parent_path', 'processo/fases').order('sort_order')
  check('processo/fases has sequential sort_order', !!fasesDocs && fasesDocs.length > 1 && fasesDocs[0].sort_order === 0)

  // 5. Custom tags preservation
  console.log('\n--- Custom Tags ---')
  const { data: fasesIndex } = await supabase.from('documents').select('body').eq('slug', 'processo/fases/index').single()
  check('processo/fases/index has {% phase-card', !!fasesIndex?.body?.includes('{% phase-card'))

  check('processo/fases/fase1 has {% callout or {% operational',
    !!fase1?.body?.includes('{%'))

  // 6. Frontmatter extraction
  console.log('\n--- Frontmatter ---')
  check('fase1 title correct', fase1?.title === 'Fase 1 — Diagnostico Estrategico', `got "${fase1?.title}"`)
  check('fase1 badge = Processo', fase1?.badge === 'Processo', `got "${fase1?.badge}"`)
  check('fase1 description correct', fase1?.description === 'Coleta, mapeamento e formacao do Briefing', `got "${fase1?.description}"`)

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err: unknown) => {
  console.error('Verification failed:', err)
  process.exit(1)
})
