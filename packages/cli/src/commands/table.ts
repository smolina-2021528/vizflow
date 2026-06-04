// ─── /table wizard ───────────────────────────────────────────────

import { confirm, input, select } from '@inquirer/prompts'
import { readFileSync } from 'fs'
import { resolve } from 'path'

import {
  parseCsv,
  parseJson,
  table,
  toHtmlFile,
} from '@smolina-dev/vizflow-core'
import type {
  ColumnDef,
  DataRow,
  TableConfig,
  TableDensity,
  ValueFormatOptions,
} from '@smolina-dev/vizflow-core'
import type { BuiltInThemeName } from '@smolina-dev/vizflow-core'

import {
  parseNonNegativeIntegerOrDefault,
  parseTableCell,
} from '../utils/number.js'
import { writeOutputFile } from '../utils/output.js'

// ─── Choices ──────────────────────────────────────────────────────

const themeChoices: { name: string; value: BuiltInThemeName }[] = [
  { name: 'Light — clean default', value: 'light' },
  { name: 'Dark — dark dashboard', value: 'dark' },
  { name: 'Hot — warm red/orange', value: 'hot' },
  { name: 'Cold — cool blue/cyan', value: 'cold' },
  { name: 'Corporate — professional blue/gray', value: 'corporate' },
  { name: 'Emerald — growth-focused green', value: 'emerald' },
  { name: 'Midnight — premium dark', value: 'midnight' },
  { name: 'Sunset — warm presentation style', value: 'sunset' },
]

type CliDataSource = 'manual' | 'csv' | 'json'
type CliFormatType = 'none' | 'number' | 'currency' | 'percent' | 'compact'

// ─── Shared helpers ───────────────────────────────────────────────

function optionalText(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function toTitleLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase())
}

function inferAlignment(rows: DataRow[], key: string): ColumnDef['align'] {
  const firstValue = rows.find(row => row[key] !== null && row[key] !== undefined)?.[
    key
  ]

  return typeof firstValue === 'number' ? 'right' : 'left'
}

async function collectValueFormat(): Promise<ValueFormatOptions | undefined> {
  const type = await select<CliFormatType>({
    message: 'Column format?',
    choices: [
      { name: 'None', value: 'none' },
      { name: 'Number', value: 'number' },
      { name: 'Currency', value: 'currency' },
      { name: 'Percent', value: 'percent' },
      { name: 'Compact number', value: 'compact' },
    ],
  })

  if (type === 'none') {
    return undefined
  }

  const locale = await input({
    message: 'Locale?',
    default: 'en-US',
  })

  const maximumFractionDigitsRaw = await input({
    message: 'Maximum fraction digits?',
    default: type === 'currency' ? '0' : '1',
  })

  const maximumFractionDigits = Number(maximumFractionDigitsRaw)

  if (type === 'currency') {
    const currency = await input({
      message: 'Currency code?',
      default: 'USD',
    })

    return {
      type,
      locale,
      currency,
      maximumFractionDigits: Number.isFinite(maximumFractionDigits)
        ? maximumFractionDigits
        : undefined,
    }
  }

  return {
    type,
    locale,
    maximumFractionDigits: Number.isFinite(maximumFractionDigits)
      ? maximumFractionDigits
      : undefined,
  }
}

// ─── Data loaders ─────────────────────────────────────────────────

async function collectCsvRows(): Promise<DataRow[]> {
  const filePath = await input({
    message: 'Path to CSV file:',
    default: './data.csv',
  })

  const absolutePath = resolve(process.cwd(), filePath)

  try {
    const raw = readFileSync(absolutePath, 'utf-8')
    const rows = parseCsv(raw)
    console.log(`\n✅ Loaded ${rows.length} rows from ${absolutePath}\n`)
    return rows
  } catch (err) {
    console.error(`\n❌ Could not read file: ${absolutePath}\n`)
    throw err
  }
}

async function collectJsonRows(): Promise<DataRow[]> {
  const filePath = await input({
    message: 'Path to JSON file:',
    default: './data.json',
  })

  const absolutePath = resolve(process.cwd(), filePath)

  try {
    const raw = readFileSync(absolutePath, 'utf-8')
    const rows = parseJson(raw)
    console.log(`\n✅ Loaded ${rows.length} rows from ${absolutePath}\n`)
    return rows
  } catch (err) {
    console.error(`\n❌ Could not read file: ${absolutePath}\n`)
    throw err
  }
}

// ─── Column builder ───────────────────────────────────────────────

