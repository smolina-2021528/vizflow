// ─── /chart wizard ───────────────────────────────────────────────

import { select, input } from '@inquirer/prompts'
import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

import {
  barChart,
  lineChart,
  pieChart,
  scatterChart,
  parseCsv,
  parseJson,
  toHtmlFile,
} from '@smolina-dev/vizflow-core'
import type {
  ChartConfig,
  DataRow,
  VizFlowOutput,
} from '@smolina-dev/vizflow-core'
import type { BuiltInThemeName } from '@smolina-dev/vizflow-core'
import { parseFiniteNumber } from '../utils/number.js'

const themeChoices: { name: string; value: BuiltInThemeName }[] = [
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'Hot', value: 'hot' },
  { name: 'Cold', value: 'cold' },
]

type ChartType = 'bar' | 'line' | 'pie' | 'scatter'
type DataSource = 'manual' | 'csv' | 'json'

// ─── Manual data entry ────────────────────────────────────────────

async function collectManualRows(
  xKey: string,
  yKey: string,
  numericX: boolean = false
): Promise<DataRow[]> {
  const rows: DataRow[] = []
  console.log('\nEnter your data rows. Type "done" as label to finish.\n')

  while (true) {
    const rawX = await input({ message: `  ${xKey}:` })
    if (rawX.trim().toLowerCase() === 'done') break

    const rawY = await input({ message: `  ${yKey}:` })
    const valueY = parseFiniteNumber(rawY)

    if (valueY === null) {
      console.log('  ⚠ Y must be a finite number — skipping row.')
      continue
    }

    if (numericX) {
      const valueX = parseFiniteNumber(rawX)

      if (valueX === null) {
        console.log('  ⚠ X must be a finite number — skipping row.')
        continue
      }

      rows.push({ [xKey]: valueX, [yKey]: valueY })
    } else {
      rows.push({ [xKey]: rawX, [yKey]: valueY })
    }
  }

  return rows
}

// ─── CSV data entry ───────────────────────────────────────────────

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

// ─── JSON data entry ──────────────────────────────────────────────

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

// ─── HTML file writer ─────────────────────────────────────────────

function writeHtml(
  filename: string,
  output: VizFlowOutput,
  theme: BuiltInThemeName
): void {
  const html = toHtmlFile(output, {
    title: 'VizFlow Chart',
    theme,
    includeChartJs: true,
  })

  const outPath = resolve(process.cwd(), filename)
  writeFileSync(outPath, html, 'utf-8')
  console.log(`\n✅ Chart saved to: ${outPath}\n`)
}

// ─── Generator selector ───────────────────────────────────────────

function generate(type: ChartType, config: ChartConfig): VizFlowOutput {
  switch (type) {
    case 'bar':
      return barChart(config)
    case 'line':
      return lineChart(config)
    case 'pie':
      return pieChart(config)
    case 'scatter':
      return scatterChart(config)
  }
}

// ─── Wizard entry point ───────────────────────────────────────────

export async function run(): Promise<void> {
  console.log('\n📊 Chart Wizard\n')

  const type = await select<ChartType>({
    message: 'Chart type?',
    choices: [
      { name: 'Bar', value: 'bar' },
      { name: 'Line', value: 'line' },
      { name: 'Pie', value: 'pie' },
      { name: 'Scatter', value: 'scatter' },
    ],
  })

  const title = await input({
    message: 'Chart title?',
    default: 'My Chart',
  })

  const xKey = await input({
    message: 'X axis key (label column)?',
    default: 'label',
  })

  const yKey = await input({
    message: 'Y axis key (value column)?',
    default: 'value',
  })

  const sourceType = await select<DataSource>({
    message: 'Data source?',
    choices: [
      { name: 'Manual entry', value: 'manual' },
      { name: 'CSV file', value: 'csv' },
      { name: 'JSON file', value: 'json' },
    ],
  })

  let rows: DataRow[]

  if (sourceType === 'csv') {
    rows = await collectCsvRows()
  } else if (sourceType === 'json') {
    rows = await collectJsonRows()
  } else {
    rows = await collectManualRows(xKey, yKey, type === 'scatter')
  }

  if (rows.length === 0) {
    console.log('\n⚠ No data entered — aborting.\n')
    return
  }

  const theme = await select<BuiltInThemeName>({
    message: 'Theme?',
    choices: themeChoices,
  })

  const filename = await input({
    message: 'Output filename?',
    default: 'chart.html',
  })

  const config: ChartConfig = {
    type,
    title,
    xKey,
    yKey,
    data: { kind: 'inline', rows },
  }

  const output = generate(type, config)
  writeHtml(filename, output, theme)
}