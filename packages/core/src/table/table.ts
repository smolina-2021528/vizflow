import { TableConfig, VizFlowOutput } from '../types/index.js'
import { resolveData } from '../charts/shared.js'

// ─── Extended config for table ────────────────────────────────────

export interface TableOptions {
  /** Number of rows per page — defaults to 10, set to 0 to disable pagination */
  pageSize?: number
}

// ─── HTML builder ─────────────────────────────────────────────────

function buildTableHtml(
  id: string,
  config: TableConfig,
  options: TableOptions
): string {
  const rows = resolveData(config)
  const columns = config.columns
  const pageSize = options.pageSize ?? 10

  const headers = columns
    .map(
      col =>
        `<th data-key="${col.key}" class="vf-sortable">${col.label}<span class="vf-sort-icon">↕</span></th>`
    )
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
    <tbody id="vf-tbody-${id}">
      ${bodyRows}
    </tbody>
  </table>
  <div id="vf-pagination-${id}" class="vf-pagination">
    <button id="vf-prev-${id}" class="vf-page-btn">← Prev</button>
    <span id="vf-page-info-${id}" class="vf-page-info"></span>
    <button id="vf-next-${id}" class="vf-page-btn">Next →</button>
  </div>
</div>
<script>
(function () {
  const wrapper   = document.getElementById('vf-table-${id}')
  const tbody     = document.getElementById('vf-tbody-${id}')
  const prevBtn   = document.getElementById('vf-prev-${id}')
  const nextBtn   = document.getElementById('vf-next-${id}')
  const pageInfo  = document.getElementById('vf-page-info-${id}')
  const PAGE_SIZE = ${pageSize}

  let allRows   = Array.from(tbody.querySelectorAll('tr'))
  let lastKey   = null
  let ascending = true
  let currentPage = 1

  function totalPages () {
    if (PAGE_SIZE === 0) return 1
    return Math.max(1, Math.ceil(allRows.length / PAGE_SIZE))
  }

  function renderPage () {
    if (PAGE_SIZE === 0) {
      allRows.forEach(function (r) { r.style.display = '' })
      pageInfo.textContent = ''
      prevBtn.style.display = 'none'
      nextBtn.style.display = 'none'
      return
    }

    const start = (currentPage - 1) * PAGE_SIZE
    const end   = start + PAGE_SIZE

    allRows.forEach(function (r, i) {
      r.style.display = i >= start && i < end ? '' : 'none'
    })

    pageInfo.textContent = 'Page ' + currentPage + ' of ' + totalPages()
    prevBtn.disabled = currentPage === 1
    nextBtn.disabled = currentPage === totalPages()
  }

  // ── Sorting ───────────────────────────────────────────────────
  wrapper.querySelectorAll('th.vf-sortable').forEach(function (th) {
    th.style.cursor = 'pointer'
    th.addEventListener('click', function () {
      const key = th.getAttribute('data-key')
      ascending  = lastKey === key ? !ascending : true
      lastKey    = key
      currentPage = 1

      const colIndex = Array.from(th.parentElement.children).indexOf(th)

      allRows.sort(function (a, b) {
        const aVal = a.children[colIndex].textContent.trim()
        const bVal = b.children[colIndex].textContent.trim()
        const aNum = parseFloat(aVal)
        const bNum = parseFloat(bVal)
        const isNum = !isNaN(aNum) && !isNaN(bNum)
        const cmp  = isNum ? aNum - bNum : aVal.localeCompare(bVal)
        return ascending ? cmp : -cmp
      })

      allRows.forEach(function (row) { tbody.appendChild(row) })

      wrapper.querySelectorAll('th .vf-sort-icon').forEach(function (icon) {
        icon.textContent = '↕'
      })
      th.querySelector('.vf-sort-icon').textContent = ascending ? '↑' : '↓'

      renderPage()
    })
  })

  // ── Pagination controls ───────────────────────────────────────
  prevBtn.addEventListener('click', function () {
    if (currentPage > 1) { currentPage--; renderPage() }
  })

  nextBtn.addEventListener('click', function () {
    if (currentPage < totalPages()) { currentPage++; renderPage() }
  })

  renderPage()
})()
</script>
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
  user-select: none;
}

#vf-table-${id} .vf-table thead th .vf-sort-icon {
  margin-left: 6px;
  font-size: 0.75rem;
  opacity: 0.8;
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

#vf-table-${id} .vf-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}

#vf-table-${id} .vf-page-btn {
  background: var(--vf-primary, #6366f1);
  color: var(--vf-on-primary, #ffffff);
  border: none;
  border-radius: var(--vf-radius, 6px);
  padding: 6px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: opacity 0.15s;
}

#vf-table-${id} .vf-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

#vf-table-${id} .vf-page-info {
  font-size: 0.85rem;
  color: var(--vf-text, #111827);
  min-width: 100px;
  text-align: center;
}
  `.trim()
}

// ─── ID generator ─────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID().slice(0, 8)
}

// ─── Main generator ───────────────────────────────────────────────

/**
 * Generates an HTML table with client-side sorting and pagination from a TableConfig.
 *
 * @param config  - Table configuration object
 * @param options - Optional table settings (pageSize)
 * @returns VizFlowOutput ready to insert into the DOM
 */
export function table(
  config: TableConfig,
  options: TableOptions = {}
): VizFlowOutput {
  const id = generateId()

  const html = buildTableHtml(id, config, options)
  const css = buildTableCss(id)

  return {
    html,
    css,
    render: () => `<style>${css}</style>\n${html}`,
  }
}
