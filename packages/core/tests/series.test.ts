import { describe, expect, it } from 'vitest'
import { areaChart, barChart, lineChart } from '../src/charts/index.js'
import type { SeriesChartConfig } from '../src/types/index.js'

const multiSeriesConfig: SeriesChartConfig = {
  type: 'bar',
  title: 'Sales comparison',
  xKey: 'month',
  series: [
    { key: 'sales2025', label: '2025' },
    { key: 'sales2026', label: '2026' },
  ],
  data: {
    kind: 'inline',
    rows: [
      { month: 'Jan', sales2025: 100, sales2026: 125 },
      { month: 'Feb', sales2025: 120, sales2026: 150 },
    ],
  },
}

describe('multi-series charts', () => {
  it('renders multiple datasets in bar charts', () => {
    const output = barChart(multiSeriesConfig)

    expect(output.html).toContain('"label":"2025"')
    expect(output.html).toContain('"data":[100,120]')
    expect(output.html).toContain('"label":"2026"')
    expect(output.html).toContain('"data":[125,150]')
    expect(output.html).toContain('display: true')
    expect(output.html).toContain('index % vfChartColors.length')
  })

  it('renders multiple datasets in line charts', () => {
    const output = lineChart({
      ...multiSeriesConfig,
      type: 'line',
    })

    expect(output.html).toContain('"label":"2025"')
    expect(output.html).toContain('"label":"2026"')
    expect(output.html).toContain("type: 'line'")
    expect(output.html).toContain('display: true')
  })

  it('renders multiple gradients in area charts', () => {
    const output = areaChart({
      ...multiSeriesConfig,
      type: 'area',
    })

    expect(output.html).toContain('"label":"2025"')
    expect(output.html).toContain('"label":"2026"')
    expect(output.html).toContain('createLinearGradient')
    expect(output.html).toContain('display: true')
  })

  it('keeps the legacy default chart label when title is omitted', () => {
    const output = barChart({
      type: 'bar',
      xKey: 'label',
      yKey: 'value',
      data: {
        kind: 'inline',
        rows: [{ label: 'A', value: 10 }],
      },
    })

    expect(output.html).toContain('\"label\":\"Bar Chart\"')
  })

  it('keeps the legacy yKey API working without a legend', () => {
    const output = barChart({
      type: 'bar',
      title: 'Legacy chart',
      xKey: 'label',
      yKey: 'value',
      data: {
        kind: 'inline',
        rows: [
          { label: 'A', value: 10 },
          { label: 'B', value: 20 },
        ],
      },
    })

    expect(output.html).toContain('"label":"Legacy chart"')
    expect(output.html).toContain('"data":[10,20]')
    expect(output.html).toContain('display: false')
  })

  it('uses a per-series tooltip formatter when provided', () => {
    const output = barChart({
      ...multiSeriesConfig,
      series: [
        {
          key: 'sales2025',
          label: 'Revenue',
          format: { type: 'currency', currency: 'GTQ' },
        },
        { key: 'sales2026', label: 'Units' },
      ],
    })

    expect(output.html).toContain('"currency":"GTQ"')
    expect(output.html).toContain(
      'context.dataset.vfValueFormat || vfTooltipFormat'
    )
  })

  it('lets series take precedence over a legacy yKey', () => {
    const output = barChart({
      ...multiSeriesConfig,
      yKey: 'missing',
    })

    expect(output.html).toContain('"data":[100,120]')
    expect(output.html).not.toContain('key &quot;missing&quot;')
  })

  it('rejects duplicate series keys', () => {
    expect(() =>
      barChart({
        ...multiSeriesConfig,
        series: [
          { key: 'sales2025', label: 'First' },
          { key: 'sales2025', label: 'Second' },
        ],
      })
    ).toThrow('[VizFlow] Chart series key "sales2025" is duplicated')
  })

  it('rejects a series without a key', () => {
    expect(() =>
      barChart({
        ...multiSeriesConfig,
        series: [{ key: '', label: 'Invalid' }],
      })
    ).toThrow('[VizFlow] Chart series at index 0 must define a non-empty key')
  })

  it('rejects configs that define neither yKey nor series', () => {
    expect(() =>
      barChart({
        type: 'bar',
        xKey: 'label',
        data: {
          kind: 'inline',
          rows: [{ label: 'A', value: 10 }],
        },
      })
    ).toThrow(
      '[VizFlow] Bar, line and area charts require yKey or at least one series'
    )
  })

  it('validates finite values across every series', () => {
    expect(() =>
      lineChart({
        ...multiSeriesConfig,
        type: 'line',
        data: {
          kind: 'inline',
          rows: [{ month: 'Jan', sales2025: 100, sales2026: Infinity }],
        },
      })
    ).toThrow(
      '[VizFlow] Chart: value at row 0 for key "sales2026" is not a finite number'
    )
  })
})
