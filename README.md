# 🌊 VizFlow.js

TypeScript library for generating charts, tables and dashboard-ready visualizations.

VizFlow.js provides a programmatic Core API and a conversational CLI wizard to create clean HTML visualizations from data.

---

## Packages

| Package | Description |
|---|---|
| `@smolina-dev/vizflow-core` | Core library for charts, tables, dashboard components, themes and output helpers |
| `@smolina-dev/vizflow-cli` | CLI wizard for generating visualizations from the terminal |

---

## Highlights

- Charts powered by Chart.js:
  - Bar
  - Line
  - Pie
  - Scatter
  - Area
  - Horizontal Bar
  - Doughnut

- Dashboard components:
  - Metric Card
  - Progress Bar
  - Heatmap

- Enhanced tables:
  - Search
  - Sorting
  - Pagination
  - Titles and subtitles
  - Column alignment
  - Numeric formatting
  - Compact or comfortable density

- Built-in themes:
  - `light`
  - `dark`
  - `hot`
  - `cold`
  - `corporate`
  - `emerald`
  - `midnight`
  - `sunset`
  - `ocean`
  - `rose`
  - `forest`

- Data helpers:
  - CSV parser
  - JSON parser
  - Inline data support

- Output helpers:
  - Standalone HTML files
  - Embeddable snippets

---

## Installation

### Core