async function collectColumnOptions(
  key: string,
  defaultLabel: string,
  defaultAlign: ColumnDef['align'] = 'left'
): Promise<ColumnDef> {
  const label = await input({
    message: `Label for "${key}"?`,
    default: defaultLabel,
  })

  const sortable = await confirm({
    message: `Make "${label}" sortable?`,
    default: true,
  })

  const align = await select<NonNullable<ColumnDef['align']>>({
    message: `Alignment for "${label}"?`,
    choices: [
      { name: 'Left', value: 'left' },
      { name: 'Center', value: 'center' },
      { name: 'Right', value: 'right' },
    ],
    default: defaultAlign ?? 'left',
  })

  const useFormat = await confirm({
    message: `Apply numeric format to "${label}"?`,
    default: align === 'right',
  })

  const format = useFormat ? await collectValueFormat() : undefined

  const widthRaw = await input({
    message: `Width for "${label}"? (leave blank for auto)`,
    default: '',
  })

  return {
    key,
    label,
    sortable,
    align,
    format,
    width: optionalText(widthRaw),
  }
}

async function collectManualColumns(): Promise<ColumnDef[]> {
  const columns: ColumnDef[] = []
  console.log('\nDefine your columns. Type "done" as key to finish.\n')

  while (true) {
    const key = await input({ message: '  Column key:' })
    if (key.trim().toLowerCase() === 'done') break

    const column = await collectColumnOptions(key, toTitleLabel(key))
    columns.push(column)
  }

  return columns
}

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

      row[col.key] = parseTableCell(raw)
      isFirst = false
    }

    if (abort) break
    rows.push(row)
  }

  return rows
}

async function inferColumnsFromRows(rows: DataRow[]): Promise<ColumnDef[]> {
  const keys = Object.keys(rows[0] ?? {})

  if (keys.length === 0) {
    return []
  }

  const customize = await confirm({
    message: 'Customize inferred columns?',
    default: true,
  })

  if (!customize) {
    return keys.map(key => ({
      key,
      label: toTitleLabel(key),
      sortable: true,
      align: inferAlignment(rows, key),
    }))
  }

  const columns: ColumnDef[] = []

  for (const key of keys) {
    const include = await confirm({
      message: `Include column "${key}"?`,
      default: true,
    })

    if (!include) {
      continue
    }

    columns.push(
      await collectColumnOptions(key, toTitleLabel(key), inferAlignment(rows, key))
    )
  }

  return columns
}

// ─── Wizard entry point ───────────────────────────────────────────

export async function run(): Promise<void> {
  console.log('\n📋 Table Wizard\n')

  const titleRaw = await input({
    message: 'Table title?',
    default: 'My Table',
  })

  const subtitleRaw = await input({
    message: 'Table subtitle? (leave blank to skip)',
    default: '',
  })

  const sourceType = await select<CliDataSource>({
    message: 'Data source?',
    choices: [
      { name: 'Manual entry', value: 'manual' },
      { name: 'CSV file', value: 'csv' },
      { name: 'JSON file', value: 'json' },
    ],
  })

  let columns: ColumnDef[]
  let rows: DataRow[]

  if (sourceType === 'manual') {
    columns = await collectManualColumns()

    if (columns.length === 0) {
      console.log('\n⚠ No columns defined — aborting.\n')
      return
    }

    rows = await collectRows(columns)
  } else {
    rows = sourceType === 'csv' ? await collectCsvRows() : await collectJsonRows()

    if (rows.length === 0) {
      console.log('\n⚠ No data loaded — aborting.\n')
      return
    }

    columns = await inferColumnsFromRows(rows)
  }

  if (columns.length === 0) {
    console.log('\n⚠ No columns available — aborting.\n')
    return
  }

  if (rows.length === 0) {
    console.log('\n⚠ No data entered — aborting.\n')
    return
  }

  const pageSizeRaw = await input({
    message: 'Rows per page? (0 to disable pagination)',
    default: '10',
  })

  const pageSize = parseNonNegativeIntegerOrDefault(pageSizeRaw, 10)

  const searchable = await confirm({
    message: 'Enable search?',
    default: true,
  })

  const density = await select<TableDensity>({
    message: 'Table density?',
    choices: [
      { name: 'Comfortable', value: 'comfortable' },
      { name: 'Compact', value: 'compact' },
    ],
    default: 'comfortable',
  })

  const theme = await select<BuiltInThemeName>({
    message: 'Theme?',
    choices: themeChoices,
  })

  const filename = await input({
    message: 'Output filename?',
    default: 'table.html',
  })

  const config: TableConfig = {
    title: optionalText(titleRaw),
    subtitle: optionalText(subtitleRaw),
    columns,
    data: { kind: 'inline', rows },
  }

  const output = table(config, {
    pageSize,
    searchable,
    density,
  })

  const html = toHtmlFile(output, {
    title: 'VizFlow Table',
    theme,
    includeChartJs: false,
  })

  await writeOutputFile(filename, html, 'Table')
}