import type {
  HeatmapColorScale,
  HeatmapConfig,
  HeatmapDensity,
  VizFlowOutput,
} from '../types/index.js'
import { escapeHtml } from '../utils/escape.js'
import {
  assertFiniteComponentNumber,
  buildBaseComponentCss,
  formatValueForDisplay,
  generateId,
  resolveSafeWidth,
} from './shared.js'

// ─── Heatmap helpers ──────────────────────────────────────────────

interface HeatmapCell {
  rowLabel: string
  columnLabel: string
  value: number
  formattedValue: string
  color: string
  textColor: string
}

interface HeatmapBounds {
  min: number
  max: number
}

function resolveHeatmapDensity(density: HeatmapDensity | undefined): HeatmapDensity {
  if (density === 'compact') {
    return 'compact'
  }

  return 'comfortable'
}

function resolveHeatmapColorScale(
  colorScale: HeatmapColorScale | undefined
): HeatmapColorScale {
  if (
    colorScale === 'green' ||
    colorScale === 'purple' ||
    colorScale === 'orange' ||
    colorScale === 'gray'
  ) {
    return colorScale
  }

  return 'blue'
}

function resolveScaleHueAndSaturation(colorScale: HeatmapColorScale): {
  hue: number
  saturation: number
} {
  switch (colorScale) {
    case 'green':
      return { hue: 156, saturation: 72 }
    case 'purple':
      return { hue: 262, saturation: 78 }
    case 'orange':
      return { hue: 25, saturation: 88 }
    case 'gray':
      return { hue: 215, saturation: 16 }
    case 'blue':
      return { hue: 217, saturation: 82 }
  }
}

function resolveHeatmapColor(
  value: number,
  bounds: HeatmapBounds,
  colorScale: HeatmapColorScale
): { color: string; textColor: string } {
  const range = bounds.max - bounds.min
  const ratio = range === 0 ? 0.5 : (value - bounds.min) / range
  const clampedRatio = Math.min(Math.max(ratio, 0), 1)
  const { hue, saturation } = resolveScaleHueAndSaturation(colorScale)

  const lightness = 96 - clampedRatio * 54
  const color = `hsl(${hue} ${saturation}% ${lightness.toFixed(2)}%)`
  const textColor = clampedRatio >= 0.58 ? '#ffffff' : 'var(--vf-text, #111827)'

  return { color, textColor }
}

function validateMatrix(config: HeatmapConfig): void {
  if (config.rows.length === 0) {
    throw new Error('[VizFlow] Heatmap rows cannot be empty')
  }

  if (config.columns.length === 0) {
    throw new Error('[VizFlow] Heatmap columns cannot be empty')
  }

  if (config.values.length !== config.rows.length) {
    throw new Error(
      '[VizFlow] Heatmap values row count must match rows length'
    )
  }

  config.values.forEach((row, rowIndex) => {
    if (row.length !== config.columns.length) {
      throw new Error(
        `[VizFlow] Heatmap values at row ${rowIndex} must match columns length`
      )
    }

    row.forEach((value, columnIndex) => {
      assertFiniteComponentNumber(
        value,
        `Heatmap value at row ${rowIndex}, column ${columnIndex}`
      )
    })
  })
}

function resolveBounds(config: HeatmapConfig): HeatmapBounds {
  const allValues = config.values.flat()

  const min = config.min ?? Math.min(...allValues)
  const max = config.max ?? Math.max(...allValues)

  assertFiniteComponentNumber(min, 'Heatmap min')
  assertFiniteComponentNumber(max, 'Heatmap max')

  if (max < min) {
    throw new Error('[VizFlow] Heatmap max must be greater than or equal to min')
  }

  return { min, max }
}

function resolveCells(config: HeatmapConfig): HeatmapCell[][] {
  validateMatrix(config)

  const bounds = resolveBounds(config)
  const colorScale = resolveHeatmapColorScale(config.colorScale)

  return config.rows.map((rowLabel, rowIndex) => {
    return config.columns.map((columnLabel, columnIndex) => {
      const value = config.values[rowIndex][columnIndex]
      const formattedValue = formatValueForDisplay(value, config.valueFormat)
      const { color, textColor } = resolveHeatmapColor(
        value,
        bounds,
        colorScale
      )

      return {
        rowLabel,
        columnLabel,
        value,
        formattedValue,
        color,
        textColor,
      }
    })
  })
}

function buildHeaderCells(config: HeatmapConfig): string {
  return config.columns
    .map(column => `<th scope="col">${escapeHtml(column)}</th>`)
    .join('')
}

