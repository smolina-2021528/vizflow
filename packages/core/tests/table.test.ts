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

  it('escapes cell and header values before rendering HTML', () => {
    const output = table({
      columns: [{ key: 'name', label: '<Name>' }],
      data: {
        kind: 'inline',
        rows: [{ name: '<script>alert("x")</script>' }],
      },
    })

    expect(output.html).toContain('&lt;Name&gt;')
    expect(output.html).toContain(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    )
  })

  it('respects non-sortable columns and width styles', () => {
    const output = table({
      columns: [{ key: 'name', label: 'Name', sortable: false, width: '240px' }],
      data: {
        kind: 'inline',
        rows: [{ name: 'Ana' }],
      },
    })

    expect(output.html).toContain('style="width:240px"')
    expect(output.html).not.toContain('<th data-key="name" class="vf-sortable"')
  })

  it('respects pageSize from table config', () => {
    const output = table({
      ...config,
      pageSize: 0,
    })

    expect(output.html).toContain('const PAGE_SIZE = 0')
  })

  it('allows table options to override config pageSize', () => {
    const output = table(
      {
        ...config,
        pageSize: 0,
      },
      {
        pageSize: 5,
      }
    )

    expect(output.html).toContain('const PAGE_SIZE = 5')
  })

  it('falls back to default pageSize when pageSize is invalid', () => {
    const output = table(config, {
      pageSize: '10); alert("x"); //' as unknown as number,
    })

    expect(output.html).toContain('const PAGE_SIZE = 10')
    expect(output.html).not.toContain('alert("x")')
  })

  it('clamps negative pageSize to zero', () => {
    const output = table(config, {
      pageSize: -10,
    })

    expect(output.html).toContain('const PAGE_SIZE = 0')
  })

  it('truncates decimal pageSize values', () => {
    const output = table(config, {
      pageSize: 5.8,
    })

    expect(output.html).toContain('const PAGE_SIZE = 5')
  })
})