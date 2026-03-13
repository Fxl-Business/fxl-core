/**
 * Seed script for migrating docs/ markdown files to Supabase documents table.
 *
 * Reads all .md files from docs/, extracts frontmatter (title, badge, description),
 * preserves body content (including custom tags) as-is, derives parent_path and
 * sort_order from filesystem structure, and upserts into the documents table.
 *
 * NOT a Vite module — uses process.env, not import.meta.env.
 *
 * Usage:
 *   npx tsx --env-file .env.local scripts/seed-documents.ts [--force]
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import yaml from 'yaml'

// ---------------------------------------------------------------------------
// Supabase client (standalone -- NOT importing @/lib/supabase)
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.\n' +
    'Run with: npx tsx --env-file .env.local scripts/seed-documents.ts [--force]'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DocumentRow = {
  title: string
  badge: string
  description: string
  slug: string
  parent_path: string
  body: string
  sort_order: number
}

type Frontmatter = {
  title: string
  badge: string
  description?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively collect all .md file paths under a directory */
function collectMarkdownFiles(dir: string): string[] {
  const results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath)
    }
  }
  return results
}

/** Extract frontmatter and body from a markdown file */
function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } | null {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return null

  const parsed = yaml.parse(match[1]) as Record<string, unknown>
  if (!parsed || typeof parsed.title !== 'string' || typeof parsed.badge !== 'string') {
    return null
  }

  return {
    frontmatter: {
      title: parsed.title,
      badge: parsed.badge,
      description: typeof parsed.description === 'string' ? parsed.description : '',
    },
    body: match[2],
  }
}

/** Derive slug from file path: docs/processo/fases/fase1.md -> processo/fases/fase1 */
function deriveSlug(filePath: string, docsRoot: string): string {
  const relative = path.relative(docsRoot, filePath)
  return relative.replace(/\.md$/, '')
}

/** Derive parent_path from file path: docs/processo/fases/fase1.md -> processo/fases */
function deriveParentPath(filePath: string, docsRoot: string): string {
  const relative = path.relative(docsRoot, filePath)
  const dir = path.dirname(relative)
  return dir === '.' ? '' : dir
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const forceFlag = process.argv.includes('--force')

  // Resolve docs/ path relative to project root
  const projectRoot = path.resolve(import.meta.dirname, '..')
  const docsRoot = path.join(projectRoot, 'docs')

  if (!fs.existsSync(docsRoot)) {
    console.error(`docs/ directory not found at: ${docsRoot}`)
    process.exit(1)
  }

  // 1. Discover all .md files
  const mdFiles = collectMarkdownFiles(docsRoot).sort()
  console.log(`Found ${mdFiles.length} markdown files in docs/`)

  // 2. Parse each file into a DocumentRow
  const docs: DocumentRow[] = []
  const errors: string[] = []

  for (const filePath of mdFiles) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const parsed = parseFrontmatter(content)

    if (!parsed) {
      errors.push(`Failed to parse frontmatter: ${filePath}`)
      continue
    }

    const slug = deriveSlug(filePath, docsRoot)
    const parentPath = deriveParentPath(filePath, docsRoot)

    docs.push({
      title: parsed.frontmatter.title,
      badge: parsed.frontmatter.badge,
      description: parsed.frontmatter.description ?? '',
      slug,
      parent_path: parentPath,
      body: parsed.body,
      sort_order: 0, // placeholder, assigned below
    })
  }

  if (errors.length > 0) {
    console.error('Parse errors:')
    errors.forEach((e) => console.error(`  - ${e}`))
  }

  // 3. Assign sort_order: group by parent_path, index.md = 0, others alphabetical from 1
  const groups = new Map<string, DocumentRow[]>()
  for (const doc of docs) {
    const group = groups.get(doc.parent_path) ?? []
    group.push(doc)
    groups.set(doc.parent_path, group)
  }

  for (const [, group] of groups) {
    // Sort: index first, then alphabetical by slug
    group.sort((a, b) => {
      const aIsIndex = a.slug.endsWith('/index') || a.slug === 'index'
      const bIsIndex = b.slug.endsWith('/index') || b.slug === 'index'
      if (aIsIndex && !bIsIndex) return -1
      if (!aIsIndex && bIsIndex) return 1
      return a.slug.localeCompare(b.slug)
    })

    // Assign sort_order
    group.forEach((doc, idx) => {
      doc.sort_order = idx
    })
  }

  // 4. Force mode: delete all existing rows
  if (forceFlag) {
    console.log('--force flag detected: deleting all existing documents...')
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (deleteError) {
      console.error('Failed to delete existing documents:', deleteError.message)
      process.exit(1)
    }
    console.log('Existing documents deleted.')
  }

  // 5. Upsert in batches of 20
  const BATCH_SIZE = 20
  let insertedCount = 0
  const batchErrors: string[] = []

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('documents')
      .upsert(batch, { onConflict: 'slug' })

    if (error) {
      batchErrors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`)
    } else {
      insertedCount += batch.length
    }
  }

  // 6. Verification queries
  const { count: totalCount } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })

  const { count: customTagCount } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .like('body', '%{%')

  console.log(`\nSeeded: ${insertedCount}/${docs.length} documents (${customTagCount ?? 0} with custom tags)`)
  console.log(`Total in database: ${totalCount ?? 0}`)

  if (batchErrors.length > 0) {
    console.error('\nBatch errors:')
    batchErrors.forEach((e) => console.error(`  - ${e}`))
    process.exit(1)
  }

  if (errors.length > 0) {
    process.exit(1)
  }

  console.log('\nSeed complete.')
}

main().catch((err: unknown) => {
  console.error('Seed script failed:', err)
  process.exit(1)
})
