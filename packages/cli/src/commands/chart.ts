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
} from '@vizflow/core'
import type { ChartConfig, DataRow } from '@vizflow/core'

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
    if (rawX.toLowerCase() === 'done') break

    const rawY = await input({ message: `  ${yKey}:` })
    const valueY = parseFloat(rawY)

    if (isNaN(valueY)) {
      console.log('  ⚠ Not a number — skipping row.')
      continue
    }

    if (numericX) {
      const valueX = parseFloat(rawX)
      if (isNaN(valueX)) {
        console.log('  ⚠ X is not a number — skipping row.')
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

function writeHtml(filename: string, rendered: string, theme: string): void {
  const themeStyle =
    theme === 'dark'
      ? `<style>:root{--vf-primary:#818cf8;--vf-on-primary:#1e1b4b;--vf-background:#1f2937;--vf-text:#f9fafb;--vf-border:#374151;--vf-radius:8px;--vf-font:system-ui,sans-serif}</style>`
      : `<style>:root{--vf-primary:#6366f1;--vf-on-primary:#ffffff;--vf-background:#ffffff;--vf-text:#111827;--vf-border:#e5e7eb;--vf-radius:8px;--vf-font:system-ui,sans-serif}</style>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VizFlow Chart</title>
  ${themeStyle}
</head>
<body style="padding:32px;background:var(--vf-background)">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"><\/script>
  ${rendered}
</body>
</html>`

  const outPath = resolve(process.cwd(), filename)
  writeFileSync(outPath, html, 'utf-8')
  console.log(`\n✅ Chart saved to: ${outPath}\n`)
}

// ─── Generator selector ───────────────────────────────────────────

function generate(type: ChartType, config: ChartConfig): string {
  switch (type) {
    case 'bar':
      return barChart(config).render()
    case 'line':
      return lineChart(config).render()
    case 'pie':
      return pieChart(config).render()
    case 'scatter':
      return scatterChart(config).render()
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

  const theme = await select<'light' | 'dark'>({
    message: 'Theme?',
    choices: [
      { name: 'Light', value: 'light' },
      { name: 'Dark', value: 'dark' },
    ],
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

  const rendered = generate(type, config)
  writeHtml(filename, rendered, theme)
}
