import { describe, it, expect } from 'vitest'
import {
  barChart,
  lineChart,
  pieChart,
  scatterChart,
} from '../src/charts/index.js'

const baseConfig = {
  type: 'bar' as const,
  title: 'Test Chart',
  xKey: 'label',
  yKey: 'value',
  data: {
    kind: 'inline' as const,
    rows: [
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
    ],
  },
}

describe('barChart', () => {
  it('returns html, css and render', () => {
    const output = barChart(baseConfig)

    expect(output.html).toContain('canvas')
    expect(output.css).toContain('vf-')
    expect(output.render()).toContain('<style>')
  })

  it('escapes dangerous script sequences inside chart titles', () => {
    const output = barChart({
      ...baseConfig,
      title: '</script><script>alert("x")</script>',
    })

    expect(output.html).not.toContain('</script><script>alert')
    expect(output.html).toContain('\\u003c/script\\u003e')
  })

  it('uses CSS variable chart colors at runtime', () => {
    const output = barChart(baseConfig)

    expect(output.html).toContain('--vf-chart-1')
  })

  it('rejects NaN values before generating chart html', () => {
    expect(() =>
      barChart({
        ...baseConfig,
        data: {
          kind: 'inline',
          rows: [{ label: 'A', value: Number.NaN }],
        },
      })
    ).toThrow('[VizFlow] Chart: value at row 0 for key "value" is not a finite number')
  })

  it('rejects Infinity values before generating chart html', () => {
    expect(() =>
      barChart({
        ...baseConfig,
        data: {
          kind: 'inline',
          rows: [{ label: 'A', value: Infinity }],
        },
      })
    ).toThrow('[VizFlow] Chart: value at row 0 for key "value" is not a finite number')
  })
})

describe('lineChart', () => {
  it('returns html with canvas', () => {
    const output = lineChart(baseConfig)

    expect(output.html).toContain('canvas')
  })

  it('rejects non-finite line values', () => {
    expect(() =>
      lineChart({
        ...baseConfig,
        data: {
          kind: 'inline',
          rows: [{ label: 'A', value: -Infinity }],
        },
      })
    ).toThrow('[VizFlow] Chart: value at row 0 for key "value" is not a finite number')
  })
})

describe('pieChart', () => {
  it('returns html with canvas', () => {
    const output = pieChart(baseConfig)

    expect(output.html).toContain('canvas')
  })

  it('can show percentages in tooltip labels', () => {
    const output = pieChart(baseConfig, { showPercentages: true })

    expect(output.html).toContain('percentage.toFixed(1)')
  })

  it('rejects non-finite pie values', () => {
    expect(() =>
      pieChart({
        ...baseConfig,
        data: {
          kind: 'inline',
          rows: [{ label: 'A', value: Number.NaN }],
        },
      })
    ).toThrow('[VizFlow] Chart: value at row 0 for key "value" is not a finite number')
  })
})

describe('scatterChart', () => {
  it('returns html with canvas', () => {
    const output = scatterChart({
      ...baseConfig,
      type: 'scatter',
      data: {
        kind: 'inline',
        rows: [
          { label: 1, value: 10 },
          { label: 2, value: 20 },
        ],
      },
    })

    expect(output.html).toContain('canvas')
  })

  it('rejects non-finite x values', () => {
    expect(() =>
      scatterChart({
        ...baseConfig,
        type: 'scatter',
        data: {
          kind: 'inline',
          rows: [{ label: Infinity, value: 10 }],
        },
      })
    ).toThrow(
      '[VizFlow] Scatter chart: x value at row 0 for key "label" is not a finite number'
    )
  })

  it('rejects non-finite y values', () => {
    expect(() =>
      scatterChart({
        ...baseConfig,
        type: 'scatter',
        data: {
          kind: 'inline',
          rows: [{ label: 1, value: Number.NaN }],
        },
      })
    ).toThrow(
      '[VizFlow] Scatter chart: y value at row 0 for key "value" is not a finite number'
    )
  })
})