```bash
npm install @smolina-dev/vizflow-core
CLI
npm install -g @smolina-dev/vizflow-cli

Or run it directly:

npx @smolina-dev/vizflow-cli
Quick Start
import { barChart, toHtmlFile } from '@smolina-dev/vizflow-core'
import { writeFileSync } from 'node:fs'

const output = barChart({
  type: 'bar',
  title: 'Monthly Sales',
  subtitle: 'Revenue by month',
  xKey: 'month',
  yKey: 'sales',
  data: {
    kind: 'inline',
    rows: [
      { month: 'Jan', sales: 1200 },
      { month: 'Feb', sales: 950 },
      { month: 'Mar', sales: 1400 },
    ],
  },
  format: {
    y: {
      type: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    },
  },
})

const html = toHtmlFile(output, {
  title: 'Sales Dashboard',
  theme: 'corporate',
  includeChartJs: true,
})

writeFileSync('sales.html', html)
Charts
import {
  barChart,
  lineChart,
  pieChart,
  scatterChart,
  areaChart,
  horizontalBarChart,
  doughnutChart,
} from '@smolina-dev/vizflow-core'
Area Chart
const output = areaChart({
  type: 'area',
  title: 'Revenue Trend',
  subtitle: 'Quarterly growth',
  xKey: 'quarter',
  yKey: 'revenue',
  data: {
    kind: 'inline',
    rows: [
      { quarter: 'Q1', revenue: 12000 },
      { quarter: 'Q2', revenue: 18000 },
      { quarter: 'Q3', revenue: 24000 },
    ],
  },
})
Horizontal Bar Chart
const output = horizontalBarChart({
  type: 'horizontalBar',
  title: 'Top Products',
  xKey: 'product',
  yKey: 'sales',
  data: {
    kind: 'inline',
    rows: [
      { product: 'Product A', sales: 450 },
      { product: 'Product B', sales: 380 },
      { product: 'Product C', sales: 290 },
    ],
  },
})
Doughnut Chart
const output = doughnutChart({
  type: 'doughnut',
  title: 'Sales by Channel',
  xKey: 'channel',
  yKey: 'sales',
  data: {
    kind: 'inline',
    rows: [
      { channel: 'Retail', sales: 45 },
      { channel: 'Online', sales: 30 },
      { channel: 'Wholesale', sales: 25 },
    ],
  },
})
Dashboard Components
import {
  metricCard,
  progressBar,
  heatmap,
} from '@smolina-dev/vizflow-core'
Metric Card
const output = metricCard({
  title: 'Total Sales',
  subtitle: 'Current month',
  value: 125000,
  valueFormat: {
    type: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  },
  trend: {
    value: 12.5,
    direction: 'up',
    label: 'vs previous month',
  },
})
Progress Bar
const output = progressBar({
  title: 'Goal Completion',
  subtitle: 'Monthly target',
  value: 78,
  max: 100,
  variant: 'success',
})
Heatmap
const output = heatmap({
  title: 'Weekly Activity',
  subtitle: 'Activity by product and day',
  rows: ['Product A', 'Product B', 'Product C'],
  columns: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  values: [
    [10, 25, 18, 30, 42],
    [5, 12, 9, 15, 21],
    [30, 35, 28, 45, 50],
  ],
  colorScale: 'green',
})
Enhanced Tables
import { table } from '@smolina-dev/vizflow-core'

const output = table(
  {
    title: 'Customer Ranking',
    subtitle: 'Sorted by monthly sales',
    columns: [
      { key: 'customer', label: 'Customer' },
      {
        key: 'sales',
        label: 'Sales',
        align: 'right',
        format: {
          type: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        },
      },
    ],
    data: {
      kind: 'inline',
      rows: [
        { customer: 'Customer A', sales: 125000 },
        { customer: 'Customer B', sales: 87500 },
      ],
    },
  },
  {
    pageSize: 10,
    searchable: true,
    density: 'comfortable',
  }
)
Value Formatting

Supported value formats:

Type	Description
number	Localized number
currency	Localized currency
percent	Percentage
compact	Compact notation such as 1.2K or 3.4M

Example:

{
  type: 'currency',
  currency: 'GTQ',
  locale: 'es-GT',
  maximumFractionDigits: 0,
}
Themes

VizFlow includes 11 built-in themes ready to use in standalone HTML files and CLI-generated visualizations.

Theme	Palette	Description	Best for
light	⚪ 🟣 🟢	Clean light interface	General reports and simple dashboards
dark	⚫ 🟣 🟡	Dark dashboard interface	Internal dashboards and dark layouts
hot	🔴 🟠 🟡	Warm red/orange palette	Impact charts and urgent indicators
cold	🔵 🟦 🟢	Cool blue/cyan palette	Technical or analytical reports
corporate	🔵 ⚪ ⚫	Professional blue/gray business theme	Executive dashboards
emerald	🟢 ⚪ 🟩	Growth-focused green theme	Sales, growth and positive KPIs
midnight	⚫ 🟣 🟦	Premium dark dashboard theme	Modern dashboards and presentations
sunset	🟠 🌹 🟡	Warm presentation-ready theme	Visual reports and storytelling
ocean	🌊 🔵 🟢	Deep marine analytics theme	Dark analytics dashboards
rose	🌹 🔴 ⚪	Elegant rose/crimson theme	Polished presentations and executive views
forest	🌲 🟢 🟤	Earthy dark green theme	Environmental, natural or sustainability dashboards

Use a theme with toHtmlFile():

const html = toHtmlFile(output, {
  title: 'My Dashboard',
  theme: 'ocean',
  includeChartJs: true,
})

The same theme names are available from the CLI wizard.

Output Helpers
Standalone HTML
const html = toHtmlFile(output, {
  title: 'My Dashboard',
  theme: 'midnight',
  includeChartJs: true,
})

Use includeChartJs: true for chart visualizations.

Use includeChartJs: false for:

Tables
Metric Cards
Progress Bars
Heatmaps
Embed Snippet
import { toEmbedSnippet } from '@smolina-dev/vizflow-core'

const snippet = toEmbedSnippet(output, {
  includeChartJs: true,
})
CLI Wizard
npx @smolina-dev/vizflow-cli

Available generators:

/chart       — Generate charts
/table       — Generate searchable tables
/heatmap     — Generate heatmaps
/components  — Generate metric cards and progress bars

The CLI supports:

Manual data entry
CSV files
JSON files
Premium themes
Value formatting
Table search
Heatmap color scales
Safe file overwrite confirmation
CSV Support

The CSV parser supports:

Quoted values
Commas inside quoted fields
Escaped quotes
Multiline quoted fields
CRLF and LF line endings
Boolean, null and numeric inference

Example:

month,sales
Jan,1200
Feb,950
Mar,1400
JSON Support
[
  { "month": "Jan", "sales": 1200 },
  { "month": "Feb", "sales": 950 },
  { "month": "Mar", "sales": 1400 }
]
Development

Install dependencies:

pnpm install

Run tests:

pnpm test

Build all packages:

pnpm build

Build core:

pnpm --filter @smolina-dev/vizflow-core build

Build CLI:

pnpm --filter @smolina-dev/vizflow-cli build
Changelog

See CHANGELOG.md.

License

MIT