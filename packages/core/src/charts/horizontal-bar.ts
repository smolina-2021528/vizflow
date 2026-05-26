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
  sanitizeFiniteNumber,
} from './shared.js'
import { toJsonScriptValue } from '../utils/escape.js'

// ─── Extended config for horizontal bar charts ────────────────────

export interface HorizontalBarChartOptions {
  /** Bar thickness in pixels — defaults to 28 */
  barThickness?: number
  /** Border radius in pixels — defaults to 8 */
  borderRadius?: number
}

// ─── HTML builder ─────────────────────────────────────────────────

function buildHtml(
  id: string,
  labels: string[],
  values: number[],
  title: string,
  config: ChartConfig,
  options: HorizontalBarChartOptions
): string {
  const barThickness = sanitizeFiniteNumber(options.barThickness, 28, {
    min: 1,
    max: 100,
  })
  const borderRadius = sanitizeFiniteNumber(options.borderRadius, 8, {
    min: 0,
    max: 40,
  })
  const format = resolveChartFormatOptions(config.format)

  return `
${buildChartShellHtml(id, title, config.subtitle)}
<script>
  (function () {
    ${buildChartRuntimeGuard()}
    ${buildChartColorScript()}
    ${buildValueFormatterScript()}

    const vfXFormat = ${toJsonScriptValue(format.y)}
    const vfTooltipFormat = ${toJsonScriptValue(format.tooltip)}
    const ctx = document.getElementById('vf-canvas-${id}')

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ${toJsonScriptValue(labels)},
        datasets: [{
          label: ${toJsonScriptValue(title)},
          data: ${toJsonScriptValue(values)},
          backgroundColor: vfWithAlpha(vfChartColors[0], 0.88),
          borderColor: vfChartColors[0],
          borderWidth: 1,
          borderRadius: ${borderRadius},
          borderSkipped: false,
          barThickness: ${barThickness},
          hoverBackgroundColor: vfChartColors[0],
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'nearest'
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
                const value = context.parsed.x
                return label + ': ' + vfFormatValue(value, vfTooltipFormat)
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            border: { display: false },
            ticks: {
              color: vfMutedTextColor,
              callback: function (value) {
                return vfFormatValue(value, vfXFormat)
              }
            },
            grid: { color: vfWithAlpha(vfBorderColor, 0.65) }
          },
          y: {
            grid: { display: false },
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
 * Generates a horizontal bar chart from a ChartConfig.
 * Useful for rankings, category comparisons and top-N views.
 *
 * @param config - Chart configuration object
 * @param options - Optional horizontal bar chart specific settings
 * @returns VizFlowOutput ready to insert into the DOM
 */
export function horizontalBarChart(
  config: ChartConfig,
  options: HorizontalBarChartOptions = {}
): VizFlowOutput {
  const id = generateId()
  const width = sanitizeFiniteNumber(config.width, 700, { min: 1 })
  const height = sanitizeFiniteNumber(config.height, 420, { min: 1 })
  const title = config.title ?? 'Horizontal Bar Chart'

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