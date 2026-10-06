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
  sanitizeBoolean,
  sanitizeFiniteNumber,
} from './shared.js'
import { toJsonScriptValue } from '../utils/escape.js'

// ─── Extended config for area charts ──────────────────────────────

export interface AreaChartOptions {
  /** Show data point dots on the line — defaults to true */
  showPoints?: boolean
  /** Line tension (0 = sharp, 0.4 = smooth) — defaults to 0.35 */
  tension?: number
  /** Top opacity for the area gradient — defaults to 0.28 */
  gradientOpacity?: number
}

// ─── HTML builder ─────────────────────────────────────────────────

function buildHtml(
  id: string,
  labels: string[],
  title: string,
  config: SeriesChartConfig,
  options: AreaChartOptions
): string {
  const showPoints = sanitizeBoolean(options.showPoints, true)
  const tension = sanitizeFiniteNumber(options.tension, 0.35, {
    min: 0,
    max: 1,
  })
  const gradientOpacity = sanitizeFiniteNumber(options.gradientOpacity, 0.28, {
    min: 0,
    max: 1,
  })
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
    const canvas = document.getElementById('vf-canvas-${id}')
    const canvasContext = canvas.getContext('2d')

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: ${toJsonScriptValue(labels)},
        datasets: vfSeries.map(function (series, index) {
          const color = vfChartColors[index % vfChartColors.length]
          const gradient = canvasContext.createLinearGradient(0, 0, 0, canvas.height || 400)
          gradient.addColorStop(0, vfWithAlpha(color, ${gradientOpacity}))
          gradient.addColorStop(1, vfWithAlpha(color, 0.02))

          return {
            label: series.label,
            data: series.data,
            vfValueFormat: series.format,
            borderColor: color,
            backgroundColor: gradient,
            fill: true,
            tension: ${tension},
            borderWidth: 3,
            pointRadius: ${showPoints ? 4 : 0},
            pointHoverRadius: ${showPoints ? 6 : 0},
            pointBackgroundColor: color,
            pointBorderColor: vfSurfaceColor,
            pointBorderWidth: 2,
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
 * Generates an area chart from a SeriesChartConfig.
 * Supports the legacy yKey API and the new multi-series API.
 *
 * @param config - Chart configuration object
 * @param options - Optional area chart specific settings
 * @returns VizFlowOutput ready to insert into the DOM
 */
export function areaChart(
  config: SeriesChartConfig,
  options: AreaChartOptions = {}
): VizFlowOutput {
  const id = generateId()
  const width = sanitizeFiniteNumber(config.width, 600, { min: 1 })
  const height = sanitizeFiniteNumber(config.height, 400, { min: 1 })
  const title = config.title ?? 'Area Chart'

  const rows = resolveData(config)
  const labels = extractLabels(rows, config.xKey)

  resolveChartSeries(rows, config, title)

  const html = buildHtml(id, labels, title, config, options)
  const css = buildWrapperCss(id, width, height, config.appearance)

  return {
    html,
    css,
    render: () => `<style>${css}</style>\n${html}`,
  }
}
