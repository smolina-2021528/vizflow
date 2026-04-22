// ─── /chart wizard ───────────────────────────────────────────────

import { select, input } from '@inquirer/prompts'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

import { barChart, lineChart, pieChart, scatterChart } from '@vizflow/core'
import type { ChartConfig, DataRow } from '@vizflow/core'

type ChartType = 'bar' | 'line' | 'pie' | 'scatter'

// ─── Manual data entry ────────────────────────────────────────────

async function collectManualRows(
  xKey: string,
  yKey: string
): Promise<DataRow[]> {
  const rows: DataRow[] = []
  console.log('\nEnter your data rows. Type "done" as label to finish.\n')

  while (true) {
    const label = await input({ message: `  ${xKey}:` })
    if (label.toLowerCase() === 'done') break

    const raw = await input({ message: `  ${yKey}:` })
    const value = parseFloat(raw)

    if (isNaN(value)) {
      console.log('  ⚠ Not a number — skipping row.')
      continue
    }

    rows.push({ [xKey]: label, [yKey]: value })
  }

  return rows
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
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  ${themeStyle}
</head>
<body style="padding:32px;background:var(--vf-background)">
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

  const rows = await collectManualRows(xKey, yKey)

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
