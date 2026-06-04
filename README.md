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
```

### CLI

```bash
npm install -g @smolina-dev/vizflow-cli
```

Or run it directly:

```bash
npx @smolina-dev/vizflow-cli
```

---

## Quick Start

```ts
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
```

---

## Charts

```ts
import {
  barChart,
  lineChart,
  pieChart,
  scatterChart,
  areaChart,
  horizontalBarChart,
  doughnutChart,
} from '@smolina-dev/vizflow-core'
```

### Area Chart

```ts
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
```

### Horizontal Bar Chart

```ts
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
```

### Doughnut Chart

```ts
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
```

---

## Dashboard Components

```ts
import {
  metricCard,
  progressBar,
  heatmap,
} from '@smolina-dev/vizflow-core'
```

### Metric Card

```ts
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
```

### Progress Bar

```ts
const output = progressBar({
  title: 'Goal Completion',
  subtitle: 'Monthly target',
  value: 78,
  max: 100,
  variant: 'success',
})
```

### Heatmap

```ts
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
```

---

## Enhanced Tables

```ts
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
```

---

## Value Formatting

Supported value formats:

| Type | Description |
|---|---|
| `number` | Localized number |
| `currency` | Localized currency |
| `percent` | Percentage |
| `compact` | Compact notation such as `1.2K` or `3.4M` |

Example:

```ts
{
  type: 'currency',
  currency: 'GTQ',
  locale: 'es-GT',
  maximumFractionDigits: 0,
}
```

---

## Output Helpers

### Standalone HTML

```ts
const html = toHtmlFile(output, {
  title: 'My Dashboard',
  theme: 'midnight',
  includeChartJs: true,
})
```

Use `includeChartJs: true` for chart visualizations.

Use `includeChartJs: false` for:

- Tables
- Metric Cards
- Progress Bars
- Heatmaps

### Embed Snippet

```ts
import { toEmbedSnippet } from '@smolina-dev/vizflow-core'

const snippet = toEmbedSnippet(output, {
  includeChartJs: true,
})
```

---

## CLI Wizard

```bash
npx @smolina-dev/vizflow-cli
```

Available generators:

```txt
/chart       — Generate charts
/table       — Generate searchable tables
/heatmap     — Generate heatmaps
/components  — Generate metric cards and progress bars
```

The CLI supports:

- Manual data entry
- CSV files
- JSON files
- Premium themes
- Value formatting
- Table search
- Heatmap color scales
- Safe file overwrite confirmation

---

## CSV Support

The CSV parser supports:

- Quoted values
- Commas inside quoted fields
- Escaped quotes
- Multiline quoted fields
- CRLF and LF line endings
- Boolean, null and numeric inference

Example:

```csv
month,sales
Jan,1200
Feb,950
Mar,1400
```

---

## JSON Support

```json
[
  { "month": "Jan", "sales": 1200 },
  { "month": "Feb", "sales": 950 },
  { "month": "Mar", "sales": 1400 }
]
```

---

## Themes

| Theme | Description |
|---|---|
| `light` | Clean light interface |
| `dark` | Dark dashboard interface |
| `hot` | Warm red/orange palette |
| `cold` | Cool blue/cyan palette |
| `corporate` | Professional blue/gray business theme |
| `emerald` | Growth-focused green theme |
| `midnight` | Premium dark dashboard theme |
| `sunset` | Warm presentation-ready theme |

---

## Development

Install dependencies:

```bash
pnpm install
```

Run tests:

```bash
pnpm test
```

Build all packages:

```bash
pnpm build
```

Build core:

```bash
pnpm --filter @smolina-dev/vizflow-core build
```

Build CLI:

```bash
pnpm --filter @smolina-dev/vizflow-cli build
```

---

## Changelog

See `CHANGELOG.md`.

---

## License

MIT