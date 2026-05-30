import { describe, expect, it } from 'vitest'
import { metricCard, progressBar } from '../src/index.js'

describe('metricCard', () => {
  it('returns html, css and render', () => {
    const output = metricCard({
      title: 'Total Sales',
      value: 125000,
    })

    expect(output.html).toContain('vf-metric-card')
    expect(output.css).toContain('vf-')
    expect(output.render()).toContain('<style>')
  })

  it('formats metric values as currency', () => {
    const output = metricCard({
        title: 'Ventas totales',
        value: 125000,
        valueFormat: {
        type: 'currency',
        currency: 'GTQ',
        locale: 'es-GT',
        maximumFractionDigits: 0,
        },
     })

    expect(output.html).toContain('Ventas totales')
    expect(output.html).toContain('Q')
    expect(output.html).toContain('125,000')
    })

  it('renders positive trend information', () => {
    const output = metricCard({
      title: 'Growth',
      value: 120,
      trend: {
        value: 12.5,
        direction: 'up',
        label: 'vs previous month',
      },
    })

    expect(output.html).toContain('vf-metric-trend-up')
    expect(output.html).toContain('+12.5%')
    expect(output.html).toContain('vs previous month')
  })

  it('infers negative trend direction', () => {
    const output = metricCard({
      title: 'Growth',
      value: 120,
      trend: {
        value: -8,
        label: 'vs previous month',
      },
    })

    expect(output.html).toContain('vf-metric-trend-down')
    expect(output.html).toContain('-8%')
  })

  it('escapes html in text fields', () => {
    const output = metricCard({
      title: '<Title>',
      subtitle: '<Subtitle>',
      footer: '<Footer>',
      value: 100,
      trend: {
        value: 5,
        label: '<Trend>',
      },
    })

    expect(output.html).toContain('&lt;Title&gt;')
    expect(output.html).toContain('&lt;Subtitle&gt;')
    expect(output.html).toContain('&lt;Footer&gt;')
    expect(output.html).toContain('&lt;Trend&gt;')
    expect(output.html).not.toContain('<Title>')
    expect(output.html).not.toContain('<Subtitle>')
    expect(output.html).not.toContain('<Footer>')
    expect(output.html).not.toContain('<Trend>')
  })

  it('supports disabling the card appearance', () => {
    const output = metricCard({
      title: 'Plain metric',
      value: 100,
      appearance: {
        card: false,
      },
    })

    expect(output.css).toContain('background: transparent')
    expect(output.css).toContain('border: none')
    expect(output.css).toContain('box-shadow: none')
    expect(output.css).toContain('padding: 0')
  })

  it('rejects non-finite metric values', () => {
    expect(() =>
      metricCard({
        title: 'Invalid',
        value: Number.NaN,
      })
    ).toThrow('[VizFlow] MetricCard value must be a finite number')
  })

  it('rejects non-finite trend values', () => {
    expect(() =>
      metricCard({
        title: 'Invalid trend',
        value: 100,
        trend: {
          value: Infinity,
        },
      })
    ).toThrow('[VizFlow] MetricCard trend value must be a finite number')
  })
})

describe('progressBar', () => {
  it('returns html, css and render', () => {
    const output = progressBar({
      title: 'Goal completion',
      value: 75,
      max: 100,
    })

    expect(output.html).toContain('vf-progress-card')
    expect(output.html).toContain('role="progressbar"')
    expect(output.css).toContain('vf-')
    expect(output.render()).toContain('<style>')
  })

  it('renders progress percentage and value', () => {
    const output = progressBar({
      title: 'Meta de ventas',
      value: 75,
      max: 100,
    })

    expect(output.html).toContain('75%')
    expect(output.html).toContain('aria-valuenow="75"')
    expect(output.html).toContain('width:75%')
  })

  it('clamps progress width to 100 percent', () => {
    const output = progressBar({
      title: 'Over target',
      value: 150,
      max: 100,
    })

    expect(output.html).toContain('aria-valuenow="100"')
    expect(output.html).toContain('width:100%')
  })

  it('clamps progress width to 0 percent', () => {
    const output = progressBar({
      title: 'Below zero',
      value: -20,
      max: 100,
    })

    expect(output.html).toContain('aria-valuenow="0"')
    expect(output.html).toContain('width:0%')
  })

  it('supports variants and sizes', () => {
    const output = progressBar({
      title: 'Risk level',
      value: 40,
      max: 100,
      variant: 'danger',
      size: 'lg',
    })

    expect(output.html).toContain('vf-progress-danger')
    expect(output.html).toContain('vf-progress-lg')
    expect(output.css).toContain('height: 16px')
  })

  it('supports formatted values', () => {
  const output = progressBar({
    title: 'Ventas',
    value: 75000,
    max: 100000,
    valueFormat: {
      type: 'currency',
      currency: 'GTQ',
      locale: 'es-GT',
      maximumFractionDigits: 0,
    },
  })

  expect(output.html).toContain('Q')
  expect(output.html).toContain('75,000')
  expect(output.html).toContain('75%')
})

  it('can hide value and percentage metadata', () => {
    const output = progressBar({
      title: 'Hidden meta',
      value: 50,
      max: 100,
      showValue: false,
      showPercentage: false,
    })

    expect(output.html).not.toContain('vf-progress-meta')
  })

  it('escapes html in text fields', () => {
    const output = progressBar({
      title: '<Title>',
      subtitle: '<Subtitle>',
      value: 50,
      max: 100,
    })

    expect(output.html).toContain('&lt;Title&gt;')
    expect(output.html).toContain('&lt;Subtitle&gt;')
    expect(output.html).not.toContain('<Title>')
    expect(output.html).not.toContain('<Subtitle>')
  })

  it('rejects non-finite values', () => {
    expect(() =>
      progressBar({
        title: 'Invalid',
        value: Number.NaN,
      })
    ).toThrow('[VizFlow] ProgressBar value must be a finite number')
  })

  it('rejects non-finite max values', () => {
    expect(() =>
      progressBar({
        title: 'Invalid',
        value: 50,
        max: Infinity,
      })
    ).toThrow('[VizFlow] ProgressBar max must be a finite number')
  })

  it('rejects max values less than or equal to zero', () => {
    expect(() =>
      progressBar({
        title: 'Invalid',
        value: 50,
        max: 0,
      })
    ).toThrow('[VizFlow] ProgressBar max must be greater than 0')
  })
})