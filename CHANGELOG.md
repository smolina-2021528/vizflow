# Changelog

All notable changes to this project are documented in this file.

This project follows semantic versioning.

---

## 1.3.0 — Theme Expansion Update

### Added

- Added 3 new built-in Core themes:
  - `ocean`
  - `rose`
  - `forest`

- Added `ocean` theme:
  - Deep marine analytics palette.
  - Dark blue background.
  - Cyan and teal chart accents.
  - Designed for dark analytics dashboards.

- Added `rose` theme:
  - Elegant rose and crimson palette.
  - Light presentation-ready background.
  - Strong pink/red chart accents.
  - Designed for polished presentations and executive views.

- Added `forest` theme:
  - Dark earthy green palette.
  - Natural green and lime chart accents.
  - Designed for environmental, natural, sustainability or organic dashboards.

- Added standalone CSS theme files:
  - `packages/core/src/themes/ocean.css`
  - `packages/core/src/themes/rose.css`
  - `packages/core/src/themes/forest.css`

- Added the new themes to the Core theme system so they can be used with `toHtmlFile()`.

- Added the new themes to the centralized CLI `themeChoices`, making them available in:
  - Chart wizard
  - Table wizard
  - Heatmap wizard
  - Components wizard

### Updated

- Updated the main README with a complete built-in theme gallery.
- Updated Core README with the new theme names, gallery and CSS import examples.
- Updated CLI README with the new theme options.
- Updated theme tests to validate `ocean`, `rose` and `forest`.

---

## 1.2.1 — CLI Internal Cleanup Patch

### Refactored

- Centralized duplicated CLI theme choices into `packages/cli/src/utils/shared.ts`.
- Centralized duplicated CLI value format prompt logic into `collectValueFormat()`.
- Updated chart, table, heatmap and component wizards to reuse the shared prompt utilities.
- Reduced repeated prompt code across CLI commands to make future theme additions safer and easier to maintain.

### Fixed

- Added reusable structured data loading helper for CLI imports.
- Added retry flow when CSV parsing fails in the chart wizard.
- Added retry flow when JSON parsing fails in the chart wizard.
- Added retry flow when CSV parsing fails in the table wizard.
- Added retry flow when JSON parsing fails in the table wizard.
- Prevented malformed CSV/JSON imports from immediately terminating the CLI wizard flow.

---

## 1.2.0 — Visual Experience Update

### Added

- Added premium built-in themes:
  - `corporate`
  - `emerald`
  - `midnight`
  - `sunset`

- Added improved chart visual containers:
  - dashboard-style cards
  - title rendering
  - subtitle rendering
  - configurable card shadow
  - configurable card radius
  - improved canvas wrapper
  - better theme color usage

- Added chart value formatting:
  - number
  - currency
  - percent
  - compact notation

- Added new chart generators:
  - `areaChart()`
  - `horizontalBarChart()`
  - `doughnutChart()`

- Added dashboard components:
  - `metricCard()`
  - `progressBar()`

- Added `heatmap()` as a core visualization.

- Added enhanced table experience:
  - title
  - subtitle
  - search
  - result count
  - compact and comfortable density
  - column alignment
  - numeric column formatting
  - improved visual card style

- Added CLI support for:
  - new themes
  - new chart types
  - chart subtitles
  - chart value formatting
  - chart card appearance
  - heatmap generation from core
  - metric cards
  - progress bars
  - safe output file overwrite confirmation

### Improved

- Improved chart styling for more professional dashboards.
- Improved tooltip readability.
- Improved table visual hierarchy.
- Improved documentation for Core and CLI packages.
- Improved CSV parser reliability.

### Fixed

- Fixed CSV parsing for escaped quotes.
- Fixed CSV parsing for commas inside quoted fields.
- Fixed CSV parsing for multiline quoted fields.
- Fixed malformed CSV detection for unclosed quoted fields.
- Fixed malformed CSV detection for invalid quote placement.
- Added safer handling of non-finite numeric values from CSV.
- Added clearer runtime guard when Chart.js is not available.

---

## 1.1.1

### Previous stable release

- Core chart generators.
- Table generator.
- CLI wizard.
- Built-in themes.
- CSV and JSON parsers.
- Standalone HTML output.
- Embeddable snippets.