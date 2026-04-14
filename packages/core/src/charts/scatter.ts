import { ChartConfig, VizFlowOutput } from '../types/index.js'
import {
  resolveData,
  extractPoints,
  generateId,
  buildWrapperCss,
} from './shared.js'

// ─── Extended config for scatter charts ──────────────────────────

export interface ScatterChartOptions {
  /** Radius of each data point in pixels — defaults to 5 */
  pointRadius?: number
  /** X axis label shown below the chart — defaults to xKey */
  xAxisLabel?: string
  /** Y axis label shown beside the chart — defaults to yKey */
  yAxisLabel?: string
}

// ─── HTML builder ─────────────────────────────────────────────────

function buildHtml(
  id: string,
  points: { x: number; y: number }[],
  title: string,
  options: ScatterChartOptions,
  xKey: string,
  yKey: string
): string {
  const pointRadius = options.pointRadius ?? 5
  const xAxisLabel = options.xAxisLabel ?? xKey
  const yAxisLabel = options.yAxisLabel ?? yKey

  return `
<div id="vf-${id}">
  <canvas id="vf-canvas-${id}"></canvas>
</div>
<script type="module">
  import { Chart, ScatterController, PointElement, LinearScale, Tooltip, Legend } from 'chart.js'

  Chart.register(ScatterController, PointElement, LinearScale, Tooltip, Legend)

  const ctx = document.getElementById('vf-canvas-${id}')

  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: '${title}',
        data: ${JSON.stringify(points)},
        backgroundColor: 'var(--vf-primary, #6366f1)',
        pointRadius: ${pointRadius},
        pointHoverRadius: ${pointRadius + 2},
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: { enabled: true }
      },
      scales: {
        x: {
          title: { display: true, text: '${xAxisLabel}' },
          grid: { display: true }
        },
        y: {
          title: { display: true, text: '${yAxisLabel}' },
          beginAtZero: false
        }
      }
    }
  })
</script>
  `.trim()
}

// ─── Main generator ───────────────────────────────────────────────

/**
 * Generates a scatter chart from a ChartConfig.
 * Both xKey and yKey must reference numeric values in the DataRow.
 *
 * @param config - Chart configuration object
 * @param options - Optional scatter chart specific settings
 * @returns VizFlowOutput ready to insert into the DOM
 */
export function scatterChart(
  config: ChartConfig,
  options: ScatterChartOptions = {}
): VizFlowOutput {
  const id = generateId()
  const width = config.width ?? 600
  const height = config.height ?? 400
  const title = config.title ?? 'Scatter Chart'

  const rows = resolveData(config)
  const points = extractPoints(rows, config.xKey, config.yKey)

  const html = buildHtml(id, points, title, options, config.xKey, config.yKey)
  const css = buildWrapperCss(id, width, height)

  return {
    html,
    css,
    render: () => `<style>${css}</style>\n${html}`,
  }
}
