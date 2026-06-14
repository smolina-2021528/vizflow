// ─── Chart generation endpoint logic ──────────────────────────────

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
  BuiltInThemeName,
  ChartAppearance,
  ChartConfig,
  ChartFormatOptions,
  ChartRounded,
  ChartType,
  DataRow,
  ValueFormatOptions,
  ValueFormatType,
  VizFlowOutput,
} from '@smolina-dev/vizflow-core'

type JsonRecord = Record<string, unknown>

interface GenerateChartRequest {
  chartConfig?: unknown
  outputOptions?: unknown
}

interface NormalizedChartOutputOptions {
  title: string
  theme: BuiltInThemeName
  filename: string
}

export interface GeneratedChartResult {
  ok: true
  html: string
  filename: string
  bytes: number
  chartConfig: ChartConfig
  outputOptions: NormalizedChartOutputOptions
}

const CHART_TYPES = new Set<ChartType>([
  'bar',
  'line',
  'pie',
  'scatter',
  'area',
  'horizontalBar',
  'doughnut',
])

const BUILT_IN_THEMES = new Set<BuiltInThemeName>([
  'light',
  'dark',
  'hot',
  'cold',
  'corporate',
  'emerald',
  'midnight',
  'sunset',
  'ocean',
  'rose',
  'forest',
])

const VALUE_FORMAT_TYPES = new Set<ValueFormatType>([
  'number',
  'currency',
  'percent',
  'compact',
])

const ROUNDED_VALUES = new Set<ChartRounded>([
  'none',
  'sm',
  'md',
  'lg',
  'xl',
])

// ─── Basic validators ─────────────────────────────────────────────

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(
  value: unknown,
  fallback: string,
  options: { allowEmpty?: boolean } = {}
): string {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()

  if (!options.allowEmpty && trimmed.length === 0) {
    return fallback
  }

  return trimmed
}

function readOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : undefined
}

function readFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return fallback
}

function normalizeChartType(value: unknown): ChartType {
  if (typeof value === 'string' && CHART_TYPES.has(value as ChartType)) {
    return value as ChartType
  }

  throw new Error('Invalid chart type.')
}

function normalizeTheme(value: unknown): BuiltInThemeName {
  if (
    typeof value === 'string' &&
    BUILT_IN_THEMES.has(value as BuiltInThemeName)
  ) {
    return value as BuiltInThemeName
  }

  return 'ocean'
}

function normalizeFilename(value: unknown): string {
  const raw = readString(value, 'chart.html')
  const safe = raw.replace(/[\\/:*?"<>|]/g, '-')
  const filename = safe.endsWith('.html') ? safe : `${safe}.html`

  return filename.length > 5 ? filename : 'chart.html'
}

// ─── Value format normalization ───────────────────────────────────

function normalizeValueFormat(value: unknown): ValueFormatOptions | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const typeValue = value.type

  if (
    typeof typeValue !== 'string' ||
    !VALUE_FORMAT_TYPES.has(typeValue as ValueFormatType)
  ) {
    return undefined
  }

  const type = typeValue as ValueFormatType
  const maximumFractionDigits = readFiniteNumber(value.maximumFractionDigits)
  const minimumFractionDigits = readFiniteNumber(value.minimumFractionDigits)

  const format: ValueFormatOptions = {
    type,
    locale: readString(value.locale, 'en-US'),
    maximumFractionDigits,
    minimumFractionDigits,
  }

  if (type === 'currency') {
    format.currency = readString(value.currency, 'USD').toUpperCase()
  }

  return format
}

function normalizeChartFormat(value: unknown): ChartFormatOptions | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const y = normalizeValueFormat(value.y)
  const tooltip = normalizeValueFormat(value.tooltip)
  const x = normalizeValueFormat(value.x)
  const defaultValue = normalizeValueFormat(value.value)

  if (!y && !tooltip && !x && !defaultValue) {
    return undefined
  }

  return {
    value: defaultValue,
    x,
    y,
    tooltip,
  }
}

