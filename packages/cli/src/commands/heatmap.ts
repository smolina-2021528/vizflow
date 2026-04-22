// ─── /heatmap wizard ─────────────────────────────────────────────

import { input } from '@inquirer/prompts'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

// ─── Types ────────────────────────────────────────────────────────

interface HeatmapData {
  rowLabels: string[]
  colLabels: string[]
  values: number[][]
}

// ─── HTML builder ─────────────────────────────────────────────────

function buildHeatmapHtml(data: HeatmapData, title: string): string {
  const allValues = data.values.flat()
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)

  function toColor(value: number): string {
    const ratio = max === min ? 0.5 : (value - min) / (max - min)
    // cold = 220deg (blue), hot = 0deg (red)
    const hue = Math.round((1 - ratio) * 220)
    const lightness = Math.round(90 - ratio * 40)
    return `hsl(${hue}, 70%, ${lightness}%)`
  }

  const headerCells = data.colLabels.map(col => `<th>${col}</th>`).join('')

  const bodyRows = data.rowLabels
    .map((rowLabel, rIdx) => {
      const cells = data.colLabels
        .map((_, cIdx) => {
          const val = data.values[rIdx]?.[cIdx] ?? 0
          const bg = toColor(val)
          return `<td style="background:${bg}">${val}</td>`
        })
        .join('')
      return `<tr><th>${rowLabel}</th>${cells}</tr>`
    })
    .join('\n      ')

  return `
<div class="vf-heatmap-wrapper">
  <h2 class="vf-heatmap-title">${title}</h2>
  <div style="overflow-x:auto">
    <table class="vf-heatmap">
      <thead>
        <tr><th></th>${headerCells}</tr>
      </thead>
      <tbody>
      ${bodyRows}
      </tbody>
    </table>
  </div>
</div>
<style>
.vf-heatmap-wrapper {
  font-family: var(--vf-font, system-ui, sans-serif);
  background: var(--vf-background, #ffffff);
  padding: 24px;
  border-radius: var(--vf-radius, 8px);
  display: inline-block;
}
.vf-heatmap-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vf-text, #111827);
  margin: 0 0 16px 0;
}
.vf-heatmap {
  border-collapse: collapse;
  font-size: 0.85rem;
}
.vf-heatmap th {
  padding: 8px 12px;
  color: var(--vf-text, #111827);
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}
.vf-heatmap td {
  padding: 10px 16px;
  text-align: center;
  font-weight: 500;
  color: #1f2937;
  border: 1px solid var(--vf-border, #e5e7eb);
  min-width: 48px;
  transition: opacity 0.15s;
}
.vf-heatmap td:hover { opacity: 0.8; }
</style>
  `.trim()
}

// ─── HTML file writer ─────────────────────────────────────────────

function writeHtml(filename: string, content: string, theme: string): void {
  const themeStyle =
    theme === 'dark'
      ? `<style>:root{--vf-background:#1f2937;--vf-text:#f9fafb;--vf-border:#374151;--vf-radius:8px;--vf-font:system-ui,sans-serif}</style>`
      : `<style>:root{--vf-background:#ffffff;--vf-text:#111827;--vf-border:#e5e7eb;--vf-radius:8px;--vf-font:system-ui,sans-serif}</style>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VizFlow Heatmap</title>
  ${themeStyle}
</head>
<body style="padding:32px;background:var(--vf-background)">
  ${content}
</body>
</html>`

  const outPath = resolve(process.cwd(), filename)
  writeFileSync(outPath, html, 'utf-8')
  console.log(`\n✅ Heatmap saved to: ${outPath}\n`)
}

// ─── Data collector ───────────────────────────────────────────────

async function collectHeatmapData(): Promise<HeatmapData> {
  const colRaw = await input({
    message: 'Column labels (comma-separated):',
    default: 'Mon,Tue,Wed,Thu,Fri',
  })
  const colLabels = colRaw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const rowLabels: string[] = []
  const values: number[][] = []

  console.log('\nEnter row data. Leave row name empty to finish.\n')

  while (true) {
    const rowLabel = await input({ message: '  Row label:' })
    if (rowLabel.trim() === '') break

    const valRaw = await input({
      message: `  Values for "${rowLabel}" (${colLabels.length} numbers, comma-separated):`,
    })

    const rowValues = valRaw
      .split(',')
      .map(s => parseFloat(s.trim()))
      .map(n => (isNaN(n) ? 0 : n))

    // Pad or trim to match column count
    while (rowValues.length < colLabels.length) rowValues.push(0)
    rowValues.length = colLabels.length

    rowLabels.push(rowLabel)
    values.push(rowValues)
  }

  return { rowLabels, colLabels, values }
}

// ─── Wizard entry point ───────────────────────────────────────────

export async function run(): Promise<void> {
  console.log('\n🌡 Heatmap Wizard\n')

  const title = await input({
    message: 'Heatmap title?',
    default: 'My Heatmap',
  })

  const data = await collectHeatmapData()

  if (data.rowLabels.length === 0) {
    console.log('\n⚠ No data entered — aborting.\n')
    return
  }

  const theme = await input({
    message: 'Theme? (light / dark)',
    default: 'light',
  })

  const filename = await input({
    message: 'Output filename?',
    default: 'heatmap.html',
  })

  const content = buildHeatmapHtml(data, title)
  writeHtml(filename, content, theme)
}
