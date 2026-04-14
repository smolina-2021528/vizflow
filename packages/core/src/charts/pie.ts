import { ChartConfig, VizFlowOutput } from '../types/index.js'
import {
  resolveData,
  extractLabels,
  extractValues,
  generateId,
  buildWrapperCss,
} from './shared.js'

// ─── Extended config for pie charts ──────────────────────────────

export interface PieChartOptions {
  /** Show percentage labels inside slices — defaults to false */
  showPercentages?: boolean
  /** Cut out center to render as donut chart — defaults to false */
  donut?: boolean
  /** Donut cutout percentage (0-100) — defaults to 60 */
  cutoutPercent?: number
}

// ─── Color palette builder ────────────────────────────────────────

/**
 * Generates an array of RGBA colors for each pie slice.
 * Uses indigo as base color with varying opacity levels.
 */
function buildColorPalette(count: number): string[] {
  const baseColors = [
    'rgba(99, 102, 241, 0.85)',
    'rgba(139, 92, 246, 0.85)',
    'rgba(59, 130, 246, 0.85)',
    'rgba(16, 185, 129, 0.85)',
    'rgba(245, 158, 11, 0.85)',
    'rgba(239, 68, 68, 0.85)',
    'rgba(236, 72, 153, 0.85)',
    'rgba(14, 165, 233, 0.85)',
  ]

  // If more slices than base colors, cycle through them
  return Array.from(
    { length: count },
    (_, i) => baseColors[i % baseColors.length]
  )
}

// ─── HTML builder ─────────────────────────────────────────────────

function buildHtml(
  id: string,
  labels: string[],
  values: number[],
  title: string,
  options: PieChartOptions
): string {
  const donut = options.donut ?? false
  const cutout = donut ? `${options.cutoutPercent ?? 60}%` : '0%'
  const colors = buildColorPalette(values.length)

  return `
<div id="vf-${id}">
  <canvas id="vf-canvas-${id}"></canvas>
</div>
<script type="module">
  import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js'

  Chart.register(PieController, ArcElement, Tooltip, Legend)

  const ctx = document.getElementById('vf-canvas-${id}')

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [{
        label: '${title}',
        data: ${JSON.stringify(values)},
        backgroundColor: ${JSON.stringify(colors)},
        borderWidth: 2,
        borderColor: 'var(--vf-background, #ffffff)',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '${cutout}',
      plugins: {
        legend: { display: true, position: 'right' },
        tooltip: { enabled: true }
      }
    }
  })
</script>
  `.trim()
}

// ─── Main generator ───────────────────────────────────────────────

/**
 * Generates a pie (or donut) chart from a ChartConfig.
 * Each DataRow represents one slice of the pie.
 *
 * @param config - Chart configuration object
 * @param options - Optional pie chart specific settings
 * @returns VizFlowOutput ready to insert into the DOM
 */
export function pieChart(
  config: ChartConfig,
  options: PieChartOptions = {}
): VizFlowOutput {
  const id = generateId()
  const width = config.width ?? 500
  const height = config.height ?? 500
  const title = config.title ?? 'Pie Chart'

  const rows = resolveData(config)
  const labels = extractLabels(rows, config.xKey)
  const values = extractValues(rows, config.yKey)

  const html = buildHtml(id, labels, values, title, options)
  const css = buildWrapperCss(id, width, height)

  return {
    html,
    css,
    render: () => `<style>${css}</style>\n${html}`,
  }
}
