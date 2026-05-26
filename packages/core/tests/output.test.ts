import { describe, it, expect } from 'vitest'
import { barChart } from '../src/charts/index.js'
import { toEmbedSnippet, toHtmlFile } from '../src/output.js'

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

  it('loads the same Chart.js version declared by the project', () => {
    const output = barChart(chartConfig)

    const html = toHtmlFile(output)

    expect(html).toContain(
      'https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js'
    )
  })

  it('can disable Chart.js script when output does not need it', () => {
    const output = barChart(chartConfig)

    const html = toHtmlFile(output, {
      includeChartJs: false,
    })

    expect(html).not.toContain('cdn.jsdelivr.net/npm/chart.js')
  })
})

describe('toEmbedSnippet', () => {
  it('loads Chart.js 4.5.1 by default', () => {
    const output = barChart(chartConfig)

    const html = toEmbedSnippet(output)

    expect(html).toContain(
      'https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js'
    )
  })

  it('can disable Chart.js script', () => {
    const output = barChart(chartConfig)

    const html = toEmbedSnippet(output, {
      includeChartJs: false,
    })

    expect(html).not.toContain('cdn.jsdelivr.net/npm/chart.js')
  })

  it('can disable usage instructions', () => {
    const output = barChart(chartConfig)

    const html = toEmbedSnippet(output, {
      includeInstructions: false,
    })

    expect(html).not.toContain('VizFlow embed snippet')
  })
})