// ─── /chart wizard ───────────────────────────────────────────────

import { confirm, input, select } from '@inquirer/prompts'

import {
  areaChart,
  barChart,
  doughnutChart,
  horizontalBarChart,
  lineChart,
  pieChart,
  scatterChart,
  toHtmlFile,
} from '@smolina-dev/vizflow-core'
import type {
  ChartAppearance,
  ChartConfig,
  DataRow,
  SeriesChartConfig,
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

import { collectStructuredDataRows } from '../utils/data.js'
import { parseFiniteNumber } from '../utils/number.js'
import { writeOutputFile } from '../utils/output.js'
import { collectValueFormat, themeChoices } from '../utils/shared.js'

type CliChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'scatter'
  | 'area'
  | 'horizontalBar'
  | 'doughnut'

type CliDataSource = 'manual' | 'csv' | 'json'

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

// ─── Manual data entry ────────────────────────────────────────────

async function collectManualRows(
  xKey: string,
  yKeys: string[],
  numericX: boolean = false
): Promise<DataRow[]> {
  const rows: DataRow[] = []
  console.log('\nEnter your data rows. Type "done" as label to finish.\n')

  while (true) {
    const rawX = await input({ message: `  ${xKey}:` })
    if (rawX.trim().toLowerCase() === 'done') break

    const values: Record<string, number> = {}
    let invalidValue = false

    for (const yKey of yKeys) {
      const rawY = await input({ message: `  ${yKey}:` })
      const valueY = parseFiniteNumber(rawY)

      if (valueY === null) {
        console.log(`  ⚠ ${yKey} must be a finite number — skipping row.`)
        invalidValue = true
        break
      }

      values[yKey] = valueY
    }

    if (invalidValue) continue

    if (numericX) {
      const valueX = parseFiniteNumber(rawX)

      if (valueX === null) {
        console.log('  ⚠ X must be a finite number — skipping row.')
        continue
      }

      rows.push({ [xKey]: valueX, ...values })
    } else {
      rows.push({ [xKey]: rawX, ...values })
    }
  }

  return rows
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
  config: ChartConfig | SeriesChartConfig
): Promise<VizFlowOutput> {
  switch (type) {
    case 'bar':
      return barChart(config as SeriesChartConfig)

    case 'line':
      return lineChart(
        config as SeriesChartConfig,
        await collectLineOptions()
      )

    case 'pie':
      return pieChart(config as ChartConfig, await collectPieOptions())

    case 'scatter': {
      const singleConfig = config as ChartConfig
      return scatterChart(
        singleConfig,
        await collectScatterOptions(singleConfig.xKey, singleConfig.yKey)
      )
    }

    case 'area':
      return areaChart(
        config as SeriesChartConfig,
        await collectAreaOptions()
      )

    case 'horizontalBar':
      return horizontalBarChart(
        config as ChartConfig,
        await collectHorizontalBarOptions()
      )

    case 'doughnut':
      return doughnutChart(config as ChartConfig, await collectDoughnutOptions())
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

  const supportsMultipleSeries =
    type === 'bar' || type === 'line' || type === 'area'

  const additionalYKeys = supportsMultipleSeries
    ? await input({
        message: 'Additional Y axis keys? (comma separated, blank for single series)',
        default: '',
      })
    : ''

  const yKeys = [
    yKey,
    ...additionalYKeys
      .split(',')
      .map(key => key.trim())
      .filter(key => key.length > 0 && key !== yKey),
  ].filter((key, index, keys) => keys.indexOf(key) === index)

  const sourceType = await select<CliDataSource>({
    message: 'Data source?',
    choices: [
      { name: 'Manual entry', value: 'manual' },
      { name: 'CSV file', value: 'csv' },
      { name: 'JSON file', value: 'json' },
    ],
  })

  let rows: DataRow[] | undefined

  if (sourceType === 'csv') {
    rows = await collectStructuredDataRows({
      kind: 'csv',
      defaultPath: './data.csv',
      promptMessage: 'Path to CSV file:',
    })
  } else if (sourceType === 'json') {
    rows = await collectStructuredDataRows({
      kind: 'json',
      defaultPath: './data.json',
      promptMessage: 'Path to JSON file:',
    })
  } else {
    rows = await collectManualRows(xKey, yKeys, type === 'scatter')
  }

  if (!rows || rows.length === 0) {
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

  const config: ChartConfig | SeriesChartConfig = {
    type,
    title,
    subtitle,
    xKey,
    yKey,
    series:
      supportsMultipleSeries && yKeys.length > 1
        ? yKeys.map(key => ({ key, label: key }))
        : undefined,
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