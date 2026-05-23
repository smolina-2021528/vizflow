import { ChartConfig, DataRow } from '../types/index.js'

// ─── Shared utilities for all chart generators ────────────────────

/** Resolves the DataSource from any config that contains a DataSource into a DataRow array */
export function resolveData(config: { data: ChartConfig['data'] }): DataRow[] {
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

/** Shared JavaScript used by charts to resolve CSS variable colors at runtime */
export function buildChartColorScript(): string {
  return `
    const rootStyles = getComputedStyle(document.documentElement)

    function vfColor(name, fallback) {
      return rootStyles.getPropertyValue(name).trim() || fallback
    }

    function vfWithAlpha(color, alpha) {
      const normalized = color.trim()

      if (/^#[0-9a-f]{3}$/i.test(normalized)) {
        const r = normalized[1] + normalized[1]
        const g = normalized[2] + normalized[2]
        const b = normalized[3] + normalized[3]
        return 'rgba(' + parseInt(r, 16) + ', ' + parseInt(g, 16) + ', ' + parseInt(b, 16) + ', ' + alpha + ')'
      }

      if (/^#[0-9a-f]{6}$/i.test(normalized)) {
        const r = normalized.slice(1, 3)
        const g = normalized.slice(3, 5)
        const b = normalized.slice(5, 7)
        return 'rgba(' + parseInt(r, 16) + ', ' + parseInt(g, 16) + ', ' + parseInt(b, 16) + ', ' + alpha + ')'
      }

      if (/^rgb\\(/i.test(normalized)) {
        return normalized.replace(/^rgb\\(/i, 'rgba(').replace(/\\)$/, ', ' + alpha + ')')
      }

      if (/^hsl\\(/i.test(normalized)) {
        return normalized.replace(/^hsl\\(/i, 'hsla(').replace(/\\)$/, ', ' + alpha + ')')
      }

      return normalized
    }

    const vfChartColors = [
      vfColor('--vf-chart-1', '#6366f1'),
      vfColor('--vf-chart-2', '#8b5cf6'),
      vfColor('--vf-chart-3', '#ec4899'),
      vfColor('--vf-chart-4', '#f59e0b'),
      vfColor('--vf-chart-5', '#10b981')
    ]
  `.trimEnd()
}
