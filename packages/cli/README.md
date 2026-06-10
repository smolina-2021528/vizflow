# @smolina-dev/vizflow-cli

Conversational CLI wizard for generating VizFlow.js visualizations from the terminal.

The CLI helps you create ready-to-use `.html` visualizations without writing code.

---

## Installation

```bash
npm install -g @smolina-dev/vizflow-cli

Or run without installing globally:

npx @smolina-dev/vizflow-cli
Available Generators
/chart       — Generate charts
/table       — Generate searchable tables
/heatmap     — Generate heatmaps
/components  — Generate metric cards and progress bars
Supported Visualizations
Charts
Bar
Line
Pie
Scatter
Area
Horizontal Bar
Doughnut
Tables
Searchable tables
Sortable columns
Pagination
Column formatting
Compact or comfortable density
Components
Metric Card
Progress Bar
Heatmaps
Activity matrices
Performance grids
Intensity tables
Usage
vizflow

Or:

npx @smolina-dev/vizflow-cli

The wizard will ask what you want to generate:

? What do you want to generate?
  /chart       — Generate a chart from your data
  /table       — Generate a searchable table from your data
  /heatmap     — Generate a heatmap matrix
  /components  — Generate KPI cards and progress bars
Data Sources

The CLI supports:

Source	Description
Manual	Enter values step by step
CSV	Load data from a local CSV file
JSON	Load data from a local JSON file

When a CSV or JSON file cannot be parsed, the wizard shows the error and lets you retry with another file.

CSV Example
month,sales
Jan,1200
Feb,950
Mar,1400

The CSV parser supports:

Quoted fields
Commas inside quoted values
Escaped quotes
Multiline quoted fields
CRLF and LF line endings
JSON Example
[
  { "month": "Jan", "sales": 1200 },
  { "month": "Feb", "sales": 950 },
  { "month": "Mar", "sales": 1400 }
]
Themes

The CLI supports the built-in VizFlow themes:

Theme	Description	Best for
light	Clean light interface	General reports and simple dashboards
dark	Dark dashboard interface	Internal dashboards and dark layouts
hot	Warm red/orange palette	Impact charts and urgent indicators
cold	Cool blue/cyan palette	Technical or analytical reports
corporate	Professional blue/gray business theme	Executive dashboards
emerald	Growth-focused green theme	Sales, growth and positive KPIs
midnight	Premium dark dashboard theme	Modern dashboards and presentations
sunset	Warm presentation-ready theme	Visual reports and storytelling
ocean	Deep marine analytics theme	Dark analytics dashboards
rose	Elegant rose/crimson theme	Polished presentations and executive views
forest	Earthy dark green theme	Environmental, natural or sustainability dashboards
Chart Wizard

The /chart wizard asks for:

Chart type
Title
Subtitle
X-axis key
Y-axis key
Data source
Value format
Card appearance
Chart dimensions
Theme
Output filename

Supported chart types:

Bar
Line
Pie
Scatter
Area
Horizontal Bar
Doughnut

Supported value formats:

None
Number
Currency
Percent
Compact number
Table Wizard

The /table wizard supports:

Manual data entry
CSV loading
JSON loading
Inferred columns
Custom column labels
Sorting
Alignment
Numeric formatting
Search
Pagination
Compact or comfortable density
Premium themes
Heatmap Wizard

The /heatmap wizard supports:

Row labels
Column labels
Matrix values
Color scales
Compact or comfortable density
Visible or hidden cell values
Custom min and max bounds
Value formatting
Premium themes

Supported color scales:

Blue
Green
Purple
Orange
Gray
Components Wizard

The /components wizard supports:

Metric Card
Progress Bar

Metric Cards support:

Title
Subtitle
Value formatting
Trend indicators
Footer
Width
Theme

Progress Bars support:

Title
Subtitle
Current value
Max value
Value formatting
Variant
Size
Raw value visibility
Percentage visibility
Width
Theme

Progress bar variants:

Default
Success
Warning
Danger
Info

Progress bar sizes:

Small
Medium
Large
Output Protection

If the output file already exists, the CLI asks before overwriting it.

File already exists: chart.html. Overwrite?

If you decline, no file is changed.

Local Development

Run the CLI locally:

pnpm --filter @smolina-dev/vizflow-cli dev

Build the CLI:

pnpm --filter @smolina-dev/vizflow-cli build
Related Package

The CLI uses the core package internally:

npm install @smolina-dev/vizflow-core
License

MIT