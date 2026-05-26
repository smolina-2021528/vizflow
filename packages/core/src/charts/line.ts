import type { ChartConfig, VizFlowOutput } from '../types/index.js'
import {
  resolveData,
  extractLabels,
  extractValues,
  generateId,
  buildWrapperCss,
  buildChartColorScript,
  buildChartRuntimeGuard,
  buildChartShellHtml,
  buildValueFormatterScript,
  resolveChartFormatOptions,
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
  config: ChartConfig,
  options: LineChartOptions
): string {
  const fill = sanitizeBoolean(options.fill, false)
  const showPoints = sanitizeBoolean(options.showPoints, true)
  const tension = sanitizeFiniteNumber(options.tension, 0.3, {
    min: 0,
    max: 1,
  })
  const format = resolveChartFormatOptions(config.format)

  return `
${buildChartShellHtml(id, title, config.subtitle)}
<script>
  (function () {
    ${buildChartRuntimeGuard()}
    ${buildChartColorScript()}
    ${buildValueFormatterScript()}

    const vfYFormat = ${toJsonScriptValue(format.y)}
    const vfTooltipFormat = ${toJsonScriptValue(format.tooltip)}
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
          backgroundColor: vfWithAlpha(primaryColor, 0.14),
          fill: ${fill},
          tension: ${tension},
          borderWidth: 3,
          pointRadius: ${showPoints ? 4 : 0},
          pointHoverRadius: ${showPoints ? 6 : 0},
          pointBackgroundColor: primaryColor,
          pointBorderColor: vfSurfaceColor,
          pointBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
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
            displayColors: false,
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || ''
                const value = context.parsed.y
                return label + ': ' + vfFormatValue(value, vfTooltipFormat)
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: vfMutedTextColor }
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            ticks: {
              color: vfMutedTextColor,
              callback: function (value) {
                return vfFormatValue(value, vfYFormat)
              }
            },
            grid: { color: vfWithAlpha(vfBorderColor, 0.65) }
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

  const html = buildHtml(id, labels, values, title, config, options)
  const css = buildWrapperCss(id, width, height, config.appearance)

  return {
    html,
    css,
    render: () => `<style>${css}</style>\n${html}`,
  }
}