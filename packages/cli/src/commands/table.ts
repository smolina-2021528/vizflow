// ─── /table wizard ───────────────────────────────────────────────

import { select, input } from '@inquirer/prompts'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

import { table, toHtmlFile } from '@vizflow/core'
import type { TableConfig, ColumnDef, DataRow } from '@vizflow/core'
import type { BuiltInThemeName } from '@vizflow/core'


const themeChoices: { name: string; value: BuiltInThemeName }[] = [
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'Hot', value: 'hot' },
  { name: 'Cold', value: 'cold' },
]
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

function writeHtml(
  filename: string,
  config: TableConfig,
  pageSize: number,
  theme: BuiltInThemeName
): void {
  const output = table(config, { pageSize })
  const html = toHtmlFile(output, {
    title: 'VizFlow Table',
    theme,
    includeChartJs: false,
  })

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
  
  const parsedPageSize = parseInt(pageSizeRaw, 10)
  const pageSize = Number.isNaN(parsedPageSize) ? 10 : parsedPageSize


  const theme = await select<BuiltInThemeName>({
  message: 'Theme?',
  choices: themeChoices,
  })

  const filename = await input({
    message: 'Output filename?',
    default: 'table.html',
  })

  const config: TableConfig = {
    columns,
    data: { kind: 'inline', rows },
  }

  writeHtml(filename, config, pageSize, theme)
}
