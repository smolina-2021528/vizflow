import { describe, it, expect } from 'vitest'
import { table } from '../src/table/index.js'

const config = {
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'score', label: 'Score' },
  ],
  data: {
    kind: 'inline' as const,
    rows: [
      { name: 'Ana', score: 95 },
      { name: 'Carlos', score: 87 },
    ],
  },
}

describe('table', () => {
  it('returns html with table element', () => {
    const output = table(config)
    expect(output.html).toContain('<table')
    expect(output.html).toContain('Ana')
  })

  it('render includes style tag', () => {
    const output = table(config)
    expect(output.render()).toContain('<style>')
  })
})
