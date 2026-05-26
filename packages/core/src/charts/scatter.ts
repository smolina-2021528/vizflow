import { ChartConfig, VizFlowOutput } from '../types/index.js'
import {
  resolveData,
  extractPoints,
  generateId,
  buildWrapperCss,
  buildChartColorScript,
  buildChartRuntimeGuard,
  buildChartShellHtml,
  sanitizeFiniteNumber,
} from './shared.js'
import { toJsonScriptValue } from '../utils/escape.js'

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
  yKey: string,
  subtitle?: string
): string {
  const pointRadius = sanitizeFiniteNumber(options.pointRadius, 5, {
    min: 0,
    max: 50,
  })
  const xAxisLabel = options.xAxisLabel ?? xKey
  const yAxisLabel = options.yAxisLabel ?? yKey

  return `
${buildChartShellHtml(id, title, subtitle)}
<script>
  (function () {
    ${buildChartRuntimeGuard()}
    ${buildChartColorScript()}

    const ctx = document.getElementById('vf-canvas-${id}')

    new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: ${toJsonScriptValue(title)},
          data: ${toJsonScriptValue(points)},
          backgroundColor: vfWithAlpha(vfChartColors[0], 0.88),
          borderColor: vfChartColors[0],
          pointRadius: ${pointRadius},
          pointHoverRadius: ${pointRadius + 2},
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: vfSurfaceColor,
            titleColor: vfTextColor,
            bodyColor: vfTextColor,
            borderColor: vfBorderColor,
            borderWidth: 1,
            padding: 12,
            displayColors: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: ${toJsonScriptValue(xAxisLabel)},
              color: vfMutedTextColor
            },
            grid: { color: vfWithAlpha(vfBorderColor, 0.65) },
            border: { display: false },
            ticks: { color: vfMutedTextColor }
          },
          y: {
            title: {
              display: true,
              text: ${toJsonScriptValue(yAxisLabel)},
              color: vfMutedTextColor
            },
            beginAtZero: false,
            grid: { color: vfWithAlpha(vfBorderColor, 0.65) },
            border: { display: false },
            ticks: { color: vfMutedTextColor }
          }
        }
      }
    })
  })()
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
  const width = sanitizeFiniteNumber(config.width, 600, { min: 1 })
  const height = sanitizeFiniteNumber(config.height, 400, { min: 1 })
  const title = config.title ?? 'Scatter Chart'

  const rows = resolveData(config)
  const points = extractPoints(rows, config.xKey, config.yKey)

  const html = buildHtml(
    id,
    points,
    title,
    options,
    config.xKey,
    config.yKey,
    config.subtitle
  )
  const css = buildWrapperCss(id, width, height, config.appearance)

  return {
    html,
    css,
    render: () => `<style>${css}</style>\n${html}`,
  }
}