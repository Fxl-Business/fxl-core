/**
 * Sync-up: Import all local .md files from docs/ into Supabase documents table.
 *
 * Reads all .md files recursively, extracts frontmatter, and upserts
 * into the `documents` table using slug as conflict key.
 *
 * NOT a Vite module -- uses process.env, not import.meta.env.
 *
 * Usage:
 *   npx tsx --env-file .env.local tools/sync/sync-up.ts
 */

import { createClient } from '@supabase/supabase-js'
import { parse as yamlParse } from 'yaml'
import * as fs from 'node:fs'
import * as path from 'node:path'

// ---------------------------------------------------------------------------
// Supabase client (standalone -- NOT importing @/lib/supabase)
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.\n' +
    'Run with: npx tsx --env-file .env.local tools/sync/sync-up.ts'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Frontmatter = {
  title?: string
  badge?: string
  description?: string
}

type DocumentUpsert = {
  title: string
  badge: string
  description: string
  slug: string
  parent_path: string
  body: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively collect all .md file paths under a directory */
function collectMdFiles(dir: string): string[] {
  const results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectMdFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath)
    }
  }
  return results
}

/** Extract frontmatter and body from raw markdown content */
function extractFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { frontmatter: {}, body: raw }
  return {
    frontmatter: yamlParse(match[1]) as Frontmatter,
    body: match[2],
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function syncUp(): Promise<void> {
  const DOCS_DIR = path.resolve(process.cwd(), 'docs')

  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`docs/ directory not found at: ${DOCS_DIR}`)
    process.exit(1)
  }

  const mdFiles = collectMdFiles(DOCS_DIR).sort()

  if (mdFiles.length === 0) {
    console.log('No .md files found in docs/')
    return
  }

  console.log(`Found ${mdFiles.length} markdown files in docs/`)

  // Build upsert records
  const records: DocumentUpsert[] = []

  for (const filePath of mdFiles) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const { frontmatter, body } = extractFrontmatter(content)

    // Derive slug: relative path without .md extension
    const relativePath = path.relative(DOCS_DIR, filePath)
    const slug = relativePath.replace(/\.md$/, '').split(path.sep).join('/')

    // Derive parent_path: directory portion of slug
    const slugParts = slug.split('/')
    const parentPath = slugParts.length > 1 ? slugParts.slice(0, -1).join('/') : ''

    records.push({
      title: frontmatter.title || path.basename(filePath, '.md'),
      badge: frontmatter.badge || '',
      description: frontmatter.description || '',
      slug,
      parent_path: parentPath,
      body,
      updated_at: new Date().toISOString(),
    })
  }

  // Upsert one at a time for clear error reporting
  let successCount = 0
  let errorCount = 0

  for (const record of records) {
    const { error } = await supabase
      .from('documents')
      .upsert(record, { onConflict: 'slug' })

    if (error) {
      console.error(`Error upserting "${record.slug}": ${error.message}`)
      errorCount++
    } else {
      successCount++
    }
  }

  console.log(`\nSynced ${successCount} documents to Supabase (${errorCount} errors)`)

  if (errorCount > 0) {
    process.exit(1)
  }
}

syncUp().catch((err: unknown) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
