import type {
  ColumnDef,
  TableColumnAlign,
  TableConfig,
  TableDensity,
  ValueFormatOptions,
  VizFlowOutput,
} from '../types/index.js'
import {
  generateId,
  resolveData,
  resolveValueFormatOptions,
  sanitizeBoolean,
  sanitizeInteger,
} from '../charts/shared.js'
import { escapeHtml } from '../utils/escape.js'

// ─── Extended config for table ────────────────────────────────────

export interface TableOptions {
  /** Number of rows per page — defaults to 10, set to 0 to disable pagination */
  pageSize?: number
  /** Enable client-side search — defaults to true */
  searchable?: boolean
  /** Placeholder shown inside the search box */
  searchPlaceholder?: string
  /** Visual density for table rows — defaults to comfortable */
  density?: TableDensity
}

// ─── Value formatting ─────────────────────────────────────────────

function formatTableValue(
  value: string | number | boolean | null | undefined,
  format?: ValueFormatOptions
): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (!format || typeof value !== 'number' || !Number.isFinite(value)) {
    return String(value)
  }

  const resolved = resolveValueFormatOptions(format)

  const formatterOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: resolved.minimumFractionDigits,
    maximumFractionDigits: resolved.maximumFractionDigits,
  }

  if (resolved.type === 'currency') {
    formatterOptions.style = 'currency'
    formatterOptions.currency = resolved.currency
  }

  if (resolved.type === 'percent') {
    formatterOptions.style = 'percent'
  }

  if (resolved.type === 'compact') {
    formatterOptions.notation = 'compact'
    formatterOptions.compactDisplay = 'short'
  }

  try {
    return (
      resolved.prefix +
      new Intl.NumberFormat(resolved.locale, formatterOptions).format(value) +
      resolved.suffix
    )
  } catch {
    return resolved.prefix + String(value) + resolved.suffix
  }
}

function resolveColumnAlign(align: TableColumnAlign | undefined): TableColumnAlign {
  if (align === 'center' || align === 'right') {
    return align
  }

  return 'left'
}

function resolveDensity(density: TableDensity | undefined): TableDensity {
  if (density === 'compact') {
    return 'compact'
  }

  return 'comfortable'
}

// ─── HTML builders ────────────────────────────────────────────────

function buildHeaderCell(col: ColumnDef): string {
  const isSortable = col.sortable !== false
  const className = isSortable ? ' class="vf-sortable"' : ''
  const widthStyle = col.width ? ` style="width:${escapeHtml(col.width)}"` : ''
  const sortIcon = isSortable ? '<span class="vf-sort-icon">↕</span>' : ''
  const align = resolveColumnAlign(col.align)

  return `<th data-key="${escapeHtml(col.key)}" data-align="${align}" aria-sort="none"${className}${widthStyle}>${escapeHtml(col.label)}${sortIcon}</th>`
}

function buildToolbarHtml(
  id: string,
  searchable: boolean,
  searchPlaceholder: string
): string {
  if (!searchable) {
    return `<div class="vf-table-count" id="vf-count-${id}"></div>`
  }

  return `
<div class="vf-table-toolbar">
  <label class="vf-table-search-label" for="vf-search-${id}">Search table</label>
  <input
    id="vf-search-${id}"
    class="vf-table-search"
    type="search"
    placeholder="${escapeHtml(searchPlaceholder)}"
    autocomplete="off"
  />
  <div class="vf-table-count" id="vf-count-${id}"></div>
</div>
  `.trim()
}

function buildTableHeaderHtml(config: TableConfig): string {
  const safeTitle = config.title ? escapeHtml(config.title) : ''
  const safeSubtitle = config.subtitle ? escapeHtml(config.subtitle) : ''

  if (!safeTitle && !safeSubtitle) {
    return ''
  }

  return `
<div class="vf-table-header">
  <div>
    ${safeTitle ? `<h2 class="vf-table-title">${safeTitle}</h2>` : ''}
    ${
      safeSubtitle
        ? `<p class="vf-table-subtitle">${safeSubtitle}</p>`
        : ''
    }
  </div>
</div>
  `.trim()
}

