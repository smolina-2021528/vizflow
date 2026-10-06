import type { SeriesChartConfig, VizFlowOutput } from '../types/index.js'
import {
  resolveData,
  extractLabels,
  resolveChartSeries,
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
  title: string,
  config: SeriesChartConfig
): string {
  const rows = resolveData(config)
  const series = resolveChartSeries(rows, config, title)
  const format = resolveChartFormatOptions(config.format)
  const serializedSeries = series.map(item => ({
    label: item.label,
    data: item.values,
    format: item.format ?? null,
  }))
  const showLegend = series.length > 1

  return `
${buildChartShellHtml(id, title, config.subtitle)}
<script>
  (function () {
    ${buildChartRuntimeGuard()}
    ${buildChartColorScript()}
    ${buildValueFormatterScript()}

    const vfYFormat = ${toJsonScriptValue(format.y)}
    const vfTooltipFormat = ${toJsonScriptValue(format.tooltip)}
    const vfSeries = ${toJsonScriptValue(serializedSeries)}
    const ctx = document.getElementById('vf-canvas-${id}')

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ${toJsonScriptValue(labels)},
        datasets: vfSeries.map(function (series, index) {
          const color = vfChartColors[index % vfChartColors.length]
          return {
            label: series.label,
            data: series.data,
            vfValueFormat: series.format,
            backgroundColor: vfWithAlpha(color, 0.88),
            borderColor: color,
            borderWidth: 1,
            borderRadius: 8,
            borderSkipped: false,
            hoverBackgroundColor: color,
          }
        })
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: ${showLegend},
            labels: { color: vfTextColor, usePointStyle: true }
          },
          tooltip: {
            enabled: true,
            backgroundColor: vfSurfaceColor,
            titleColor: vfTextColor,
            bodyColor: vfTextColor,
            borderColor: vfBorderColor,
            borderWidth: 1,
            padding: 12,
            displayColors: ${showLegend},
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || ''
                const value = context.parsed.y
                const valueFormat = context.dataset.vfValueFormat || vfTooltipFormat
                return label + ': ' + vfFormatValue(value, valueFormat)
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
 * Generates a bar chart from a SeriesChartConfig.
 * Supports the legacy yKey API and the new multi-series API.
 *
 * @param config - Chart configuration object
 * @returns VizFlowOutput ready to insert into the DOM
 */
export function barChart(config: SeriesChartConfig): VizFlowOutput {
  const id = generateId()
  const width = sanitizeFiniteNumber(config.width, 600, { min: 1 })
  const height = sanitizeFiniteNumber(config.height, 400, { min: 1 })
  const title = config.title ?? 'Bar Chart'

  const rows = resolveData(config)
  const labels = extractLabels(rows, config.xKey)

  // Resolve once here so invalid series fail before HTML is generated.
  resolveChartSeries(rows, config, title)

  const html = buildHtml(id, labels, title, config)
  const css = buildWrapperCss(id, width, height, config.appearance)

  return {
    html,
    css,
    render: () => `<style>${css}</style>\n${html}`,
  }
}
