import { describe, it, expect } from 'vitest'
import { barChart } from '../src/charts/index.js'
import { toHtmlFile } from '../src/output.js'

const chartConfig = {
  type: 'bar' as const,
  xKey: 'label',
  yKey: 'value',
  data: {
    kind: 'inline' as const,
    rows: [{ label: 'A', value: 1 }],
  },
}

describe('toHtmlFile', () => {
  it('supports the hot theme', () => {
    const output = barChart(chartConfig)

    const html = toHtmlFile(output, { theme: 'hot' })

    expect(html).toMatch(/--vf-primary:\s*#ef4444/)
  })

  it('supports the cold theme', () => {
    const output = barChart(chartConfig)

    const html = toHtmlFile(output, { theme: 'cold' })

    expect(html).toMatch(/--vf-primary:\s*#0ea5e9/)
  })

  it('escapes the standalone page title', () => {
    const output = barChart(chartConfig)

    const html = toHtmlFile(output, { title: '<VizFlow>' })

    expect(html).toContain('<title>&lt;VizFlow&gt;</title>')
  })

  it('can disable Chart.js script when output does not need it', () => {
    const output = barChart(chartConfig)

    const html = toHtmlFile(output, {
      includeChartJs: false,
    })

    expect(html).not.toContain('cdn.jsdelivr.net/npm/chart.js')
  })
})