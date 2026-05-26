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

  it('renders the chart inside a visual card container', () => {
    const output = barChart({
      ...baseConfig,
      subtitle: 'Quarterly performance',
    })

    expect(output.html).toContain('class="vf-chart-card"')
    expect(output.html).toContain('class="vf-chart-title"')
    expect(output.html).toContain('Test Chart')
    expect(output.html).toContain('Quarterly performance')
    expect(output.css).toContain('box-shadow')
    expect(output.css).toContain('border-radius')
  })

  it('escapes chart title and subtitle inside the visual header', () => {
    const output = barChart({
      ...baseConfig,
      title: '<Title>',
      subtitle: '<Subtitle>',
    })

    expect(output.html).toContain('&lt;Title&gt;')
    expect(output.html).toContain('&lt;Subtitle&gt;')
    expect(output.html).not.toContain('<Title>')
    expect(output.html).not.toContain('<Subtitle>')
  })

  it('supports disabling the visual card appearance', () => {
    const output = barChart({
      ...baseConfig,
      appearance: {
        card: false,
      },
    })

    expect(output.css).toContain('background: transparent')
    expect(output.css).toContain('border: none')
    expect(output.css).toContain('box-shadow: none')
    expect(output.css).toContain('padding: 0')
  })

  it('uses a Chart.js runtime guard', () => {
    const output = barChart(baseConfig)

    expect(output.html).toContain('Chart.js is required to render charts')
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
    ).toThrow(
      '[VizFlow] Chart: value at row 0 for key "value" is not a finite number'
    )
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
    ).toThrow(
      '[VizFlow] Chart: value at row 0 for key "value" is not a finite number'
    )
  })

  it('falls back to safe default dimensions when width or height are invalid', () => {
    const output = barChart({
      ...baseConfig,
      width: Infinity,
      height: Number.NaN,
    })

    expect(output.css).toContain('width: 600px')
    expect(output.css).toContain('height: 400px')
  })

  it('clamps chart dimensions to a minimum of 1px', () => {
    const output = barChart({
      ...baseConfig,
      width: -100,
      height: 0,
    })

    expect(output.css).toContain('width: 1px')
    expect(output.css).toContain('height: 1px')
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
    ).toThrow(
      '[VizFlow] Chart: value at row 0 for key "value" is not a finite number'
    )
  })

  it('falls back to default tension when tension is invalid', () => {
    const output = lineChart(baseConfig, {
      tension: '0); alert("x"); //' as unknown as number,
    })

    expect(output.html).toContain('tension: 0.3')
    expect(output.html).not.toContain('alert("x")')
  })

  it('clamps tension between 0 and 1', () => {
    const output = lineChart(baseConfig, {
      tension: 10,
    })

    expect(output.html).toContain('tension: 1')
  })

  it('falls back to default booleans when boolean options are invalid', () => {
    const output = lineChart(baseConfig, {
      fill: 'invalid' as unknown as boolean,
      showPoints: 'invalid' as unknown as boolean,
    })

    expect(output.html).toContain('fill: false')
    expect(output.html).toContain('pointRadius: 4')
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
    ).toThrow(
      '[VizFlow] Chart: value at row 0 for key "value" is not a finite number'
    )
  })

  it('falls back to default cutoutPercent when cutoutPercent is invalid', () => {
    const output = pieChart(baseConfig, {
      donut: true,
      cutoutPercent: '60); alert("x"); //' as unknown as number,
    })

    expect(output.html).toContain('cutout: "60%"')
    expect(output.html).not.toContain('alert("x")')
  })

  it('clamps cutoutPercent between 0 and 100', () => {
    const output = pieChart(baseConfig, {
      donut: true,
      cutoutPercent: 500,
    })

    expect(output.html).toContain('cutout: "100%"')
  })
})

describe('scatterChart', () => {
  const scatterConfig = {
    ...baseConfig,
    type: 'scatter' as const,
    data: {
      kind: 'inline' as const,
      rows: [
        { label: 1, value: 10 },
        { label: 2, value: 20 },
      ],
    },
  }

  it('returns html with canvas', () => {
    const output = scatterChart(scatterConfig)

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

  it('falls back to default pointRadius when pointRadius is invalid', () => {
    const output = scatterChart(scatterConfig, {
      pointRadius: '5); alert("x"); //' as unknown as number,
    })

    expect(output.html).toContain('pointRadius: 5')
    expect(output.html).toContain('pointHoverRadius: 7')
    expect(output.html).not.toContain('alert("x")')
  })

  it('clamps pointRadius between 0 and 50', () => {
    const output = scatterChart(scatterConfig, {
      pointRadius: 1000,
    })

    expect(output.html).toContain('pointRadius: 50')
    expect(output.html).toContain('pointHoverRadius: 52')
  })
})