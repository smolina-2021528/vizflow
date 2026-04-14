// ─── Public API entry point ───────────────────────────────────────

// Types
export type {
  DataRow,
  DataSource,
  Theme,
  ThemeName,
  CustomTheme,
  ChartType,
  ChartConfig,
  ColumnDef,
  TableConfig,
  VizFlowOutput,
} from './types/index.js'

// Parsers
export { parseJson, JsonParseError } from './parsers/index.js'
export { parseCsv, CsvParseError } from './parsers/index.js'

// Charts
export { barChart, lineChart, pieChart, scatterChart } from './charts/index.js'
export type {
  LineChartOptions,
  PieChartOptions,
  ScatterChartOptions,
} from './charts/index.js'
