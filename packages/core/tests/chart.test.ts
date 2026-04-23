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
})

describe('lineChart', () => {
  it('returns html with canvas', () => {
    const output = lineChart(baseConfig)
    expect(output.html).toContain('canvas')
  })
})

describe('pieChart', () => {
  it('returns html with canvas', () => {
    const output = pieChart(baseConfig)
    expect(output.html).toContain('canvas')
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
})
