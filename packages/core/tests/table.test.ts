import { describe, expect, it } from 'vitest'
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

  it('renders title and subtitle when provided', () => {
    const output = table({
      ...config,
      title: 'Sales Ranking',
      subtitle: 'Top stores by monthly performance',
    })

    expect(output.html).toContain('Sales Ranking')
    expect(output.html).toContain('Top stores by monthly performance')
    expect(output.html).toContain('class="vf-table-title"')
    expect(output.html).toContain('class="vf-table-subtitle"')
    expect(output.html).toContain('<caption class="vf-table-caption">Sales Ranking</caption>')
  })

  it('escapes cell, header, title and subtitle values before rendering HTML', () => {
    const output = table({
      title: '<Title>',
      subtitle: '<Subtitle>',
      columns: [{ key: 'name', label: '<Name>' }],
      data: {
        kind: 'inline',
        rows: [{ name: '<script>alert("x")</script>' }],
      },
    })

    expect(output.html).toContain('&lt;Title&gt;')
    expect(output.html).toContain('&lt;Subtitle&gt;')
    expect(output.html).toContain('&lt;Name&gt;')
    expect(output.html).toContain(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    )
    expect(output.html).not.toContain('<Title>')
    expect(output.html).not.toContain('<Subtitle>')
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
    expect(output.html).not.toContain('<th data-key="name" data-align="left" aria-sort="none" class="vf-sortable"')
  })

  it('supports column alignment', () => {
    const output = table({
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'score', label: 'Score', align: 'right' },
      ],
      data: {
        kind: 'inline',
        rows: [{ name: 'Ana', score: 95 }],
      },
    })

    expect(output.html).toContain('data-align="right"')
    expect(output.css).toContain('td[data-align="right"]')
  })

  it('formats numeric column values', () => {
    const output = table({
      columns: [
        { key: 'name', label: 'Name' },
        {
          key: 'sales',
          label: 'Sales',
          align: 'right',
          format: {
            type: 'currency',
            currency: 'GTQ',
            locale: 'es-GT',
            maximumFractionDigits: 0,
          },
        },
      ],
      data: {
        kind: 'inline',
        rows: [{ name: 'Ana', sales: 125000 }],
      },
    })

    expect(output.html).toContain('Q')
    expect(output.html).toContain('125,000')
  })

  it('enables search by default', () => {
    const output = table(config)

    expect(output.html).toContain('class="vf-table-search"')
    expect(output.html).toContain('const TABLE_SEARCHABLE = true')
    expect(output.html).toContain('Showing ')
  })

  it('allows search to be disabled', () => {
    const output = table(config, {
      searchable: false,
    })

    expect(output.html).not.toContain('class="vf-table-search"')
    expect(output.html).toContain('const TABLE_SEARCHABLE = false')
  })

  it('escapes custom search placeholders', () => {
    const output = table(config, {
      searchPlaceholder: '<Search>',
    })

    expect(output.html).toContain('placeholder="&lt;Search&gt;"')
    expect(output.html).not.toContain('placeholder="<Search>"')
  })

  it('supports compact density', () => {
    const output = table(config, {
      density: 'compact',
    })

    expect(output.html).toContain('vf-table-density-compact')
    expect(output.css).toContain('vf-table-density-compact')
  })

  it('falls back to comfortable density', () => {
    const output = table(config, {
      density: 'invalid' as 'comfortable',
    })

    expect(output.html).toContain('vf-table-density-comfortable')
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