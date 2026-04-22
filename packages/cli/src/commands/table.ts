// ─── /table wizard ───────────────────────────────────────────────

import { input } from '@inquirer/prompts'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

import { table } from '@vizflow/core'
import type { TableConfig, ColumnDef, DataRow } from '@vizflow/core'

// ─── Column builder ───────────────────────────────────────────────

async function collectColumns(): Promise<ColumnDef[]> {
  const columns: ColumnDef[] = []
  console.log('\nDefine your columns. Type "done" as key to finish.\n')

  while (true) {
    const key = await input({ message: '  Column key:' })
    if (key.toLowerCase() === 'done') break

    const label = await input({
      message: '  Column label:',
      default: key,
    })

    columns.push({ key, label })
  }

  return columns
}

// ─── Row builder ──────────────────────────────────────────────────

async function collectRows(columns: ColumnDef[]): Promise<DataRow[]> {
  const rows: DataRow[] = []
  console.log('\nEnter your data rows. Leave first field empty to finish.\n')

  while (true) {
    const row: DataRow = {}
    let isFirst = true
    let abort = false

    for (const col of columns) {
      const raw = await input({ message: `  ${col.label}:` })

      if (isFirst && raw.trim() === '') {
        abort = true
        break
      }

      const num = parseFloat(raw)
      row[col.key] = isNaN(num) ? raw : num
      isFirst = false
    }

    if (abort) break
    rows.push(row)
  }

  return rows
}

// ─── HTML file writer ─────────────────────────────────────────────

function writeHtml(filename: string, rendered: string, theme: string): void {
  const themeStyle =
    theme === 'dark'
      ? `<style>:root{--vf-primary:#818cf8;--vf-on-primary:#1e1b4b;--vf-background:#1f2937;--vf-text:#f9fafb;--vf-border:#374151;--vf-row-alt:#273244;--vf-row-hover:#312e81;--vf-radius:8px;--vf-font:system-ui,sans-serif}</style>`
      : `<style>:root{--vf-primary:#6366f1;--vf-on-primary:#ffffff;--vf-background:#ffffff;--vf-text:#111827;--vf-border:#e5e7eb;--vf-row-alt:#f5f5f5;--vf-row-hover:#ede9fe;--vf-radius:8px;--vf-font:system-ui,sans-serif}</style>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VizFlow Table</title>
  ${themeStyle}
</head>
<body style="padding:32px;background:var(--vf-background)">
  ${rendered}
</body>
</html>`

  const outPath = resolve(process.cwd(), filename)
  writeFileSync(outPath, html, 'utf-8')
  console.log(`\n✅ Table saved to: ${outPath}\n`)
}

// ─── Wizard entry point ───────────────────────────────────────────

export async function run(): Promise<void> {
  console.log('\n📋 Table Wizard\n')

  const columns = await collectColumns()

  if (columns.length === 0) {
    console.log('\n⚠ No columns defined — aborting.\n')
    return
  }

  const rows = await collectRows(columns)

  if (rows.length === 0) {
    console.log('\n⚠ No data entered — aborting.\n')
    return
  }

  const pageSizeRaw = await input({
    message: 'Rows per page? (0 to disable pagination)',
    default: '10',
  })
  const pageSize = parseInt(pageSizeRaw) || 10

  const theme = await input({
    message: 'Theme? (light / dark)',
    default: 'light',
  })

  const filename = await input({
    message: 'Output filename?',
    default: 'table.html',
  })

  const config: TableConfig = {
    columns,
    data: { kind: 'inline', rows },
  }

  const rendered = table(config, { pageSize }).render()
  writeHtml(filename, rendered, theme)
}