// ─── Appearance normalization ─────────────────────────────────────

function normalizeAppearance(value: unknown): ChartAppearance | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const roundedRaw = value.rounded
  const rounded =
    typeof roundedRaw === 'string' && ROUNDED_VALUES.has(roundedRaw as ChartRounded)
      ? (roundedRaw as ChartRounded)
      : 'lg'

  return {
    card: readBoolean(value.card, true),
    shadow: readBoolean(value.shadow, true),
    rounded,
  }
}

// ─── Data normalization ───────────────────────────────────────────

function normalizeRows(value: unknown): DataRow[] {
  if (!Array.isArray(value)) {
    throw new Error('Chart data must be an array of rows.')
  }

  if (value.length === 0) {
    throw new Error('Chart data must contain at least one row.')
  }

  return value.map((row, rowIndex) => {
    if (!isRecord(row)) {
      throw new Error(`Row ${rowIndex + 1} must be an object.`)
    }

    const normalizedRow: DataRow = {}

    for (const [key, cellValue] of Object.entries(row)) {
      if (
        typeof cellValue === 'string' ||
        typeof cellValue === 'number' ||
        typeof cellValue === 'boolean' ||
        cellValue === null
      ) {
        normalizedRow[key] = cellValue
        continue
      }

      throw new Error(
        `Row ${rowIndex + 1}, field "${key}" must be a string, number, boolean or null.`
      )
    }

    return normalizedRow
  })
}

function normalizeChartConfig(value: unknown): ChartConfig {
  if (!isRecord(value)) {
    throw new Error('Missing chart configuration.')
  }

  const data = isRecord(value.data) ? value.data : undefined

  if (!data || data.kind !== 'inline') {
    throw new Error('Studio currently supports inline chart data only.')
  }

  return {
    type: normalizeChartType(value.type),
    title: readOptionalString(value.title),
    subtitle: readOptionalString(value.subtitle),
    xKey: readString(value.xKey, 'label'),
    yKey: readString(value.yKey, 'value'),
    width: readFiniteNumber(value.width),
    height: readFiniteNumber(value.height),
    appearance: normalizeAppearance(value.appearance),
    format: normalizeChartFormat(value.format),
    data: {
      kind: 'inline',
      rows: normalizeRows(data.rows),
    },
  }
}

function normalizeOutputOptions(value: unknown): NormalizedChartOutputOptions {
  const options = isRecord(value) ? value : {}

  return {
    title: readString(options.title, 'VizFlow Chart'),
    theme: normalizeTheme(options.theme),
    filename: normalizeFilename(options.filename),
  }
}

// ─── Chart generator selector ─────────────────────────────────────

function generateChartOutput(config: ChartConfig): VizFlowOutput {
  switch (config.type) {
    case 'bar':
      return barChart(config)

    case 'line':
      return lineChart(config)

    case 'pie':
      return pieChart(config)

    case 'scatter':
      return scatterChart(config)

    case 'area':
      return areaChart(config)

    case 'horizontalBar':
      return horizontalBarChart(config)

    case 'doughnut':
      return doughnutChart(config)
  }
}

// ─── Public API ───────────────────────────────────────────────────

export function generateChartHtml(
  payload: GenerateChartRequest
): GeneratedChartResult {
  const chartConfig = normalizeChartConfig(payload.chartConfig)
  const outputOptions = normalizeOutputOptions(payload.outputOptions)

  const output = generateChartOutput(chartConfig)
  const html = toHtmlFile(output, {
    title: outputOptions.title,
    theme: outputOptions.theme,
    includeChartJs: true,
  })

  return {
    ok: true,
    html,
    filename: outputOptions.filename,
    bytes: Buffer.byteLength(html, 'utf-8'),
    chartConfig,
    outputOptions,
  }
}