function buildBodyRows(config: HeatmapConfig, cells: HeatmapCell[][]): string {
  const showValues = config.showValues ?? true

  return cells
    .map((rowCells, rowIndex) => {
      const rowLabel = config.rows[rowIndex]

      const valueCells = rowCells
        .map(cell => {
          const safeValue = escapeHtml(cell.formattedValue)
          const safeColumnLabel = escapeHtml(cell.columnLabel)
          const safeRowLabel = escapeHtml(cell.rowLabel)
          const visibleValue = showValues
            ? `<span class="vf-heatmap-value">${safeValue}</span>`
            : ''

          return `<td style="background:${cell.color};color:${cell.textColor}" title="${safeRowLabel} / ${safeColumnLabel}: ${safeValue}" aria-label="${safeRowLabel} ${safeColumnLabel} ${safeValue}">${visibleValue}</td>`
        })
        .join('')

      return `<tr><th scope="row">${escapeHtml(rowLabel)}</th>${valueCells}</tr>`
    })
    .join('\n      ')
}

function buildHtml(id: string, config: HeatmapConfig): string {
  const cells = resolveCells(config)
  const safeTitle = escapeHtml(config.title)
  const safeSubtitle = config.subtitle ? escapeHtml(config.subtitle) : ''
  const density = resolveHeatmapDensity(config.density)
  const colorScale = resolveHeatmapColorScale(config.colorScale)

  const subtitleHtml = safeSubtitle
    ? `<p class="vf-heatmap-subtitle">${safeSubtitle}</p>`
    : ''

  return `
<div id="vf-${id}" class="vf-heatmap-card vf-heatmap-density-${density} vf-heatmap-scale-${colorScale}">
  <div class="vf-heatmap-header">
    <h2 class="vf-heatmap-title">${safeTitle}</h2>
    ${subtitleHtml}
  </div>

  <div class="vf-heatmap-scroll">
    <table class="vf-heatmap-table">
      <caption class="vf-heatmap-caption">${safeTitle}</caption>
      <thead>
        <tr>
          <th scope="col"></th>
          ${buildHeaderCells(config)}
        </tr>
      </thead>
      <tbody>
      ${buildBodyRows(config, cells)}
      </tbody>
    </table>
  </div>
</div>
  `.trim()
}

function buildCss(id: string, width: number, config: HeatmapConfig): string {
  return `
${buildBaseComponentCss(id, width, config.appearance)}
#vf-${id} .vf-heatmap-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}
#vf-${id} .vf-heatmap-title {
  margin: 0;
  color: var(--vf-text, #111827);
  font-size: 1.05rem;
  line-height: 1.35;
  font-weight: 750;
  letter-spacing: -0.01em;
}
#vf-${id} .vf-heatmap-subtitle {
  margin: 0;
  color: var(--vf-text-muted, #6b7280);
  font-size: 0.875rem;
  line-height: 1.45;
}
#vf-${id} .vf-heatmap-scroll {
  width: 100%;
  overflow-x: auto;
}
#vf-${id} .vf-heatmap-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 4px;
  font-size: 0.86rem;
}
#vf-${id} .vf-heatmap-caption {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
#vf-${id} .vf-heatmap-table th {
  color: var(--vf-text-muted, #6b7280);
  font-weight: 750;
  text-align: center;
  white-space: nowrap;
}
#vf-${id} .vf-heatmap-table thead th {
  padding: 8px 10px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
#vf-${id} .vf-heatmap-table tbody th {
  padding: 8px 10px;
  text-align: left;
  font-size: 0.82rem;
}
#vf-${id} .vf-heatmap-table td {
  min-width: 56px;
  height: 42px;
  padding: 8px 10px;
  border-radius: 10px;
  text-align: center;
  font-weight: 750;
  box-sizing: border-box;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}
#vf-${id} .vf-heatmap-table td:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  opacity: 0.95;
}
#vf-${id} .vf-heatmap-value {
  display: inline-block;
}
#vf-${id}.vf-heatmap-density-compact .vf-heatmap-table {
  border-spacing: 3px;
  font-size: 0.8rem;
}
#vf-${id}.vf-heatmap-density-compact .vf-heatmap-table td {
  min-width: 44px;
  height: 34px;
  padding: 6px 8px;
  border-radius: 8px;
}
  `.trim()
}

// ─── Main generator ───────────────────────────────────────────────

/**
 * Generates a dashboard-style heatmap.
 * Useful for intensity matrices, activity grids and comparative performance tables.
 *
 * @param config - Heatmap configuration object
 * @returns VizFlowOutput ready to insert into the DOM
 */
export function heatmap(config: HeatmapConfig): VizFlowOutput {
  const id = generateId()
  const width = resolveSafeWidth(config.width, 720)

  const html = buildHtml(id, config)
  const css = buildCss(id, width, config)

  return {
    html,
    css,
    render: () => `<style>${css}</style>\n${html}`,
  }
}