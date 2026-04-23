# 🌊 VizFlow.js

> TypeScript library for generating charts, tables and visualizations — programmatic API, conversational CLI wizard, and CSS theming system.

[![npm version](https://img.shields.io/npm/v/@vizflow/core)](https://www.npmjs.com/package/@vizflow/core)
[![license](https://img.shields.io/npm/l/@vizflow/core)](LICENSE)

---

## ✨ Features

- **Bar, Line, Pie and Scatter** charts via Chart.js
- **HTML tables** with client-side sorting and pagination
- **Conversational CLI wizard** — no config knowledge required
- **CSS theming** via custom properties (`--vf-primary`, `--vf-radius`, etc.)
- **Dual package** — ESM + CJS, works in browser and Node.js
- **Full TypeScript** — typed API for all parameters
- **External datasources** — load from `.csv` or `.json` files

---

## 📦 Installation

```bash
# Core library
npm install @vizflow/core

# CLI wizard
npm install -g @vizflow/cli
```

---

## 🚀 Mode 1 — Programmatic API

```typescript
import { barChart } from '@vizflow/core'

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

document.getElementById('container').innerHTML = output.render()
```

### Available generators

```typescript
import {
  barChart,
  lineChart,
  pieChart,
  scatterChart,
  table,
} from '@vizflow/core'
```

### Standalone HTML file

```typescript
import { barChart, toHtmlFile } from '@vizflow/core'
import { writeFileSync } from 'fs'

const output = barChart({ ... })
const html = toHtmlFile(output, { title: 'My Chart', theme: 'dark' })
writeFileSync('chart.html', html)
```

### Embeddable snippet

```typescript
import { barChart, toEmbedSnippet } from '@vizflow/core'

const output = barChart({ ... })
const snippet = toEmbedSnippet(output)
console.log(snippet) // paste into any HTML page
```

---

## 🧙 Mode 2 — CLI Wizard

```bash
npx @vizflow/cli
```

```
? What do you want to generate?
  ❯ /chart   — Generate a chart from your data
    /table   — Generate a table from your data
    /heatmap — Generate a heatmap from your data
```

The wizard asks step-by-step questions and generates a ready-to-use `.html` file.

### Supported data sources

| Source | Description                           |
| ------ | ------------------------------------- |
| Manual | Enter rows one by one in the terminal |
| CSV    | Point to a local `.csv` file          |
| JSON   | Point to a local `.json` file         |

### CSV format

```csv
month,sales
Jan,1200
Feb,950
Mar,1400
```

### JSON format

```json
[
  { "month": "Jan", "sales": 1200 },
  { "month": "Feb", "sales": 950 },
  { "month": "Mar", "sales": 1400 }
]
```

---

## 🎨 Mode 3 — CSS Theming

Import a built-in theme or override variables directly:

```html
<!-- Light theme -->
<link
  rel="stylesheet"
  href="node_modules/@vizflow/core/dist/themes/light.css"
/>

<!-- Dark theme -->
<link rel="stylesheet" href="node_modules/@vizflow/core/dist/themes/dark.css" />
```

### Custom theme

```css
:root {
  --vf-primary: #10b981;
  --vf-background: #0f172a;
  --vf-text: #f1f5f9;
  --vf-radius: 12px;
  --vf-font: 'Inter', sans-serif;
}
```

### Available CSS variables

| Variable          | Description     | Default     |
| ----------------- | --------------- | ----------- |
| `--vf-primary`    | Accent color    | `#6366f1`   |
| `--vf-on-primary` | Text on primary | `#ffffff`   |
| `--vf-background` | Page background | `#ffffff`   |
| `--vf-surface`    | Card background | `#f9fafb`   |
| `--vf-text`       | Primary text    | `#111827`   |
| `--vf-text-muted` | Secondary text  | `#6b7280`   |
| `--vf-border`     | Border color    | `#e5e7eb`   |
| `--vf-radius`     | Border radius   | `8px`       |
| `--vf-font`       | Font family     | `system-ui` |

---

## 📊 Chart Options

### Line Chart

```typescript
import { lineChart } from '@vizflow/core'

lineChart(config, {
  fill: true, // fill area below line
  showPoints: true, // show data point dots
  tension: 0.3, // line smoothness (0-1)
})
```

### Pie Chart

```typescript
import { pieChart } from '@vizflow/core'

pieChart(config, {
  donut: true, // render as donut chart
  cutoutPercent: 60, // donut hole size (0-100)
})
```

### Scatter Chart

```typescript
import { scatterChart } from '@vizflow/core'

scatterChart(config, {
  pointRadius: 6,
  xAxisLabel: 'Height (cm)',
  yAxisLabel: 'Weight (kg)',
})
```

### Table

```typescript
import { table } from '@vizflow/core'

table(config, {
  pageSize: 10, // rows per page (0 = no pagination)
})
```

---

## 🗂️ Monorepo structure

```
vizflow/
├── packages/
│   ├── core/    # Chart, table generators and parsers
│   └── cli/     # Conversational CLI wizard
├── playground/  # Visual demo app (Vite)
└── docs/        # Documentation
```

---

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build core
pnpm --filter @vizflow/core build

# Run CLI in dev mode
pnpm --filter @vizflow/cli dev

# Run playground
pnpm --filter @vizflow/playground dev

# Run tests
pnpm --filter @vizflow/core test
```

---

## 📄 License

MIT © VizFlow.js contributors
