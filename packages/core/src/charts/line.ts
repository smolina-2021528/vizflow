import { ChartConfig, VizFlowOutput } from '../types/index.js'
import {
  resolveData,
  extractLabels,
  extractValues,
  generateId,
  buildWrapperCss,
  buildChartColorScript,
  sanitizeBoolean,
  sanitizeFiniteNumber,
} from './shared.js'
import { toJsonScriptValue } from '../utils/escape.js'

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
  const fill = sanitizeBoolean(options.fill, false)
  const showPoints = sanitizeBoolean(options.showPoints, true)
  const tension = sanitizeFiniteNumber(options.tension, 0.3, {
    min: 0,
    max: 1,
  })

  return `
<div id="vf-${id}">
  <canvas id="vf-canvas-${id}"></canvas>
</div>
<script>
  (function () {
    ${buildChartColorScript()}

    const primaryColor = vfChartColors[0]
    const ctx = document.getElementById('vf-canvas-${id}')

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ${toJsonScriptValue(labels)},
        datasets: [{
          label: ${toJsonScriptValue(title)},
          data: ${toJsonScriptValue(values)},
          borderColor: primaryColor,
          backgroundColor: vfWithAlpha(primaryColor, 0.15),
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
  const width = sanitizeFiniteNumber(config.width, 600, { min: 1 })
  const height = sanitizeFiniteNumber(config.height, 400, { min: 1 })
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