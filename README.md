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

```bash
# Core library
npm install @smolina-dev/vizflow-core

# CLI wizard
npm install -g @smolina-dev/vizflow-cli
🚀 Mode 1 — Programmatic API
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

document.getElementById('container').innerHTML = output.render()
Available generators
import {
  barChart,
  lineChart,
  pieChart,
  scatterChart,
  table,
} from '@smolina-dev/vizflow-core'
Standalone HTML file
import { barChart, toHtmlFile } from '@smolina-dev/vizflow-core'
import { writeFileSync } from 'fs'

const output = barChart({ ... })
const html = toHtmlFile(output, {
  title: 'Sales Dashboard',
  theme: 'hot',
})

writeFileSync('chart.html', html)
Embeddable snippet
import { barChart, toEmbedSnippet } from '@smolina-dev/vizflow-core'

const output = barChart({ ... })
const snippet = toEmbedSnippet(output)
console.log(snippet) // paste into any HTML page
🧙 Mode 2 — CLI Wizard
npx @smolina-dev/vizflow-cli
? What do you want to generate?
  ❯ /chart   — Generate a chart from your data
    /table   — Generate a table from your data
    /heatmap — Generate a heatmap from your data

The wizard asks step-by-step questions and generates a ready-to-use .html file.

Supported data sources
Source	Description
Manual	Enter rows one by one in the terminal
CSV	Point to a local .csv file
JSON	Point to a local .json file
CSV format
month,sales
Jan,1200
Feb,950
Mar,1400
JSON format
[
  { "month": "Jan", "sales": 1200 },
  { "month": "Feb", "sales": 950 },
  { "month": "Mar", "sales": 1400 }
]
🎨 Mode 3 — CSS Theming

VizFlow includes four built-in themes:

Theme	Description
light	Clean light interface
dark	Dark interface for dashboards
hot	Warm, energetic visual palette
cold	Cool, calm blue visual palette
Use a theme with toHtmlFile()
import { barChart, toHtmlFile } from '@smolina-dev/vizflow-core'

const output = barChart({ ... })

const html = toHtmlFile(output, {
  title: 'Sales Dashboard',
  theme: 'hot',
})
Import built-in theme CSS
import '@smolina-dev/vizflow-core/themes/light.css'
import '@smolina-dev/vizflow-core/themes/dark.css'
import '@smolina-dev/vizflow-core/themes/hot.css'
import '@smolina-dev/vizflow-core/themes/cold.css'

You can also load the generated CSS directly in HTML:

<link rel="stylesheet" href="node_modules/@smolina-dev/vizflow-core/dist/themes/light.css" />
<link rel="stylesheet" href="node_modules/@smolina-dev/vizflow-core/dist/themes/dark.css" />
<link rel="stylesheet" href="node_modules/@smolina-dev/vizflow-core/dist/themes/hot.css" />
<link rel="stylesheet" href="node_modules/@smolina-dev/vizflow-core/dist/themes/cold.css" />
Custom theme
:root {
  --vf-primary: #10b981;
  --vf-background: #0f172a;
  --vf-text: #f1f5f9;
  --vf-radius: 12px;
  --vf-font: 'Inter', sans-serif;
}
Available CSS variables
Variable	Description	Default
--vf-primary	Accent color	#6366f1
--vf-on-primary	Text on primary	#ffffff
--vf-background	Page background	#ffffff
--vf-surface	Card background	#f9fafb
--vf-text	Primary text	#111827
--vf-text-muted	Secondary text	#6b7280
--vf-border	Border color	#e5e7eb
--vf-radius	Border radius	8px
--vf-font	Font family	system-ui
--vf-chart-1	First chart series color	Theme value
--vf-chart-2	Second chart series color	Theme value
--vf-chart-3	Third chart series color	Theme value
--vf-chart-4	Fourth chart series color	Theme value
--vf-chart-5	Fifth chart series color	Theme value
📊 Chart Options
Line Chart
import { lineChart } from '@smolina-dev/vizflow-core'

lineChart(config, {
  fill: true, // fill area below line
  showPoints: true, // show data point dots
  tension: 0.3, // line smoothness (0-1)
})
Pie Chart
import { pieChart } from '@smolina-dev/vizflow-core'

pieChart(config, {
  donut: true, // render as donut chart
  cutoutPercent: 60, // donut hole size (0-100)
  showPercentages: true, // show percentages in the tooltip
})
Scatter Chart
import { scatterChart } from '@smolina-dev/vizflow-core'

scatterChart(config, {
  pointRadius: 6,
  xAxisLabel: 'Height (cm)',
  yAxisLabel: 'Weight (kg)',
})
📋 Table Options
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
Disable pagination

Use pageSize: 0 when you want to render all rows without pagination.

table(config, {
  pageSize: 0,
})
🗂️ Monorepo structure
vizflow/
├── packages/
│   ├── core/    # Chart, table generators and parsers
│   └── cli/     # Conversational CLI wizard
├── playground/  # Visual demo app (Vite)
└── docs/        # Documentation
🛠️ Development
# Install dependencies
pnpm install

# Run lint
pnpm lint

# Build all packages
pnpm build

# Run tests
pnpm test

# Build only core
pnpm --filter @smolina-dev/vizflow-core build

# Run CLI in development
pnpm --filter @smolina-dev/vizflow-cli dev
📄 License

MIT © Alejandro Molina