import { TableConfig, VizFlowOutput } from '../types/index.js'
import { resolveData } from '../charts/shared.js'

// ─── HTML builder ─────────────────────────────────────────────────
function buildTableHtml(id: string, config: TableConfig): string {
  const rows = resolveData(config)
  const columns = config.columns

  const headers = columns
    .map(col => `<th data-key="${col.key}">${col.label}</th>`)
    .join('\n      ')

  const bodyRows = rows
    .map(row => {
      const cells = columns
        .map(col => `<td>${row[col.key] ?? ''}</td>`)
        .join('\n        ')
      return `<tr>\n        ${cells}\n      </tr>`
    })
    .join('\n      ')

  return `
<div id="vf-table-${id}" class="vf-table-wrapper">
  <table class="vf-table">
    <thead>
      <tr>
      ${headers}
      </tr>
    </thead>
    <tbody>
      ${bodyRows}
    </tbody>
  </table>
</div>
  `.trim()
}

// ─── CSS builder ──────────────────────────────────────────────────
function buildTableCss(id: string): string {
  return `
#vf-table-${id}.vf-table-wrapper {
  width: 100%;
  overflow-x: auto;
  font-family: var(--vf-font, sans-serif);
  border-radius: var(--vf-radius, 8px);
  background: var(--vf-background, #ffffff);
  padding: 16px;
  box-sizing: border-box;
}

#vf-table-${id} .vf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

#vf-table-${id} .vf-table thead th {
  background: var(--vf-primary, #6366f1);
  color: var(--vf-on-primary, #ffffff);
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
}

#vf-table-${id} .vf-table tbody tr:nth-child(even) {
  background: var(--vf-row-alt, #f5f5f5);
}

#vf-table-${id} .vf-table tbody td {
  padding: 9px 14px;
  border-bottom: 1px solid var(--vf-border, #e5e7eb);
  color: var(--vf-text, #111827);
}

#vf-table-${id} .vf-table tbody tr:hover {
  background: var(--vf-row-hover, #ede9fe);
}
  `.trim()
}

// ─── ID generator ─────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID().slice(0, 8)
}

// ─── Main generator ───────────────────────────────────────────────

/**
 * Generates an HTML table from a TableConfig.
 *
 * @param config - Table configuration object
 * @returns VizFlowOutput ready to insert into the DOM
 */
export function table(config: TableConfig): VizFlowOutput {
  const id = generateId()

  const html = buildTableHtml(id, config)
  const css = buildTableCss(id)

  return {
    html,
    css,
    render: () => `<style>${css}</style>\n${html}`,
  }
}
