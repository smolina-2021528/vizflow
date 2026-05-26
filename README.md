# 🌊 VizFlow.js

> TypeScript library for generating charts, tables and visualizations — programmatic API, conversational CLI wizard, and CSS theming system.

[![npm version](https://img.shields.io/npm/v/@smolina-dev/vizflow-core)](https://www.npmjs.com/package/@smolina-dev/vizflow-core)
[![license](https://img.shields.io/npm/l/@smolina-dev/vizflow-core)](LICENSE)

---

## ✨ Features

- **Bar, Line, Pie and Scatter** charts via Chart.js
- **HTML tables** with client-side sorting and pagination
- **Conversational CLI wizard** — no config knowledge required
- **Built-in themes**: `light`, `dark`, `hot` and `cold`
- **CSS theming** via custom properties (`--vf-primary`, `--vf-chart-1`, etc.)
- **Dual package** — ESM + CJS, works in browser and Node.js
- **Full TypeScript** — typed API for all parameters
- **External datasources** — load from `.csv` or `.json` files

---

## 📦 Installation

### Core library

```bash
npm install @smolina-dev/vizflow-core
```

### CLI wizard

```bash
npm install -g @smolina-dev/vizflow-cli
```

---

## 🚀 Mode 1 — Programmatic API

```ts
import { barChart } from '@smolina-dev/vizflow-core'

const output = barChart({
  type: 'bar',
  title: 'Monthly Sales',
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
})

const html = output.render()
console.log(html)
```

> Note: `output.render()` returns an HTML snippet that can include scripts required by the visualization. When using it inside a browser SPA, make sure your mounting strategy executes the generated scripts correctly.

---

## Available generators

```ts
import {
  barChart,
  lineChart,
  pieChart,
  scatterChart,
  table,
} from '@smolina-dev/vizflow-core'
```

---

## Standalone HTML file

```ts
import { writeFileSync } from 'node:fs'
import { barChart, toHtmlFile } from '@smolina-dev/vizflow-core'

const output = barChart({
  type: 'bar',
  title: 'Monthly Sales',
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
})

const html = toHtmlFile(output, {
  title: 'Sales Dashboard',
  theme: 'hot',
})

writeFileSync('chart.html', html)
```

---

## Embeddable snippet

```ts
import { barChart, toEmbedSnippet } from '@smolina-dev/vizflow-core'

const output = barChart({
  type: 'bar',
  title: 'Monthly Sales',
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
})

const snippet = toEmbedSnippet(output)

console.log(snippet)
```

---

## 🧙 Mode 2 — CLI Wizard

```bash
npx @smolina-dev/vizflow-cli
```

Example flow:

```txt
? What do you want to generate?
  ❯ /chart   — Generate a chart from your data
    /table   — Generate a table from your data
    /heatmap — Generate a heatmap from your data
```

The wizard asks step-by-step questions and generates a ready-to-use `.html` file.

---

## Supported data sources

| Source | Description |
|---|---|
| Manual | Enter rows one by one in the terminal |
| CSV | Point to a local `.csv` file |
| JSON | Point to a local `.json` file |

---

## CSV format

```csv
month,sales
Jan,1200
Feb,950
Mar,1400
```

---

## JSON format

```json
[
  { "month": "Jan", "sales": 1200 },
  { "month": "Feb", "sales": 950 },
  { "month": "Mar", "sales": 1400 }
]
```

---

## 🎨 Mode 3 — CSS Theming

VizFlow includes four built-in themes:

| Theme | Description |
|---|---|
| `light` | Clean light interface |
| `dark` | Dark interface for dashboards |
| `hot` | Warm, energetic visual palette |
| `cold` | Cool, calm blue visual palette |

---

## Use a theme with `toHtmlFile()`

```ts
import { barChart, toHtmlFile } from '@smolina-dev/vizflow-core'

const output = barChart({
  type: 'bar',
  title: 'Monthly Sales',
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
})

const html = toHtmlFile(output, {
  title: 'Sales Dashboard',
  theme: 'hot',
})
```

---

## Import built-in theme CSS

```ts
import '@smolina-dev/vizflow-core/themes/light.css'
import '@smolina-dev/vizflow-core/themes/dark.css'
import '@smolina-dev/vizflow-core/themes/hot.css'
import '@smolina-dev/vizflow-core/themes/cold.css'
```

You can also load the generated CSS directly in HTML:

```html
<link rel="stylesheet" href="node_modules/@smolina-dev/vizflow-core/dist/themes/light.css" />
<link rel="stylesheet" href="node_modules/@smolina-dev/vizflow-core/dist/themes/dark.css" />
<link rel="stylesheet" href="node_modules/@smolina-dev/vizflow-core/dist/themes/hot.css" />
<link rel="stylesheet" href="node_modules/@smolina-dev/vizflow-core/dist/themes/cold.css" />
```

---

## Custom theme

```css
:root {
  --vf-primary: #10b981;
  --vf-background: #0f172a;
  --vf-text: #f1f5f9;
  --vf-radius: 12px;
  --vf-font: 'Inter', sans-serif;
}
```

---

## Available CSS variables

| Variable | Description | Default |
|---|---|---|
| `--vf-primary` | Accent color | `#6366f1` |
| `--vf-on-primary` | Text on primary | `#ffffff` |
| `--vf-background` | Page background | `#ffffff` |
| `--vf-surface` | Card background | `#f9fafb` |
| `--vf-text` | Primary text | `#111827` |
| `--vf-text-muted` | Secondary text | `#6b7280` |
| `--vf-border` | Border color | `#e5e7eb` |
| `--vf-radius` | Border radius | `8px` |
| `--vf-font` | Font family | `system-ui` |
| `--vf-chart-1` | First chart series color | Theme value |
| `--vf-chart-2` | Second chart series color | Theme value |
| `--vf-chart-3` | Third chart series color | Theme value |
| `--vf-chart-4` | Fourth chart series color | Theme value |
| `--vf-chart-5` | Fifth chart series color | Theme value |

---

## 📊 Chart Options

### Line Chart

```ts
import { lineChart } from '@smolina-dev/vizflow-core'

lineChart(config, {
  fill: true,
  showPoints: true,
  tension: 0.3,
})
```

### Pie Chart

```ts
import { pieChart } from '@smolina-dev/vizflow-core'

pieChart(config, {
  donut: true,
  cutoutPercent: 60,
  showPercentages: true,
})
```

### Scatter Chart

```ts
import { scatterChart } from '@smolina-dev/vizflow-core'

scatterChart(config, {
  pointRadius: 6,
  xAxisLabel: 'Height (cm)',
  yAxisLabel: 'Weight (kg)',
})
```

---

## 📋 Table Options

```ts
import { table } from '@smolina-dev/vizflow-core'

table(
  {
    title: 'Users',
    columns: [
      {
        key: 'name',
        label: 'Name',
        sortable: false,
        width: '240px',
      },
      {
        key: 'email',
        label: 'Email',
      },
    ],
    data: {
      kind: 'inline',
      rows: [
        { name: 'Ana', email: 'ana@example.com' },
        { name: 'Luis', email: 'luis@example.com' },
      ],
    },
  },
  {
    pageSize: 10,
  },
)
```

---

## Disable pagination

Use `pageSize: 0` when you want to render all rows without pagination.

```ts
table(config, {
  pageSize: 0,
})
```

---

## 🗂️ Monorepo structure

```txt
vizflow/
├── packages/
│   ├── core/       # Chart, table generators and parsers
│   └── cli/        # Conversational CLI wizard
├── playground/     # Visual demo app
└── docs/           # Documentation
```

---

## 🛠️ Development

### Install dependencies

```bash
pnpm install
```

### Run lint

```bash
pnpm lint
```

### Build all packages

```bash
pnpm build
```

### Run tests

```bash
pnpm test
```

### Build only core

```bash
pnpm --filter @smolina-dev/vizflow-core build
```

### Run CLI in development

```bash
pnpm --filter @smolina-dev/vizflow-cli dev
```

---

## 📄 License

MIT © Alejandro Molina