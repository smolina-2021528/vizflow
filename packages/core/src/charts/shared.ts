import { ChartConfig, DataRow } from '../types/index.js'

// ─── Shared utilities for all chart generators ────────────────────

/** Resolves the DataSource from a ChartConfig into a DataRow array */
export function resolveData(config: ChartConfig): DataRow[] {
  const { data } = config

  if (data.kind === 'inline') {
    return data.rows
  }

  throw new Error(
    '[VizFlow] File-based DataSource is only supported via the CLI. Use kind: "inline" for programmatic usage.'
  )
}

/** Extracts an array of X axis labels from the resolved rows */
export function extractLabels(rows: DataRow[], xKey: string): string[] {
  return rows.map(row => String(row[xKey] ?? ''))
}

/** Extracts an array of numeric Y axis values from the resolved rows */
export function extractValues(rows: DataRow[], yKey: string): number[] {
  return rows.map((row, index) => {
    const value = row[yKey]
    if (typeof value !== 'number') {
      throw new Error(
        `[VizFlow] Chart: value at row ${index} for key "${yKey}" is not a number`
      )
    }
    return value
  })
}

/** Extracts an array of {x, y} points for scatter charts */
export function extractPoints(
  rows: DataRow[],
  xKey: string,
  yKey: string
): { x: number; y: number }[] {
  return rows.map((row, index) => {
    const x = row[xKey]
    const y = row[yKey]

    if (typeof x !== 'number') {
      throw new Error(
        `[VizFlow] Scatter chart: x value at row ${index} for key "${xKey}" is not a number`
      )
    }
    if (typeof y !== 'number') {
      throw new Error(
        `[VizFlow] Scatter chart: y value at row ${index} for key "${yKey}" is not a number`
      )
    }

    return { x, y }
  })
}

/** Generates a unique 8-character ID for scoping chart elements */
export function generateId(): string {
  return crypto.randomUUID().slice(0, 8)
}

/** Generates scoped CSS for any chart wrapper */
export function buildWrapperCss(
  id: string,
  width: number,
  height: number
): string {
  return `
#vf-${id} {
  width: ${width}px;
  height: ${height}px;
  position: relative;
  font-family: var(--vf-font, sans-serif);
  background: var(--vf-background, #ffffff);
  border-radius: var(--vf-radius, 8px);
  padding: 16px;
  box-sizing: border-box;
}
#vf-${id} canvas {
  width: 100% !important;
  height: 100% !important;
}
  `.trim()
}
