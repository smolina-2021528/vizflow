import { describe, it, expect } from 'vitest'
import { parseCsv } from '../src/parsers/csv.js'
import { parseJson } from '../src/parsers/json.js'

describe('parseCsv', () => {
  it('parses CSV string into DataRow array', () => {
    const csv = `name,value\nAlpha,10\nBeta,20`
    const rows = parseCsv(csv)
    expect(rows).toHaveLength(2)
    expect(rows[0].name).toBe('Alpha')
    expect(rows[0].value).toBe(10)
  })
})

describe('parseJson', () => {
  it('parses JSON string into DataRow array', () => {
    const json = `[{"name":"Alpha","value":10},{"name":"Beta","value":20}]`
    const rows = parseJson(json)
    expect(rows).toHaveLength(2)
    expect(rows[0].name).toBe('Alpha')
  })
})
