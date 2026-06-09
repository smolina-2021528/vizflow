import { describe, expect, it } from 'vitest'
import { buildThemeStyle } from '../src/themes/index.js'

describe('buildThemeStyle', () => {
  it('supports the corporate theme', () => {
    const css = buildThemeStyle('corporate')

    expect(css).toContain('--vf-primary:#2563eb')
    expect(css).toContain('--vf-chart-1:#2563eb')
  })

  it('supports the emerald theme', () => {
    const css = buildThemeStyle('emerald')

    expect(css).toContain('--vf-primary:#10b981')
    expect(css).toContain('--vf-chart-1:#10b981')
  })

  it('supports the midnight theme', () => {
    const css = buildThemeStyle('midnight')

    expect(css).toContain('--vf-primary:#8b5cf6')
    expect(css).toContain('--vf-background:#020617')
  })

  it('supports the sunset theme', () => {
    const css = buildThemeStyle('sunset')

    expect(css).toContain('--vf-primary:#f97316')
    expect(css).toContain('--vf-chart-5:#a855f7')
  })

  it('supports the ocean theme', () => {
    const css = buildThemeStyle('ocean')

    expect(css).toContain('--vf-primary:#38bdf8')
    expect(css).toContain('--vf-background:#04111f')
    expect(css).toContain('--vf-chart-2:#14b8a6')
  })
})