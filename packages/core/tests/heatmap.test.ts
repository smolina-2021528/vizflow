import { describe, expect, it } from 'vitest'
import { heatmap } from '../src/index.js'

const baseConfig = {
  title: 'Weekly Activity',
  subtitle: 'Activity by product and day',
  rows: ['Product A', 'Product B'],
  columns: ['Mon', 'Tue', 'Wed'],
  values: [
    [10, 20, 30],
    [5, 15, 25],
  ],
}

describe('heatmap', () => {
  it('returns html, css and render', () => {
    const output = heatmap(baseConfig)

    expect(output.html).toContain('vf-heatmap-card')
    expect(output.html).toContain('Weekly Activity')
    expect(output.html).toContain('Activity by product and day')
    expect(output.css).toContain('vf-heatmap-table')
    expect(output.render()).toContain('<style>')
  })

  it('renders row labels, column labels and values', () => {
    const output = heatmap(baseConfig)

    expect(output.html).toContain('Product A')
    expect(output.html).toContain('Product B')
    expect(output.html).toContain('Mon')
    expect(output.html).toContain('Tue')
    expect(output.html).toContain('30')
  })

  it('formats numeric values', () => {
    const output = heatmap({
      ...baseConfig,
      values: [
        [125000, 200000, 300000],
        [50000, 150000, 250000],
      ],
      valueFormat: {
        type: 'currency',
        currency: 'GTQ',
        locale: 'es-GT',
        maximumFractionDigits: 0,
      },
    })

    expect(output.html).toContain('Q')
    expect(output.html).toContain('125,000')
  })

  it('supports compact density and color scales', () => {
    const output = heatmap({
      ...baseConfig,
      density: 'compact',
      colorScale: 'green',
    })

    expect(output.html).toContain('vf-heatmap-density-compact')
    expect(output.html).toContain('vf-heatmap-scale-green')
    expect(output.css).toContain('vf-heatmap-density-compact')
  })

  it('falls back to comfortable density and blue scale', () => {
    const output = heatmap({
      ...baseConfig,
      density: 'invalid' as 'comfortable',
      colorScale: 'invalid' as 'blue',
    })

    expect(output.html).toContain('vf-heatmap-density-comfortable')
    expect(output.html).toContain('vf-heatmap-scale-blue')
  })

  it('can hide visible cell values while keeping accessible labels', () => {
    const output = heatmap({
      ...baseConfig,
      showValues: false,
    })

    expect(output.html).not.toContain('class="vf-heatmap-value"')
    expect(output.html).toContain('aria-label="Product A Mon 10"')
    expect(output.html).toContain('title="Product A / Mon: 10"')
  })

  it('escapes text values before rendering HTML', () => {
    const output = heatmap({
      title: '<Title>',
      subtitle: '<Subtitle>',
      rows: ['<Row>'],
      columns: ['<Column>'],
      values: [[10]],
    })

    expect(output.html).toContain('&lt;Title&gt;')
    expect(output.html).toContain('&lt;Subtitle&gt;')
    expect(output.html).toContain('&lt;Row&gt;')
    expect(output.html).toContain('&lt;Column&gt;')
    expect(output.html).not.toContain('<Title>')
    expect(output.html).not.toContain('<Subtitle>')
  })

  it('supports custom min and max bounds', () => {
    const output = heatmap({
      ...baseConfig,
      min: 0,
      max: 100,
    })

    expect(output.html).toContain('hsl(')
  })

  it('rejects empty rows', () => {
    expect(() =>
      heatmap({
        ...baseConfig,
        rows: [],
        values: [],
      })
    ).toThrow('[VizFlow] Heatmap rows cannot be empty')
  })

  it('rejects empty columns', () => {
    expect(() =>
      heatmap({
        ...baseConfig,
        columns: [],
        values: [[], []],
      })
    ).toThrow('[VizFlow] Heatmap columns cannot be empty')
  })

  it('rejects values with a row count that does not match rows length', () => {
    expect(() =>
      heatmap({
        ...baseConfig,
        values: [[1, 2, 3]],
      })
    ).toThrow('[VizFlow] Heatmap values row count must match rows length')
  })

  it('rejects values with a column count that does not match columns length', () => {
    expect(() =>
      heatmap({
        ...baseConfig,
        values: [
          [1, 2],
          [3, 4],
        ],
      })
    ).toThrow('[VizFlow] Heatmap values at row 0 must match columns length')
  })

  it('rejects non-finite values', () => {
    expect(() =>
      heatmap({
        ...baseConfig,
        values: [
          [10, Number.NaN, 30],
          [5, 15, 25],
        ],
      })
    ).toThrow(
      '[VizFlow] Heatmap value at row 0, column 1 must be a finite number'
    )
  })

  it('rejects non-finite min and max values', () => {
    expect(() =>
      heatmap({
        ...baseConfig,
        min: Number.NaN,
      })
    ).toThrow('[VizFlow] Heatmap min must be a finite number')

    expect(() =>
      heatmap({
        ...baseConfig,
        max: Infinity,
      })
    ).toThrow('[VizFlow] Heatmap max must be a finite number')
  })

  it('rejects max lower than min', () => {
    expect(() =>
      heatmap({
        ...baseConfig,
        min: 100,
        max: 1,
      })
    ).toThrow('[VizFlow] Heatmap max must be greater than or equal to min')
  })
})