function buildTableRowsHtml(config: TableConfig): string {
  const rows = resolveData(config)
  const columns = config.columns

  return rows
    .map(row => {
      const cells = columns
        .map(col => {
          const align = resolveColumnAlign(col.align)
          const formattedValue = formatTableValue(row[col.key], col.format)

          return `<td data-align="${align}">${escapeHtml(formattedValue)}</td>`
        })
        .join('\n        ')

      return `<tr data-vf-row="true">\n        ${cells}\n      </tr>`
    })
    .join('\n      ')
}

function buildTableHtml(
  id: string,
  config: TableConfig,
  options: TableOptions
): string {
  const columns = config.columns
  const pageSize = sanitizeInteger(options.pageSize ?? config.pageSize, 10, {
    min: 0,
  })
  const searchable = sanitizeBoolean(options.searchable, true)
  const density = resolveDensity(options.density)
  const searchPlaceholder = options.searchPlaceholder ?? 'Search rows...'

  const headers = columns.map(buildHeaderCell).join('\n      ')
  const bodyRows = buildTableRowsHtml(config)
  const header = buildTableHeaderHtml(config)
  const toolbar = buildToolbarHtml(id, searchable, searchPlaceholder)

  return `
<div id="vf-table-${id}" class="vf-table-wrapper vf-table-density-${density}">
  <div class="vf-table-card">
    <div class="vf-table-topbar">
      ${header}
      ${toolbar}
    </div>

    <div class="vf-table-scroll">
      <table class="vf-table">
        ${
          config.title
            ? `<caption class="vf-table-caption">${escapeHtml(config.title)}</caption>`
            : ''
        }
        <thead>
          <tr>
          ${headers}
          </tr>
        </thead>
        <tbody id="vf-tbody-${id}">
          ${bodyRows}
          <tr id="vf-empty-${id}" class="vf-empty-row">
            <td colspan="${columns.length}">No rows match your search.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="vf-pagination-${id}" class="vf-pagination">
      <button id="vf-prev-${id}" class="vf-page-btn" type="button" aria-label="Previous page">← Prev</button>
      <span id="vf-page-info-${id}" class="vf-page-info"></span>
      <button id="vf-next-${id}" class="vf-page-btn" type="button" aria-label="Next page">Next →</button>
    </div>
  </div>
</div>
<script>
(function () {
  const wrapper = document.getElementById('vf-table-${id}')
  const tbody = document.getElementById('vf-tbody-${id}')
  const prevBtn = document.getElementById('vf-prev-${id}')
  const nextBtn = document.getElementById('vf-next-${id}')
  const pageInfo = document.getElementById('vf-page-info-${id}')
  const countInfo = document.getElementById('vf-count-${id}')
  const searchInput = document.getElementById('vf-search-${id}')
  const emptyRow = document.getElementById('vf-empty-${id}')
  const PAGE_SIZE = ${pageSize}
  const TABLE_SEARCHABLE = ${searchable}
  const TOTAL_ROWS = ${resolveData(config).length}

  let allRows = Array.from(tbody.querySelectorAll('tr[data-vf-row="true"]'))
  let filteredRows = allRows.slice()
  let lastKey = null
  let ascending = true
  let currentPage = 1

  function totalPages () {
    if (PAGE_SIZE === 0) return 1
    return Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  }

  function updateCount () {
    if (!countInfo) return

    const visibleRows = filteredRows.length
    countInfo.textContent = 'Showing ' + visibleRows + ' of ' + TOTAL_ROWS + ' rows'
  }

  function hideAllRows () {
    allRows.forEach(function (row) {
      row.style.display = 'none'
    })
  }

  function renderPage () {
    hideAllRows()

    const hasRows = filteredRows.length > 0
    emptyRow.style.display = hasRows ? 'none' : ''

    if (PAGE_SIZE === 0) {
      filteredRows.forEach(function (row) {
        row.style.display = ''
      })

      pageInfo.textContent = ''
      prevBtn.style.display = 'none'
      nextBtn.style.display = 'none'
      updateCount()
      return
    }

    const pages = totalPages()
    currentPage = Math.min(Math.max(currentPage, 1), pages)

    const start = (currentPage - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE

    filteredRows.forEach(function (row, index) {
      row.style.display = index >= start && index < end ? '' : 'none'
    })

    pageInfo.textContent = hasRows ? 'Page ' + currentPage + ' of ' + pages : 'Page 0 of 0'
    prevBtn.disabled = currentPage === 1 || !hasRows
    nextBtn.disabled = currentPage === pages || !hasRows
    updateCount()
  }

  function applySearch () {
    const query = TABLE_SEARCHABLE && searchInput
      ? searchInput.value.trim().toLowerCase()
      : ''

    filteredRows = query
      ? allRows.filter(function (row) {
          return row.textContent.toLowerCase().includes(query)
        })
      : allRows.slice()

    currentPage = 1
    renderPage()
  }

  // ── Search ─────────────────────────────────────────────────────
  if (TABLE_SEARCHABLE && searchInput) {
    searchInput.addEventListener('input', applySearch)
  }

  // ── Sorting ───────────────────────────────────────────────────
  wrapper.querySelectorAll('th.vf-sortable').forEach(function (th) {
    th.style.cursor = 'pointer'

    th.addEventListener('click', function () {
      const key = th.getAttribute('data-key')
      ascending = lastKey === key ? !ascending : true
      lastKey = key
      currentPage = 1

      const colIndex = Array.from(th.parentElement.children).indexOf(th)

      allRows.sort(function (a, b) {
        const aVal = a.children[colIndex].textContent.trim()
        const bVal = b.children[colIndex].textContent.trim()
        const aNum = Number(aVal.replace(/[^0-9.-]/g, ''))
        const bNum = Number(bVal.replace(/[^0-9.-]/g, ''))
        const isNum = Number.isFinite(aNum) && Number.isFinite(bNum) && aVal !== '' && bVal !== ''
        const cmp = isNum ? aNum - bNum : aVal.localeCompare(bVal)
        return ascending ? cmp : -cmp
      })

      allRows.forEach(function (row) {
        tbody.appendChild(row)
      })
      tbody.appendChild(emptyRow)

      wrapper.querySelectorAll('th[aria-sort]').forEach(function (header) {
        header.setAttribute('aria-sort', 'none')
      })

      wrapper.querySelectorAll('th .vf-sort-icon').forEach(function (icon) {
        icon.textContent = '↕'
      })

      th.setAttribute('aria-sort', ascending ? 'ascending' : 'descending')
      th.querySelector('.vf-sort-icon').textContent = ascending ? '↑' : '↓'

      applySearch()
    })
  })

  // ── Pagination controls ───────────────────────────────────────
  prevBtn.addEventListener('click', function () {
    if (currentPage > 1) {
      currentPage--
      renderPage()
    }
  })

  nextBtn.addEventListener('click', function () {
    if (currentPage < totalPages()) {
      currentPage++
      renderPage()
    }
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
  font-family: var(--vf-font, system-ui, sans-serif);
  color: var(--vf-text, #111827);
  box-sizing: border-box;
}

#vf-table-${id} .vf-table-card {
  width: 100%;
  overflow: hidden;
  background: var(--vf-surface, #ffffff);
  border: 1px solid var(--vf-border, #e5e7eb);
  border-radius: var(--vf-radius, 12px);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  box-sizing: border-box;
}

#vf-table-${id} .vf-table-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 18px 14px 18px;
  border-bottom: 1px solid var(--vf-border, #e5e7eb);
}

#vf-table-${id} .vf-table-header {
  min-width: 0;
}

#vf-table-${id} .vf-table-title {
  margin: 0;
  color: var(--vf-text, #111827);
  font-size: 1.05rem;
  line-height: 1.35;
  font-weight: 750;
  letter-spacing: -0.01em;
}

#vf-table-${id} .vf-table-subtitle {
  margin: 4px 0 0 0;
  color: var(--vf-text-muted, #6b7280);
  font-size: 0.875rem;
  line-height: 1.45;
}

#vf-table-${id} .vf-table-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-left: auto;
}

#vf-table-${id} .vf-table-search-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

#vf-table-${id} .vf-table-search {
  min-width: 220px;
  max-width: 100%;
  border: 1px solid var(--vf-border, #e5e7eb);
  border-radius: 999px;
  background: var(--vf-background, #ffffff);
  color: var(--vf-text, #111827);
  padding: 8px 13px;
  font: inherit;
  font-size: 0.86rem;
  outline: none;
}

#vf-table-${id} .vf-table-search:focus {
  border-color: var(--vf-primary, #6366f1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--vf-primary, #6366f1) 18%, transparent);
}

#vf-table-${id} .vf-table-count {
  color: var(--vf-text-muted, #6b7280);
  font-size: 0.8rem;
  line-height: 1.35;
  white-space: nowrap;
}

#vf-table-${id} .vf-table-scroll {
  width: 100%;
  overflow-x: auto;
}

#vf-table-${id} .vf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

#vf-table-${id} .vf-table-caption {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

#vf-table-${id} .vf-table thead th {
  background: var(--vf-background, #f9fafb);
  color: var(--vf-text-muted, #6b7280);
  padding: 11px 14px;
  text-align: left;
  font-weight: 750;
  white-space: nowrap;
  user-select: none;
  border-bottom: 1px solid var(--vf-border, #e5e7eb);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

#vf-table-${id} .vf-table thead th[data-align="center"],
#vf-table-${id} .vf-table tbody td[data-align="center"] {
  text-align: center;
}

#vf-table-${id} .vf-table thead th[data-align="right"],
#vf-table-${id} .vf-table tbody td[data-align="right"] {
  text-align: right;
}

#vf-table-${id} .vf-table thead th .vf-sort-icon {
  margin-left: 6px;
  font-size: 0.75rem;
  opacity: 0.75;
}

#vf-table-${id} .vf-table tbody tr:nth-child(even) {
  background: color-mix(in srgb, var(--vf-background, #f9fafb) 70%, transparent);
}

#vf-table-${id} .vf-table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--vf-border, #e5e7eb);
  color: var(--vf-text, #111827);
  vertical-align: middle;
}

#vf-table-${id}.vf-table-density-compact .vf-table tbody td {
  padding-top: 8px;
  padding-bottom: 8px;
}

#vf-table-${id}.vf-table-density-compact .vf-table thead th {
  padding-top: 9px;
  padding-bottom: 9px;
}

#vf-table-${id} .vf-table tbody tr:hover {
  background: var(--vf-row-hover, #ede9fe);
}

#vf-table-${id} .vf-empty-row td {
  padding: 26px 14px;
  text-align: center;
  color: var(--vf-text-muted, #6b7280);
  background: var(--vf-surface, #ffffff);
}

#vf-table-${id} .vf-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 18px;
  border-top: 1px solid var(--vf-border, #e5e7eb);
}

#vf-table-${id} .vf-page-btn {
  background: var(--vf-primary, #6366f1);
  color: var(--vf-on-primary, #ffffff);
  border: none;
  border-radius: var(--vf-radius, 8px);
  padding: 7px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
}

#vf-table-${id} .vf-page-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

#vf-table-${id} .vf-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

#vf-table-${id} .vf-page-info {
  font-size: 0.85rem;
  color: var(--vf-text-muted, #6b7280);
  min-width: 100px;
  text-align: center;
}

@media (max-width: 640px) {
  #vf-table-${id} .vf-table-topbar {
    flex-direction: column;
    align-items: stretch;
  }

  #vf-table-${id} .vf-table-toolbar {
    justify-content: flex-start;
  }

  #vf-table-${id} .vf-table-search {
    width: 100%;
    min-width: 0;
  }
}
  `.trim()
}

// ─── Main generator ───────────────────────────────────────────────

/**
 * Generates an HTML table with client-side sorting, searching and pagination from a TableConfig.
 *
 * @param config  - Table configuration object
 * @param options - Optional table settings
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