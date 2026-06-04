// ─── /chart wizard ───────────────────────────────────────────────

import { confirm, input, select } from '@inquirer/prompts'
import { readFileSync } from 'fs'
import { resolve } from 'path'

import {
  areaChart,
  barChart,
  doughnutChart,
  horizontalBarChart,
  lineChart,
  parseCsv,
  parseJson,
  pieChart,
  scatterChart,
  toHtmlFile,
} from '@smolina-dev/vizflow-core'
import type {
  ChartAppearance,
  ChartConfig,
  DataRow,
  ValueFormatOptions,
  VizFlowOutput,
} from '@smolina-dev/vizflow-core'
import type {
  AreaChartOptions,
  BuiltInThemeName,
  DoughnutChartOptions,
  HorizontalBarChartOptions,
  LineChartOptions,
  PieChartOptions,
  ScatterChartOptions,
} from '@smolina-dev/vizflow-core'

import { parseFiniteNumber } from '../utils/number.js'
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

type CliChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'scatter'
  | 'area'
  | 'horizontalBar'
  | 'doughnut'

type CliDataSource = 'manual' | 'csv' | 'json'
type CliFormatType = 'none' | 'number' | 'currency' | 'percent' | 'compact'

// ─── Shared prompt helpers ────────────────────────────────────────

