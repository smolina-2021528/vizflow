// ─── Base data types ──────────────────────────────────────────────

/** A generic data row — string key, primitive value */
export type DataRow = Record<string, string | number | boolean | null>

/** Data source: inline array or path to an external file */
export type DataSource =
  | { kind: 'inline'; rows: DataRow[] }
  | { kind: 'file'; path: string; format: 'csv' | 'json' }

// ─── Visual themes ────────────────────────────────────────────────

export type ThemeName = 'light' | 'dark' | 'custom'

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

// ─── Chart types ──────────────────────────────────────────────────

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter'

export interface ChartConfig {
  type: ChartType
  title?: string
  data: DataSource
  /** Key from DataRow used as the X axis */
  xKey: string
  /** Key from DataRow used as the Y axis */
  yKey: string
  theme?: Theme
  width?: number
  height?: number
}

// ─── Table types ──────────────────────────────────────────────────

export interface ColumnDef {
  /** Key from DataRow */
  key: string
  /** Visible label shown in the table header */
  label: string
  sortable?: boolean
  width?: string
}

export interface TableConfig {
  title?: string
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
