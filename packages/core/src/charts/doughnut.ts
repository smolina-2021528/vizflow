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

// ─── Extended config for doughnut charts ──────────────────────────

export interface DoughnutChartOptions {
  /** Show percentage labels inside tooltip labels — defaults to true */
  showPercentages?: boolean
  /** Donut cutout percentage (0-100) — defaults to 65 */
  cutoutPercent?: number
}

// ─── HTML builder ─────────────────────────────────────────────────

function buildHtml(
  id: string,
  labels: string[],
  values: number[],
  title: string,
  config: ChartConfig,
  options: DoughnutChartOptions
): string {
  const showPercentages = sanitizeBoolean(options.showPercentages, true)
  const cutoutPercent = sanitizeFiniteNumber(options.cutoutPercent, 65, {
    min: 0,
    max: 100,
  })
  const cutout = `${cutoutPercent}%`
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
    const doughnutValues = ${toJsonScriptValue(values)}

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ${toJsonScriptValue(labels)},
        datasets: [{
          label: ${toJsonScriptValue(title)},
          data: doughnutValues,
          backgroundColor: doughnutValues.map(function (_, index) {
            return vfChartColors[index % vfChartColors.length]
          }),
          borderWidth: 2,
          borderColor: vfSurfaceColor,
          hoverOffset: 8,
          spacing: 2
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
 * Generates a doughnut chart from a ChartConfig.
 * Useful for distribution, share and participation views.
 *
 * @param config - Chart configuration object
 * @param options - Optional doughnut chart specific settings
 * @returns VizFlowOutput ready to insert into the DOM
 */
export function doughnutChart(
  config: ChartConfig,
  options: DoughnutChartOptions = {}
): VizFlowOutput {
  const id = generateId()
  const width = sanitizeFiniteNumber(config.width, 520, { min: 1 })
  const height = sanitizeFiniteNumber(config.height, 420, { min: 1 })
  const title = config.title ?? 'Doughnut Chart'

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