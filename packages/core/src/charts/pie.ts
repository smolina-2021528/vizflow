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

// ─── Extended config for pie charts ──────────────────────────────

export interface PieChartOptions {
  /** Show percentage labels inside slices — defaults to false */
  showPercentages?: boolean
  /** Cut out center to render as donut chart — defaults to false */
  donut?: boolean
  /** Donut cutout percentage (0-100) — defaults to 60 */
  cutoutPercent?: number
}

// ─── HTML builder ─────────────────────────────────────────────────

function buildHtml(
  id: string,
  labels: string[],
  values: number[],
  title: string,
  config: ChartConfig,
  options: PieChartOptions
): string {
  const donut = sanitizeBoolean(options.donut, false)
  const cutoutPercent = sanitizeFiniteNumber(options.cutoutPercent, 60, {
    min: 0,
    max: 100,
  })
  const cutout = donut ? `${cutoutPercent}%` : '0%'
  const showPercentages = sanitizeBoolean(options.showPercentages, false)
  const format = resolveChartFormatOptions(config.format)

  return `
${buildChartShellHtml(id, title, config.subtitle)}
<script>
  (function () {
    ${buildChartRuntimeGuard()}
    ${buildChartColorScript()}
    ${buildValueFormatterScript()}

    const vfTooltipFormat = ${toJsonScriptValue(format.tooltip)}
    const ctx = document.getElementById('vf-canvas-${id}')
    const pieValues = ${toJsonScriptValue(values)}

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ${toJsonScriptValue(labels)},
        datasets: [{
          label: ${toJsonScriptValue(title)},
          data: pieValues,
          backgroundColor: pieValues.map(function (_, index) {
            return vfChartColors[index % vfChartColors.length]
          }),
          borderWidth: 2,
          borderColor: vfSurfaceColor,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: ${toJsonScriptValue(cutout)},
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              color: vfMutedTextColor,
              boxWidth: 12,
              boxHeight: 12,
              padding: 16,
              usePointStyle: true
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: vfSurfaceColor,
            titleColor: vfTextColor,
            bodyColor: vfTextColor,
            borderColor: vfBorderColor,
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function (context) {
                const label = context.label || ''
                const value = Number(context.parsed) || 0
                const formattedValue = vfFormatValue(value, vfTooltipFormat)

                if (!${showPercentages}) {
                  return label + ': ' + formattedValue
                }

                const data = context.dataset.data || []
                const total = data.reduce(function (sum, item) {
                  return sum + (Number(item) || 0)
                }, 0)
                const percentage = total === 0 ? 0 : (value / total) * 100

                return label + ': ' + formattedValue + ' (' + percentage.toFixed(1) + '%)'
              }
            }
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
  const width = sanitizeFiniteNumber(config.width, 500, { min: 1 })
  const height = sanitizeFiniteNumber(config.height, 500, { min: 1 })
  const title = config.title ?? 'Pie Chart'

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