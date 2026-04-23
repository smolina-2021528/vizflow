import {
  barChart,
  lineChart,
  pieChart,
  scatterChart,
  table,
} from '@vizflow/core'

// ─── Sample data ──────────────────────────────────────────────────

const salesData = {
  type: 'bar' as const,
  title: 'Monthly Sales 2024',
  xKey: 'month',
  yKey: 'sales',
  data: {
    kind: 'inline' as const,
    rows: [
      { month: 'Jan', sales: 1200 },
      { month: 'Feb', sales: 950 },
      { month: 'Mar', sales: 1400 },
      { month: 'Apr', sales: 1100 },
      { month: 'May', sales: 1800 },
      { month: 'Jun', sales: 2100 },
    ],
  },
}

const tempData = {
  type: 'line' as const,
  title: 'Temperature 2024',
  xKey: 'month',
  yKey: 'temp',
  data: {
    kind: 'inline' as const,
    rows: [
      { month: 'Jan', temp: 18 },
      { month: 'Feb', temp: 20 },
      { month: 'Mar', temp: 24 },
      { month: 'Apr', temp: 28 },
      { month: 'May', temp: 30 },
      { month: 'Jun', temp: 32 },
    ],
  },
}

const expenseData = {
  type: 'pie' as const,
  title: 'Expense Distribution',
  xKey: 'category',
  yKey: 'amount',
  data: {
    kind: 'inline' as const,
    rows: [
      { category: 'Rent', amount: 4500 },
      { category: 'Food', amount: 2000 },
      { category: 'Transport', amount: 800 },
      { category: 'Entertainment', amount: 600 },
      { category: 'Savings', amount: 1200 },
    ],
  },
}

const scatterData = {
  type: 'scatter' as const,
  title: 'Height vs Weight',
  xKey: 'height',
  yKey: 'weight',
  data: {
    kind: 'inline' as const,
    rows: [
      { height: 155, weight: 55 },
      { height: 162, weight: 63 },
      { height: 170, weight: 72 },
      { height: 175, weight: 80 },
      { height: 180, weight: 85 },
      { height: 185, weight: 90 },
    ],
  },
}

const tableData = {
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'country', label: 'Country' },
    { key: 'sales', label: 'Sales' },
    { key: 'growth', label: 'Growth %' },
  ],
  data: {
    kind: 'inline' as const,
    rows: [
      { name: 'Ana García', country: 'Guatemala', sales: 45000, growth: 12 },
      { name: 'Carlos López', country: 'México', sales: 38000, growth: 8 },
      { name: 'María Pérez', country: 'Colombia', sales: 52000, growth: 15 },
      { name: 'Juan Martínez', country: 'Argentina', sales: 29000, growth: 5 },
      { name: 'Laura Sánchez', country: 'Chile', sales: 61000, growth: 20 },
    ],
  },
}

// ─── Mount helper that executes scripts ───────────────────────────

function mount(id: string, html: string): void {
  const el = document.getElementById(id)
  if (!el) return

  el.innerHTML = html

  // Re-execute all script tags injected via innerHTML
  el.querySelectorAll('script').forEach(oldScript => {
    const newScript = document.createElement('script')
    Array.from(oldScript.attributes).forEach(attr =>
      newScript.setAttribute(attr.name, attr.value)
    )
    newScript.textContent = oldScript.textContent
    oldScript.parentNode?.replaceChild(newScript, oldScript)
  })
}

// ─── Render all components ────────────────────────────────────────

mount('bar-container', barChart(salesData).render())
mount('line-container', lineChart(tempData).render())
mount('pie-container', pieChart(expenseData).render())
mount('scatter-container', scatterChart(scatterData).render())
mount('table-container', table(tableData).render())
