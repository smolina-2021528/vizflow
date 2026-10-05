# 🌊 VizFlow.js

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.19%2B%20%7C%2022.13%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

VizFlow.js is a TypeScript toolkit for generating clean, dashboard-ready HTML visualizations from structured data. It includes a programmatic Core API and an interactive CLI wizard.

Current project version: **1.3.0**.

## Packages

| Package | Purpose |
| --- | --- |
| `@smolina-dev/vizflow-core` | Charts, tables, dashboard components, themes, parsers and HTML output helpers |
| `@smolina-dev/vizflow-cli` | Interactive terminal wizard for generating VizFlow HTML files |

## Features

- Seven chart generators: bar, line, pie, scatter, area, horizontal bar and doughnut.
- Dashboard components: metric cards, progress bars and heatmaps.
- Enhanced tables with search, sorting, pagination, alignment, density and numeric formatting.
- Eleven built-in themes.
- CSV and JSON parsers with validation.
- Number, currency, percent and compact formatting.
- Standalone HTML documents and embeddable snippets.
- Interactive CLI with manual, CSV and JSON data entry.
- HTML escaping and finite-number validation for generated output.

## Requirements

For development of this repository, use a Node.js version compatible with the current Vite and ESLint toolchain:

- Node.js `^20.19.0`, or
- Node.js `>=22.13.0`
- pnpm `>=10`

> The published runtime requirements of each package should be kept aligned with the actual build and development toolchain.

## Installation

### Core library

```bash
npm install @smolina-dev/vizflow-core
```

### CLI

Install globally:

```bash
npm install -g @smolina-dev/vizflow-cli
```

Or run it directly with `npx`:

```bash
npx @smolina-dev/vizflow-cli
```

## Quick start

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

Open `sales.html` in a browser to view the generated chart.

## Core API

### Charts

```ts
import {
  areaChart,
  barChart,
  doughnutChart,
  horizontalBarChart,
  lineChart,
  pieChart,
  scatterChart,
} from '@smolina-dev/vizflow-core'
```

Available generators:

| Generator | Recommended use |
| --- | --- |
| `barChart()` | Category comparisons |
| `lineChart()` | Time-series trends |
| `pieChart()` | Simple part-to-whole distributions |
| `scatterChart()` | Numeric relationships and correlation |
| `areaChart()` | Trend, growth and accumulated volume |
| `horizontalBarChart()` | Rankings and long category labels |
| `doughnutChart()` | Share and participation views |

### Example: area chart

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

### Dashboard components

```ts
import { heatmap, metricCard, progressBar } from '@smolina-dev/vizflow-core'
```

#### Metric card

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

#### Progress bar

```ts
const output = progressBar({
  title: 'Goal Completion',
  subtitle: 'Monthly target',
  value: 78,
  max: 100,
  variant: 'success',
})
```

#### Heatmap

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

### Tables

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

## Value formatting

Supported formatter types:

| Type | Behavior |
| --- | --- |
| `number` | Localized number |
| `currency` | Localized currency |
| `percent` | Percentage; values are expected as decimals such as `0.25` |
| `compact` | Compact notation such as `1.2K` or `3.4M` |

Example:

```ts
{
  type: 'currency',
  currency: 'GTQ',
  locale: 'es-GT',
  maximumFractionDigits: 2,
}
```

Optional `prefix` and `suffix` values are also supported.

## Themes

VizFlow includes these built-in themes:

| Theme | Description |
| --- | --- |
| `light` | Clean light interface |
| `dark` | General dark dashboard |
| `hot` | Warm red/orange palette |
| `cold` | Cool blue/cyan palette |
| `corporate` | Professional blue/gray business theme |
| `emerald` | Growth-focused green theme |
| `midnight` | Premium dark dashboard |
| `sunset` | Warm presentation theme |
| `ocean` | Deep marine analytics theme |
| `rose` | Elegant rose/crimson theme |
| `forest` | Earthy dark green theme |

Use a theme when generating a complete HTML file:

```ts
const html = toHtmlFile(output, {
  title: 'Dashboard',
  theme: 'ocean',
})
```

Or import theme CSS directly:

```ts
import '@smolina-dev/vizflow-core/themes/corporate.css'
```

## Output helpers

### `toHtmlFile(output, options?)`

Creates a complete HTML document.

```ts
const html = toHtmlFile(output, {
  title: 'My Dashboard',
  theme: 'corporate',
  includeChartJs: true,
})
```

Use `includeChartJs: true` for chart visualizations. Tables, metric cards, progress bars and heatmaps do not need Chart.js.

### `toEmbedSnippet(output, options?)`

Creates a copy-paste HTML snippet:

```ts
const snippet = toEmbedSnippet(output, {
  includeChartJs: true,
})
```

When embedding charts into an existing application, Chart.js must be available on the page.

## Parsers

### CSV

```ts
import { parseCsv } from '@smolina-dev/vizflow-core'

const rows = parseCsv(`month,sales
Jan,1200
Feb,950`)
```

The CSV parser supports quoted fields, commas inside quoted fields, escaped quotes, multiline quoted fields, CRLF/LF endings, primitive type inference and malformed-input validation.

### JSON

```ts
import { parseJson } from '@smolina-dev/vizflow-core'

const rows = parseJson(`[
  { "month": "Jan", "sales": 1200 },
  { "month": "Feb", "sales": 950 }
]`)
```

JSON input must be a non-empty array of flat objects whose values are strings, finite numbers, booleans or `null`.

## CLI

Start the wizard:

```bash
vizflow
```

or:

```bash
npx @smolina-dev/vizflow-cli
```

Available flows:

```text
/chart       Generate a chart
/table       Generate a searchable table
/heatmap     Generate a heatmap matrix
/components  Generate metric cards and progress bars
```

The CLI can load data manually or from local CSV/JSON files and asks before overwriting an existing output file.

For a complete walkthrough, see [`GUIA_DE_USO.md`](GUIA_DE_USO.md).

## Development

Clone the repository and install dependencies:

```bash
pnpm install --frozen-lockfile
```

Run the main checks:

```bash
pnpm lint
pnpm build
pnpm test
```

Run the Core package in watch mode:

```bash
pnpm dev
```

Run the CLI locally:

```bash
pnpm --filter @smolina-dev/vizflow-cli dev
```

## Repository structure

```text
vizflow/
├── packages/
│   ├── core/          # Core visualization library
│   └── cli/           # Interactive terminal wizard
├── playground/        # Local playground
├── .github/workflows/ # CI and npm publishing workflows
├── CHANGELOG.md
├── README.md
└── pnpm-workspace.yaml
```

## Versioning

VizFlow follows [Semantic Versioning](https://semver.org/):

- **PATCH** (`1.3.0` → `1.3.1`): compatible bug fixes and documentation corrections.
- **MINOR** (`1.3.x` → `1.4.0`): backwards-compatible features.
- **MAJOR** (`1.x` → `2.0.0`): breaking API or architecture changes.

## License

MIT © Alejandro Molina
