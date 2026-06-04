// ─── CLI output helpers ───────────────────────────────────────────

import { confirm } from '@inquirer/prompts'
import { existsSync, writeFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Writes an HTML file safely.
 * If the file already exists, the user must confirm before overwriting it.
 */
export async function writeOutputFile(
  filename: string,
  html: string,
  label: string
): Promise<void> {
  const outPath = resolve(process.cwd(), filename)

  if (existsSync(outPath)) {
    const overwrite = await confirm({
      message: `File already exists: ${outPath}. Overwrite?`,
      default: false,
    })

    if (!overwrite) {
      console.log('\n⚠ Output cancelled. No file was overwritten.\n')
      return
    }
  }

  writeFileSync(outPath, html, 'utf-8')
  console.log(`\n✅ ${label} saved to: ${outPath}\n`)
}