function optionalText(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function parseOptionalFiniteNumber(value: string): number | undefined {
  const parsed = parseFiniteNumber(value)
  return parsed === null ? undefined : parsed
}

async function collectSubtitle(): Promise<string | undefined> {
  const subtitle = await input({
    message: 'Subtitle? (leave blank to skip)',
    default: '',
  })

  return optionalText(subtitle)
}

async function collectAppearance(): Promise<ChartAppearance> {
  const card = await confirm({
    message: 'Render inside a visual card?',
    default: true,
  })

  if (!card) {
    return { card: false }
  }

  const shadow = await confirm({
    message: 'Add card shadow?',
    default: true,
  })

  const rounded = await select<NonNullable<ChartAppearance['rounded']>>({
    message: 'Card radius?',
    choices: [
      { name: 'Small', value: 'sm' },
      { name: 'Medium', value: 'md' },
      { name: 'Large', value: 'lg' },
      { name: 'Extra large', value: 'xl' },
      { name: 'None', value: 'none' },
    ],
    default: 'lg',
  })

  return { card, shadow, rounded }
}

async function collectValueFormat(): Promise<ValueFormatOptions | undefined> {
  const type = await select<CliFormatType>({
    message: 'Value format?',
    choices: [
      { name: 'None / default number', value: 'none' },
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

  const maximumFractionDigits = parseOptionalFiniteNumber(
    maximumFractionDigitsRaw
  )

  if (type === 'currency') {
    const currency = await input({
      message: 'Currency code?',
      default: 'USD',
    })

    return {
      type,
      locale,
      currency,
      maximumFractionDigits,
    }
  }

  return {
    type,
    locale,
    maximumFractionDigits,
  }
}

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

// ─── Chart-specific options ───────────────────────────────────────

async function collectLineOptions(): Promise<LineChartOptions> {
  const fill = await confirm({
    message: 'Fill area below line?',
    default: false,
  })

  const showPoints = await confirm({
    message: 'Show data points?',
    default: true,
  })

  const tensionRaw = await input({
    message: 'Line smoothness / tension? (0 to 1)',
    default: '0.3',
  })

  return {
    fill,
    showPoints,
    tension: parseOptionalFiniteNumber(tensionRaw),
  }
}

async function collectAreaOptions(): Promise<AreaChartOptions> {
  const showPoints = await confirm({
    message: 'Show data points?',
    default: true,
  })

  const tensionRaw = await input({
    message: 'Line smoothness / tension? (0 to 1)',
    default: '0.35',
  })

  const gradientOpacityRaw = await input({
    message: 'Gradient opacity? (0 to 1)',
    default: '0.28',
  })

  return {
    showPoints,
    tension: parseOptionalFiniteNumber(tensionRaw),
    gradientOpacity: parseOptionalFiniteNumber(gradientOpacityRaw),
  }
}

async function collectPieOptions(): Promise<PieChartOptions> {
  const showPercentages = await confirm({
    message: 'Show percentages in tooltips?',
    default: true,
  })

  return {
    showPercentages,
  }
}

async function collectDoughnutOptions(): Promise<DoughnutChartOptions> {
  const showPercentages = await confirm({
    message: 'Show percentages in tooltips?',
    default: true,
  })

  const cutoutPercentRaw = await input({
    message: 'Doughnut cutout percentage?',
    default: '65',
  })

  return {
    showPercentages,
    cutoutPercent: parseOptionalFiniteNumber(cutoutPercentRaw),
  }
}

async function collectHorizontalBarOptions(): Promise<HorizontalBarChartOptions> {
  const barThicknessRaw = await input({
    message: 'Bar thickness?',
    default: '28',
  })

  const borderRadiusRaw = await input({
    message: 'Bar border radius?',
    default: '8',
  })

  return {
    barThickness: parseOptionalFiniteNumber(barThicknessRaw),
    borderRadius: parseOptionalFiniteNumber(borderRadiusRaw),
  }
}

async function collectScatterOptions(
  xKey: string,
  yKey: string
): Promise<ScatterChartOptions> {
  const pointRadiusRaw = await input({
    message: 'Point radius?',
    default: '5',
  })

  const xAxisLabel = await input({
    message: 'X axis label?',
    default: xKey,
  })

  const yAxisLabel = await input({
    message: 'Y axis label?',
    default: yKey,
  })

  return {
    pointRadius: parseOptionalFiniteNumber(pointRadiusRaw),
    xAxisLabel,
    yAxisLabel,
  }
}

// ─── Generator selector ───────────────────────────────────────────

async function generate(
  type: CliChartType,
  config: ChartConfig
): Promise<VizFlowOutput> {
  switch (type) {
    case 'bar':
      return barChart(config)

    case 'line':
      return lineChart(config, await collectLineOptions())

    case 'pie':
      return pieChart(config, await collectPieOptions())

    case 'scatter':
      return scatterChart(
        config,
        await collectScatterOptions(config.xKey, config.yKey)
      )

    case 'area':
      return areaChart(config, await collectAreaOptions())

    case 'horizontalBar':
      return horizontalBarChart(config, await collectHorizontalBarOptions())

    case 'doughnut':
      return doughnutChart(config, await collectDoughnutOptions())
  }
}

// ─── Wizard entry point ───────────────────────────────────────────

export async function run(): Promise<void> {
  console.log('\n📊 Chart Wizard\n')

  const type = await select<CliChartType>({
    message: 'Chart type?',
    choices: [
      { name: 'Bar', value: 'bar' },
      { name: 'Line', value: 'line' },
      { name: 'Pie', value: 'pie' },
      { name: 'Scatter', value: 'scatter' },
      { name: 'Area', value: 'area' },
      { name: 'Horizontal Bar', value: 'horizontalBar' },
      { name: 'Doughnut', value: 'doughnut' },
    ],
  })

  const title = await input({
    message: 'Chart title?',
    default: 'My Chart',
  })

  const subtitle = await collectSubtitle()

  const xKey = await input({
    message: 'X axis key (label column)?',
    default: 'label',
  })

  const yKey = await input({
    message: 'Y axis key (value column)?',
    default: 'value',
  })

  const sourceType = await select<CliDataSource>({
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

  const valueFormat = await collectValueFormat()
  const appearance = await collectAppearance()

  const widthRaw = await input({
    message: 'Chart width?',
    default:
      type === 'pie' || type === 'doughnut'
        ? '520'
        : type === 'horizontalBar'
          ? '700'
          : '600',
  })

  const heightRaw = await input({
    message: 'Chart height?',
    default:
      type === 'pie' || type === 'doughnut'
        ? '420'
        : type === 'horizontalBar'
          ? '420'
          : '400',
  })

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
    subtitle,
    xKey,
    yKey,
    width: parseOptionalFiniteNumber(widthRaw),
    height: parseOptionalFiniteNumber(heightRaw),
    appearance,
    format: valueFormat
      ? {
          y: valueFormat,
          tooltip: valueFormat,
        }
      : undefined,
    data: { kind: 'inline', rows },
  }

  const output = await generate(type, config)

  const html = toHtmlFile(output, {
    title: 'VizFlow Chart',
    theme,
    includeChartJs: true,
  })

  await writeOutputFile(filename, html, 'Chart')
}