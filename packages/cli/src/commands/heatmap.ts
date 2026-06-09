// ─── /heatmap wizard ─────────────────────────────────────────────

import { confirm, input, select } from '@inquirer/prompts'

import { heatmap, toHtmlFile } from '@smolina-dev/vizflow-core'
import type {
  HeatmapColorScale,
  HeatmapConfig,
  HeatmapDensity,
} from '@smolina-dev/vizflow-core'
import type { BuiltInThemeName } from '@smolina-dev/vizflow-core'

import {
  parseFiniteNumber,
  parseFiniteNumberOrDefault,
} from '../utils/number.js'
import { writeOutputFile } from '../utils/output.js'
import { collectValueFormat, themeChoices } from '../utils/shared.js'

// ─── Helpers ──────────────────────────────────────────────────────

function optionalText(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function parseOptionalFiniteNumber(value: string): number | undefined {
  const parsed = parseFiniteNumber(value)
  return parsed === null ? undefined : parsed
}

async function collectHeatmapData(): Promise<
  Pick<HeatmapConfig, 'rows' | 'columns' | 'values'>
> {
  const colRaw = await input({
    message: 'Column labels (comma-separated):',
    default: 'Mon,Tue,Wed,Thu,Fri',
  })

  const columns = colRaw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const rows: string[] = []
  const values: number[][] = []

  console.log('\nEnter row data. Leave row name empty to finish.\n')

  while (true) {
    const rowLabel = await input({ message: '  Row label:' })
    if (rowLabel.trim() === '') break

    const valRaw = await input({
      message: `  Values for "${rowLabel}" (${columns.length} numbers, comma-separated):`,
    })

    const rowValues = valRaw
      .split(',')
      .map(s => parseFiniteNumberOrDefault(s, 0))

    while (rowValues.length < columns.length) rowValues.push(0)
    rowValues.length = columns.length

    rows.push(rowLabel)
    values.push(rowValues)
  }

  return { rows, columns, values }
}

// ─── Wizard entry point ───────────────────────────────────────────

export async function run(): Promise<void> {
  console.log('\n🌡 Heatmap Wizard\n')

  const title = await input({
    message: 'Heatmap title?',
    default: 'My Heatmap',
  })

  const subtitleRaw = await input({
    message: 'Heatmap subtitle? (leave blank to skip)',
    default: '',
  })

  const data = await collectHeatmapData()

  if (data.rows.length === 0) {
    console.log('\n⚠ No data entered — aborting.\n')
    return
  }

  if (data.columns.length === 0) {
    console.log('\n⚠ No columns defined — aborting.\n')
    return
  }

  const colorScale = await select<HeatmapColorScale>({
    message: 'Color scale?',
    choices: [
      { name: 'Blue', value: 'blue' },
      { name: 'Green', value: 'green' },
      { name: 'Purple', value: 'purple' },
      { name: 'Orange', value: 'orange' },
      { name: 'Gray', value: 'gray' },
    ],
    default: 'blue',
  })

  const density = await select<HeatmapDensity>({
    message: 'Heatmap density?',
    choices: [
      { name: 'Comfortable', value: 'comfortable' },
      { name: 'Compact', value: 'compact' },
    ],
    default: 'comfortable',
  })

  const showValues = await confirm({
    message: 'Show values inside cells?',
    default: true,
  })

  const valueFormat = await collectValueFormat({
    message: 'Cell value format?',
  })

  const minRaw = await input({
    message: 'Custom min value? (leave blank for automatic)',
    default: '',
  })

  const maxRaw = await input({
    message: 'Custom max value? (leave blank for automatic)',
    default: '',
  })

  const widthRaw = await input({
    message: 'Heatmap width?',
    default: '720',
  })

  const theme = await select<BuiltInThemeName>({
    message: 'Theme?',
    choices: themeChoices,
  })

  const filename = await input({
    message: 'Output filename?',
    default: 'heatmap.html',
  })

  const output = heatmap({
    title,
    subtitle: optionalText(subtitleRaw),
    rows: data.rows,
    columns: data.columns,
    values: data.values,
    colorScale,
    density,
    showValues,
    valueFormat,
    min: parseOptionalFiniteNumber(minRaw),
    max: parseOptionalFiniteNumber(maxRaw),
    width: parseOptionalFiniteNumber(widthRaw),
  })

  const html = toHtmlFile(output, {
    title: 'VizFlow Heatmap',
    theme,
    includeChartJs: false,
  })

  await writeOutputFile(filename, html, 'Heatmap')
}