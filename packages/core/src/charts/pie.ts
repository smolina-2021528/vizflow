import { ChartConfig, VizFlowOutput } from '../types/index.js'
import {
  resolveData,
  extractLabels,
  extractValues,
  generateId,
  buildWrapperCss,
  buildChartColorScript,
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

// ─── Color palette builder ────────────────────────────────────────

/**
 * Generates an array of RGBA colors for each pie slice.
 * Uses indigo as base color with varying opacity levels.
 */

// ─── HTML builder ─────────────────────────────────────────────────

function buildHtml(
  id: string,
  labels: string[],
  values: number[],
  title: string,
  options: PieChartOptions
): string {
  const donut = options.donut ?? false
  const cutout = donut ? `${options.cutoutPercent ?? 60}%` : '0%'

  return `
<div id="vf-${id}">
  <canvas id="vf-canvas-${id}"></canvas>
</div>
<script>
  (function () {
    ${buildChartColorScript()}

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
          borderColor: vfColor('--vf-background', '#ffffff'),
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: ${toJsonScriptValue(cutout)},
        plugins: {
          legend: { display: true, position: 'right' },
          tooltip: { enabled: true }
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
  const width = config.width ?? 500
  const height = config.height ?? 500
  const title = config.title ?? 'Pie Chart'

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
