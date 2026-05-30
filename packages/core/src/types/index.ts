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
   * Formatter for Y axis values and chart scales.
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

export type ChartRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export interface ChartAppearance {
  /**
   * Render the chart inside a dashboard-style card.
   * Defaults to true.
   */
  card?: boolean
  /**
   * Add a soft shadow to the chart card.
   * Defaults to true when card is enabled.
   */
  shadow?: boolean
  /**
   * Border radius style for the chart card.
   * Defaults to 'lg'.
   */
  rounded?: ChartRounded
}

export interface ChartConfig {
  type: ChartType
  title?: string
  subtitle?: string
  data: DataSource
  /** Key from DataRow used as the X axis */
  xKey: string
  /** Key from DataRow used as the Y axis */
  yKey: string
  theme?: Theme
  width?: number
  height?: number
  appearance?: ChartAppearance
  format?: ChartFormatOptions
}

// ─── Dashboard component types ────────────────────────────────────

export interface ComponentAppearance {
  /**
   * Render the component as a dashboard-style card.
   * Defaults to true.
   */
  card?: boolean
  /**
   * Add a soft shadow to the component card.
   * Defaults to true when card is enabled.
   */
  shadow?: boolean
  /**
   * Border radius style for the component card.
   * Defaults to 'lg'.
   */
  rounded?: ChartRounded
}

export type MetricTrendDirection = 'up' | 'down' | 'neutral'

export interface MetricTrend {
  /**
   * Trend value.
   * By default, metricCard renders this as a percentage-style number, e.g. +12.5%.
   */
  value: number
  /**
   * Visual direction. If omitted, VizFlow infers it from the value.
   */
  direction?: MetricTrendDirection
  /**
   * Text shown after the trend value.
   * Example: 'vs previous month'
   */
  label?: string
  /**
   * Custom formatter for the trend value.
   */
  format?: ValueFormatOptions
}

export interface MetricCardConfig {
  title: string
  value: number
  subtitle?: string
  footer?: string
  width?: number
  valueFormat?: ValueFormatOptions
  trend?: MetricTrend
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
  value: number
  max?: number
  subtitle?: string
  width?: number
  valueFormat?: ValueFormatOptions
  percentageFormat?: ValueFormatOptions
  showValue?: boolean
  showPercentage?: boolean
  variant?: ProgressBarVariant
  size?: ProgressBarSize
  appearance?: ComponentAppearance
}

// ─── Heatmap types ────────────────────────────────────────────────

export type HeatmapColorScale =
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'gray'

export type HeatmapDensity = 'compact' | 'comfortable'

export interface HeatmapConfig {
  title: string
  subtitle?: string
  /**
   * Row labels displayed on the left side of the heatmap.
   */
  rows: string[]
  /**
   * Column labels displayed at the top of the heatmap.
   */
  columns: string[]
  /**
   * Matrix of values. Each inner array represents one row.
   */
  values: number[][]
  width?: number
  /**
   * Optional minimum value used to calculate color intensity.
   * If omitted, VizFlow uses the lowest value in the matrix.
   */
  min?: number
  /**
   * Optional maximum value used to calculate color intensity.
   * If omitted, VizFlow uses the highest value in the matrix.
   */
  max?: number
  valueFormat?: ValueFormatOptions
  colorScale?: HeatmapColorScale
  density?: HeatmapDensity
  showValues?: boolean
  appearance?: ComponentAppearance
}

// ─── Table types ──────────────────────────────────────────────────

export type TableColumnAlign = 'left' | 'center' | 'right'
export type TableDensity = 'compact' | 'comfortable'

export interface ColumnDef {
  /** Key from DataRow */
  key: string
  /** Visible label shown in the table header */
  label: string
  sortable?: boolean
  width?: string
  /**
   * Text alignment for this column.
   * Defaults to left.
   */
  align?: TableColumnAlign
  /**
   * Optional value formatter for numeric cells.
   */
  format?: ValueFormatOptions
}

export interface TableConfig {
  title?: string
  subtitle?: string
  data: DataSource
  columns: ColumnDef[]
  theme?: Theme
  pageSize?: number
}

// ─── Library output ───────────────────────────────────────────────

/** Returned by every VizFlow generator */
export interface VizFlowOutput {
  /** HTML ready to be inserted into the DOM */
  html: string
  /** Scoped CSS for this element */
  css: string
  /** Renders html + css together as a single complete string */
  render: () => string
}