import { ChartConfig, VizFlowOutput, DataRow } from '../types/index.js'
import { parseJson } from '../parsers/json.js'
import { parseCsv } from '../parsers/csv.js'

// ─── Data resolver ────────────────────────────────────────────────

/**
 * Resolves the DataSource from a ChartConfig into a DataRow array.
 * Only supports inline data at this stage — file resolution
 * will be added in the CLI phase.
 */
function resolveData(config: ChartConfig): DataRow[] {
  const { data } = config

  if (data.kind === 'inline') {
    return data.rows
  }

  throw new Error(
    '[VizFlow] File-based DataSource is only supported via the CLI. Use kind: "inline" for programmatic usage.'
  )
}

// ─── Label and value extractors ───────────────────────────────────

/** Extracts an array of X axis labels from the resolved rows */
function extractLabels(rows: DataRow[], xKey: string): string[] {
  return rows.map(row => String(row[xKey] ?? ''))
}

/** Extracts an array of numeric Y axis values from the resolved rows */
function extractValues(rows: DataRow[], yKey: string): number[] {
  return rows.map((row, index) => {
    const value = row[yKey]
    if (typeof value !== 'number') {
      throw new Error(
        `[VizFlow] Bar chart: value at row ${index} for key "${yKey}" is not a number`
      )
    }
    return value
  })
}

// ─── CSS builder ──────────────────────────────────────────────────

/** Generates scoped CSS for the bar chart wrapper */
function buildCss(id: string, width: number, height: number): string {
  return `
#vf-${id} {
  width: ${width}px;
  height: ${height}px;
  position: relative;
  font-family: var(--vf-font, sans-serif);
  background: var(--vf-background, #ffffff);
  border-radius: var(--vf-radius, 8px);
  padding: 16px;
  box-sizing: border-box;
}
#vf-${id} canvas {
  width: 100% !important;
  height: 100% !important;
}
  `.trim()
}

// ─── HTML builder ─────────────────────────────────────────────────

/** Generates the HTML + inline script that initializes the Chart.js bar chart */
function buildHtml(
  id: string,
  labels: string[],
  values: number[],
  title: string
): string {
  return `
<div id="vf-${id}">
  <canvas id="vf-canvas-${id}"></canvas>
</div>
<script type="module">
  import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

  Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

  const ctx = document.getElementById('vf-canvas-${id}')

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [{
        label: '${title}',
        data: ${JSON.stringify(values)},
        backgroundColor: 'var(--vf-primary, #6366f1)',
        borderRadius: 4,
        borderSkipped: false,
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
  const id = crypto.randomUUID().slice(0, 8)
  const width = config.width ?? 600
  const height = config.height ?? 400
  const title = config.title ?? 'Bar Chart'

  const rows = resolveData(config)
  const labels = extractLabels(rows, config.xKey)
  const values = extractValues(rows, config.yKey)

  const html = buildHtml(id, labels, values, title)
  const css = buildCss(id, width, height)

  return {
    html,
    css,
    render: () => `<style>${css}</style>\n${html}`,
  }
}
