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

// ─── HTML builder ─────────────────────────────────────────────────

function buildHtml(
  id: string,
  labels: string[],
  values: number[],
  title: string,
  config: ChartConfig
): string {
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
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: vfChartColors[0],
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
 * Generates a bar chart from a ChartConfig.
 * Returns a VizFlowOutput with html, css, and a render() method.
 *
 * @param config - Chart configuration object
 * @returns VizFlowOutput ready to insert into the DOM
 */
export function barChart(config: ChartConfig): VizFlowOutput {
  const id = generateId()
  const width = sanitizeFiniteNumber(config.width, 600, { min: 1 })
  const height = sanitizeFiniteNumber(config.height, 400, { min: 1 })
  const title = config.title ?? 'Bar Chart'

  const rows = resolveData(config)
  const labels = extractLabels(rows, config.xKey)
  const values = extractValues(rows, config.yKey)

  const html = buildHtml(id, labels, values, title, config)
  const css = buildWrapperCss(id, width, height, config.appearance)

  return {
    html,
    css,
    render: () => `<style>${css}</style>\n${html}`,
  }
}