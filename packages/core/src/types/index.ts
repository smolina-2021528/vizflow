// ─── Base data types ──────────────────────────────────────────────

/** A generic data row — string key, primitive value */
export type DataRow = Record<string, string | number | boolean | null>

/** Data source: inline array or path to an external file */
export type DataSource =
  | { kind: 'inline'; rows: DataRow[] }
  | { kind: 'file'; path: string; format: 'csv' | 'json' }

// ─── Visual themes ────────────────────────────────────────────────

export type ThemeName =
  | 'light'
  | 'dark'
  | 'hot'
  | 'cold'
  | 'corporate'
  | 'emerald'
  | 'midnight'
  | 'sunset'
  | 'ocean'
  | 'custom'

export interface CustomTheme {
  primary: string
  background: string
  text: string
  border: string
  radius: string
  font: string
}

export type Theme =
  | { name: Exclude<ThemeName, 'custom'> }
  | { name: 'custom'; values: CustomTheme }

// ─── Value formatting ─────────────────────────────────────────────

export type ValueFormatType = 'number' | 'currency' | 'percent' | 'compact'

export interface ValueFormatOptions {
  /**
   * How the value should be rendered.
   * - number: regular localized number
   * - currency: localized currency
   * - percent: localized percentage, useful when values are decimals like 0.25
   * - compact: short notation like 1.2K or 3.4M
   */
  type?: ValueFormatType
  /**
   * Locale used by Intl.NumberFormat.
   * Examples: 'en-US', 'es-GT', 'es-MX'
   */
  locale?: string
  /**
   * Currency code used when type is 'currency'.
   * Examples: 'USD', 'GTQ', 'MXN'
   */
  currency?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  /**
   * Text added before the formatted value.
   * Useful for custom prefixes like 'Q'.
   */
  prefix?: string
  /**
   * Text added after the formatted value.
   * Useful for units like ' units' or ' kg'.
   */
  suffix?: string
}

export interface ChartFormatOptions {
  /**
   * Default formatter used by chart values when a specific formatter is not provided.
   */
  value?: ValueFormatOptions
  /**
   * Formatter for X axis values. Mainly useful for scatter charts.
   */
  x?: ValueFormatOptions
  /**
   * Formatter for Y axis values.
   */
  y?: ValueFormatOptions
  /**
   * Formatter used inside tooltips.
   */
  tooltip?: ValueFormatOptions
}

// ─── Chart types ──────────────────────────────────────────────────

export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'scatter'
  | 'area'
  | 'horizontalBar'
  | 'doughnut'

export type ChartRounded = 'sm' | 'md' | 'lg' | 'xl' | 'none'

export interface ChartAppearance {
  /**
   * Whether the chart should be rendered inside a visual card container.
   * Defaults to true in most chart renderers.
   */
  card?: boolean
  /**
   * Whether the card should have a subtle shadow.
   */
  shadow?: boolean
  /**
   * Border radius size for the visual card.
   */
  rounded?: ChartRounded
}

export interface ChartConfig {
  type: ChartType
  title?: string
  subtitle?: string
  xKey: string
  yKey: string
  width?: number
  height?: number
  data: DataSource
  theme?: Theme
  format?: ChartFormatOptions
  appearance?: ChartAppearance
}

// ─── Component types ──────────────────────────────────────────────

export interface ComponentAppearance {
  card?: boolean
  shadow?: boolean
  rounded?: ChartRounded
}

export type MetricTrendDirection = 'up' | 'down' | 'neutral'

export interface MetricTrend {
  value: number
  direction?: MetricTrendDirection
  label?: string
  format?: ValueFormatOptions
}

export interface MetricCardConfig {
  title: string
  subtitle?: string
  value: number
  valueFormat?: ValueFormatOptions
  trend?: MetricTrend
  footer?: string
  width?: number
  appearance?: ComponentAppearance
}

export type ProgressBarVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

export type ProgressBarSize = 'sm' | 'md' | 'lg'

export interface ProgressBarConfig {
  title: string
  subtitle?: string
  value: number
  max?: number
  valueFormat?: ValueFormatOptions
  variant?: ProgressBarVariant
  size?: ProgressBarSize
  showValue?: boolean
  showPercentage?: boolean
  width?: number
  appearance?: ComponentAppearance
}

// ─── Heatmap types ────────────────────────────────────────────────

export type HeatmapColorScale = 'blue' | 'green' | 'purple' | 'orange' | 'gray'

export type HeatmapDensity = 'comfortable' | 'compact'

export interface HeatmapConfig {
  title?: string
  subtitle?: string
  rows: string[]
  columns: string[]
  values: number[][]
  colorScale?: HeatmapColorScale
  density?: HeatmapDensity
  showValues?: boolean
  valueFormat?: ValueFormatOptions
  min?: number
  max?: number
  width?: number
}

// ─── Table types ──────────────────────────────────────────────────

export type TableColumnAlign = 'left' | 'center' | 'right'

export type TableDensity = 'comfortable' | 'compact'

export interface ColumnDef {
  key: string
  label: string
  sortable?: boolean
  align?: TableColumnAlign
  format?: ValueFormatOptions
  width?: string
}

export interface TableConfig {
  title?: string
  subtitle?: string
  columns: ColumnDef[]
  data: DataSource
  theme?: Theme
}

// ─── Output contract ──────────────────────────────────────────────

export interface VizFlowOutput {
  id: string
  kind: string
  html: string
  script?: string
  render(): string
}