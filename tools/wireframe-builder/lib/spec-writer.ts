/**
 * Product Spec Writer -- orchestrates the full generation pipeline:
 * validateConfig -> resolveConfig -> generateProductSpec -> write files to disk.
 *
 * This is the top-level entry point for generating a complete product spec
 * from client configuration files.
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { BlueprintConfig } from '../types/blueprint'
import type { BrandingConfig } from '../types/branding'
import type { TechnicalConfig } from '../types/technical'
import { validateConfig, type ValidationResult } from './config-validator'
import { resolveConfig } from './config-resolver'
import { generateProductSpec, type SpecFile } from './spec-generator'

// ─── Public types ────────────────────────────────────────────────────────

export type WriteResult = {
  success: boolean
  files: string[]
  validation: ValidationResult
  specFiles?: SpecFile[]
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Run the full generation pipeline and write product spec files to disk.
 *
 * Pipeline:
 * 1. Validate configs (slug match, binding coverage, reference integrity)
 * 2. Resolve into GenerationManifest (merge blueprint + technical + branding)
 * 3. Generate product spec (6 self-contained files)
 * 4. Write files to outputDir
 *
 * @param blueprint - Client blueprint configuration
 * @param technical - Client technical configuration
 * @param branding - Optional branding overrides (defaults applied if undefined)
 * @param outputDir - Directory to write spec files to (created if missing)
 * @returns WriteResult with success status, file paths, and validation details
 */
export function writeProductSpec(
  blueprint: BlueprintConfig,
  technical: TechnicalConfig,
  branding: Partial<BrandingConfig> | undefined,
  outputDir: string,
): WriteResult {
  // 1. Validate configs
  const validation = validateConfig(blueprint, technical)
  if (!validation.valid) {
    return { success: false, files: [], validation }
  }

  // 2. Resolve into GenerationManifest
  const manifest = resolveConfig(blueprint, technical, branding)

  // 3. Generate product spec files
  const specFiles = generateProductSpec(manifest)

  // 4. Write to disk
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const writtenFiles: string[] = []
  for (const file of specFiles) {
    const filePath = join(outputDir, file.filename)
    writeFileSync(filePath, file.content, 'utf-8')
    writtenFiles.push(filePath)
  }

  return { success: true, files: writtenFiles, validation, specFiles }
}
