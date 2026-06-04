# @smolina-dev/vizflow-core

Core TypeScript library for generating charts, tables and dashboard-ready visualizations.

---

## Installation

```bash
npm install @smolina-dev/vizflow-core
```

---

## Included Features

### Charts

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

### Tables

```ts
import { table } from '@smolina-dev/vizflow-core'
```

### Dashboard Components

```ts
import {
  metricCard,
  progressBar,
  heatmap,
} from '@smolina-dev/vizflow-core'
```

### Output Helpers

```ts
import {
  toHtmlFile,
  toEmbedSnippet,
} from '@smolina-dev/vizflow-core'
```

### Parsers

```ts
import {
  parseCsv,
  parseJson,
} from '@smolina-dev/vizflow-core'
```

---

## Quick Example

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

## Chart Generators

### `barChart(config)`

Best for category comparisons.

### `lineChart(config, options?)`

Best for trends over time.

### `pieChart(config, options?)`

Best for simple distribution views.

### `scatterChart(config, options?)`

Best for numeric correlation views.

### `areaChart(config, options?)`

Best for growth, accumulation and volume trends.

### `horizontalBarChart(config, options?)`

Best for rankings and top-N comparisons.

### `doughnutChart(config, options?)`

Best for share and participation views.

---

## Example: Area Chart

```ts
const output = areaChart({
  type: 'area',
  title: 'Growth Trend',
  subtitle: 'Quarterly results',
  xKey: 'quarter',
  yKey: 'sales',
  data: {
    kind: 'inline',
    rows: [
      { quarter: 'Q1', sales: 12000 },
      { quarter: 'Q2', sales: 18000 },
      { quarter: 'Q3', sales: 24000 },
    ],
  },
})
```

---

## Example: Horizontal Bar Chart

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
    ],
  },
})
```

---

## Example: Doughnut Chart

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
    ],
  },
})
```

---

## Tables

```ts
const output = table(
  {
    title: 'Customer Ranking',
    subtitle: 'Monthly sales',
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

## Dashboard Components

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
  size: 'md',
})
```

### Heatmap

```ts
const output = heatmap({
  title: 'Weekly Activity',
  rows: ['Product A', 'Product B'],
  columns: ['Mon', 'Tue', 'Wed'],
  values: [
    [10, 20, 30],
    [5, 15, 25],
  ],
  colorScale: 'green',
})
```

---

## Value Formatting

Supported format types:

```ts
type ValueFormatType = 'number' | 'currency' | 'percent' | 'compact'
```

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

## Themes

Built-in themes:

```ts
type BuiltInThemeName =
  | 'light'
  | 'dark'
  | 'hot'
  | 'cold'
  | 'corporate'
  | 'emerald'
  | 'midnight'
  | 'sunset'
```

Use a theme with `toHtmlFile()`:

```ts
const html = toHtmlFile(output, {
  title: 'Dashboard',
  theme: 'midnight',
})
```

---

## Import Theme CSS

```ts
import '@smolina-dev/vizflow-core/themes/light.css'
import '@smolina-dev/vizflow-core/themes/dark.css'
import '@smolina-dev/vizflow-core/themes/hot.css'
import '@smolina-dev/vizflow-core/themes/cold.css'
import '@smolina-dev/vizflow-core/themes/corporate.css'
import '@smolina-dev/vizflow-core/themes/emerald.css'
import '@smolina-dev/vizflow-core/themes/midnight.css'
import '@smolina-dev/vizflow-core/themes/sunset.css'
```

---

## Output Helpers

### `toHtmlFile(output, options?)`

Creates a complete HTML document.

```ts
const html = toHtmlFile(output, {
  title: 'My Dashboard',
  theme: 'corporate',
  includeChartJs: true,
})
```

Use `includeChartJs: true` for chart visualizations.

Use `includeChartJs: false` for:

- Tables
- Metric Cards
- Progress Bars
- Heatmaps

### `toEmbedSnippet(output, options?)`

Creates a copy-paste HTML snippet.

```ts
const snippet = toEmbedSnippet(output, {
  includeChartJs: true,
})
```

---

## Data Sources

Programmatic usage supports inline data:

```ts
data: {
  kind: 'inline',
  rows: [
    { month: 'Jan', sales: 1200 },
    { month: 'Feb', sales: 950 },
  ],
}
```

File-based data loading is handled by the CLI.

---

## CSV Parser

```ts
const rows = parseCsv(`month,sales
Jan,1200
Feb,950`)
```

The CSV parser supports:

- Quoted values
- Commas inside quoted fields
- Escaped quotes
- Multiline quoted fields
- CRLF and LF line endings
- Boolean, null and numeric inference

---

## JSON Parser

```ts
const rows = parseJson(`
[
  { "month": "Jan", "sales": 1200 },
  { "month": "Feb", "sales": 950 }
]
`)
```

---

## Development

```bash
pnpm --filter @smolina-dev/vizflow-core test
pnpm --filter @smolina-dev/vizflow-core build
```

---

## License

MIT