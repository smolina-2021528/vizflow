import { ChartConfig, VizFlowOutput } from '../types/index.js'
import {
  resolveData,
  extractLabels,
  extractValues,
  generateId,
  buildWrapperCss,
} from './shared.js'

// ─── Extended config for line charts ─────────────────────────────

export interface LineChartOptions {
  /** Fill the area below the line — defaults to false */
  fill?: boolean
  /** Show data point dots on the line — defaults to true */
  showPoints?: boolean
  /** Line tension (0 = sharp, 0.4 = smooth) — defaults to 0.3 */
  tension?: number
}

// ─── HTML builder ─────────────────────────────────────────────────

function buildHtml(
  id: string,
  labels: string[],
  values: number[],
  title: string,
  options: LineChartOptions
): string {
  const fill = options.fill ?? false
  const showPoints = options.showPoints ?? true
  const tension = options.tension ?? 0.3

  return `
<div id="vf-${id}">
  <canvas id="vf-canvas-${id}"></canvas>
</div>
<script>
  (function () {

    const ctx = document.getElementById('vf-canvas-${id}')

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [{
          label: '${title}',
          data: ${JSON.stringify(values)},
          borderColor: 'var(--vf-primary, #6366f1)',
          backgroundColor: '${fill ? 'rgba(99, 102, 241, 0.15)' : 'transparent'}',
          fill: ${fill},
          tension: ${tension},
          pointRadius: ${showPoints ? 4 : 0},
          pointHoverRadius: ${showPoints ? 6 : 0},
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
          x: { grid: { display: false } },
          y: { beginAtZero: true }
        }
      }
    })
  })()
</script>
  `.trim()
}

// ─── Main generator ───────────────────────────────────────────────

/**
 * Generates a line chart from a ChartConfig.
 * Accepts optional LineChartOptions for fill, points and tension.
 *
 * @param config - Chart configuration object
 * @param options - Optional line chart specific settings
 * @returns VizFlowOutput ready to insert into the DOM
 */
export function lineChart(
  config: ChartConfig,
  options: LineChartOptions = {}
): VizFlowOutput {
  const id = generateId()
  const width = config.width ?? 600
  const height = config.height ?? 400
  const title = config.title ?? 'Line Chart'

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
