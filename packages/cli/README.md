# @smolina-dev/vizflow-cli

Conversational CLI wizard for generating VizFlow.js visualizations from the terminal.

The CLI helps you create ready-to-use `.html` visualizations without writing code.

---

## Installation

```bash
npm install -g @smolina-dev/vizflow-cli
```

Or run without installing globally:

```bash
npx @smolina-dev/vizflow-cli
```

---

## Available Generators

```txt
/chart       — Generate charts
/table       — Generate searchable tables
/heatmap     — Generate heatmaps
/components  — Generate metric cards and progress bars
```

---

## Supported Visualizations

### Charts

- Bar
- Line
- Pie
- Scatter
- Area
- Horizontal Bar
- Doughnut

### Tables

- Searchable tables
- Sortable columns
- Pagination
- Column formatting
- Compact or comfortable density

### Components

- Metric Card
- Progress Bar

### Heatmaps

- Activity matrices
- Performance grids
- Intensity tables

---

## Usage

```bash
vizflow
```

Or:

```bash
npx @smolina-dev/vizflow-cli
```

The wizard will ask what you want to generate:

```txt
? What do you want to generate?
  /chart       — Generate a chart from your data
  /table       — Generate a searchable table from your data
  /heatmap     — Generate a heatmap matrix
  /components  — Generate KPI cards and progress bars
```

---

## Data Sources

The CLI supports:

| Source | Description |
|---|---|
| Manual | Enter values step by step |
| CSV | Load data from a local CSV file |
| JSON | Load data from a local JSON file |

---

## CSV Example

```csv
month,sales
Jan,1200
Feb,950
Mar,1400
```

The CSV parser supports:

- Quoted fields
- Commas inside quoted values
- Escaped quotes
- Multiline quoted fields
- CRLF and LF line endings

---

## JSON Example

```json
[
  { "month": "Jan", "sales": 1200 },
  { "month": "Feb", "sales": 950 },
  { "month": "Mar", "sales": 1400 }
]
```

---

## Themes

The CLI supports the built-in VizFlow themes:

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

## Chart Wizard

The `/chart` wizard asks for:

- Chart type
- Title
- Subtitle
- X-axis key
- Y-axis key
- Data source
- Value format
- Card appearance
- Chart dimensions
- Theme
- Output filename

Supported chart types:

```txt
Bar
Line
Pie
Scatter
Area
Horizontal Bar
Doughnut
```

Supported value formats:

```txt
None
Number
Currency
Percent
Compact number
```

---

## Table Wizard

The `/table` wizard supports:

- Manual data entry
- CSV loading
- JSON loading
- Inferred columns
- Custom column labels
- Sorting
- Alignment
- Numeric formatting
- Search
- Pagination
- Compact or comfortable density
- Premium themes

---

## Heatmap Wizard

The `/heatmap` wizard supports:

- Row labels
- Column labels
- Matrix values
- Color scales
- Compact or comfortable density
- Visible or hidden cell values
- Custom min and max bounds
- Value formatting
- Premium themes

Supported color scales:

```txt
Blue
Green
Purple
Orange
Gray
```

---

## Components Wizard

The `/components` wizard supports:

```txt
Metric Card
Progress Bar
```

Metric Cards support:

- Title
- Subtitle
- Value formatting
- Trend indicators
- Footer
- Width
- Theme

Progress Bars support:

- Title
- Subtitle
- Current value
- Max value
- Value formatting
- Variant
- Size
- Raw value visibility
- Percentage visibility
- Width
- Theme

Progress bar variants:

```txt
Default
Success
Warning
Danger
Info
```

Progress bar sizes:

```txt
Small
Medium
Large
```

---

## Output Protection

If the output file already exists, the CLI asks before overwriting it.

```txt
File already exists: chart.html. Overwrite?
```

If you decline, no file is changed.

---

## Local Development

Run the CLI locally:

```bash
pnpm --filter @smolina-dev/vizflow-cli dev
```

Build the CLI:

```bash
pnpm --filter @smolina-dev/vizflow-cli build
```

---

## Related Package

The CLI uses the core package internally:

```bash
npm install @smolina-dev/vizflow-core
```

---

## License

MIT