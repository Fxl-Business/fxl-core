/**
 * Sync-down: Export all documents from Supabase to local .md files.
 *
 * Reads all rows from the `documents` table, reconstructs .md files
 * with YAML frontmatter in the docs/ directory.
 *
 * NOT a Vite module -- uses process.env, not import.meta.env.
 *
 * Usage:
 *   npx tsx --env-file .env.local tools/sync/sync-down.ts
 */

import { createClient } from '@supabase/supabase-js'
import { stringify as yamlStringify } from 'yaml'
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
    'Run with: npx tsx --env-file .env.local tools/sync/sync-down.ts'
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function syncDown(): Promise<void> {
  const { data, error } = await supabase
    .from('documents')
    .select('title, badge, description, slug, parent_path, body, sort_order')
    .order('parent_path')
    .order('sort_order')

  if (error) {
    console.error('Failed to fetch documents:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('No documents found in Supabase.')
    return
  }

  const DOCS_DIR = path.resolve(process.cwd(), 'docs')

  for (const doc of data as DocumentRow[]) {
    const filePath = path.join(DOCS_DIR, doc.slug + '.md')

    // Create parent directory
    fs.mkdirSync(path.dirname(filePath), { recursive: true })

    // Build frontmatter object
    const frontmatter: Record<string, string> = {
      title: doc.title,
      badge: doc.badge,
    }
    if (doc.description && doc.description.length > 0) {
      frontmatter.description = doc.description
    }

    // Build file content
    const content = `---\n${yamlStringify(frontmatter).trim()}\n---\n${doc.body}`

    // Write file
    fs.writeFileSync(filePath, content, 'utf-8')
  }

  console.log(`Synced ${data.length} documents from Supabase to docs/`)
}

syncDown().catch((err: unknown) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
