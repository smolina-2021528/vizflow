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

  it('parses booleans and null values', () => {
    const csv = `name,active,notes\nAlpha,true,null\nBeta,false,`

    const rows = parseCsv(csv)

    expect(rows[0].active).toBe(true)
    expect(rows[0].notes).toBeNull()
    expect(rows[1].active).toBe(false)
    expect(rows[1].notes).toBeNull()
  })

  it('removes UTF-8 BOM from the first header', () => {
    const csv = `\uFEFFname,value\nAlpha,10`

    const rows = parseCsv(csv)

    expect(rows[0].name).toBe('Alpha')
    expect(Object.keys(rows[0])).toEqual(['name', 'value'])
  })

  it('supports comma characters inside quoted fields', () => {
    const csv = `name,note,value\nAlpha,"Hello, world",10\nBeta,"A, B, C",20`

    const rows = parseCsv(csv)

    expect(rows).toHaveLength(2)
    expect(rows[0].note).toBe('Hello, world')
    expect(rows[1].note).toBe('A, B, C')
  })

  it('supports escaped quotes inside quoted fields', () => {
    const csv = `name,note\nAlpha,"He said ""hello"" today"`

    const rows = parseCsv(csv)

    expect(rows[0].note).toBe('He said "hello" today')
  })

  it('supports multiline quoted fields', () => {
    const csv = `name,note\nAlpha,"Line one\nLine two"\nBeta,"Single line"`

    const rows = parseCsv(csv)

    expect(rows).toHaveLength(2)
    expect(rows[0].note).toBe('Line one\nLine two')
    expect(rows[1].note).toBe('Single line')
  })

  it('supports CRLF line endings', () => {
    const csv = `name,value\r\nAlpha,10\r\nBeta,20\r\n`

    const rows = parseCsv(csv)

    expect(rows).toHaveLength(2)
    expect(rows[0].name).toBe('Alpha')
    expect(rows[1].value).toBe(20)
  })

  it('ignores blank lines between records', () => {
    const csv = `name,value\n\nAlpha,10\n\nBeta,20\n`

    const rows = parseCsv(csv)

    expect(rows).toHaveLength(2)
    expect(rows[0].name).toBe('Alpha')
    expect(rows[1].name).toBe('Beta')
  })

  it('preserves intentional spaces inside quoted string fields', () => {
    const csv = `name,note\nAlpha,"  padded text  "`

    const rows = parseCsv(csv)

    expect(rows[0].note).toBe('  padded text  ')
  })

  it('still infers quoted numeric values as numbers', () => {
    const csv = `name,value\nAlpha,"10.5"`

    const rows = parseCsv(csv)

    expect(rows[0].value).toBe(10.5)
  })

  it('rejects empty header names', () => {
    const csv = `name,,value\nAlpha,test,10`

    expect(() => parseCsv(csv)).toThrow(
      '[VizFlow] CSV parser error: Header row contains empty column names'
    )
  })

  it('rejects duplicate headers after trimming', () => {
    const csv = `name, name,value\nAlpha,Beta,10`

    expect(() => parseCsv(csv)).toThrow(
      '[VizFlow] CSV parser error: Header row contains duplicate column names'
    )
  })

  it('rejects rows with too few columns', () => {
    const csv = `name,value\nAlpha`

    expect(() => parseCsv(csv)).toThrow(
      '[VizFlow] CSV parser error: Row 1 has 1 columns but header has 2'
    )
  })

  it('rejects rows with too many columns', () => {
    const csv = `name,value\nAlpha,10,extra`

    expect(() => parseCsv(csv)).toThrow(
      '[VizFlow] CSV parser error: Row 1 has 3 columns but header has 2'
    )
  })

  it('rejects unclosed quoted fields', () => {
    const csv = `name,note\nAlpha,"Unclosed note`

    expect(() => parseCsv(csv)).toThrow(
      '[VizFlow] CSV parser error: Unclosed quoted field'
    )
  })

  it('rejects quotes inside unquoted fields', () => {
    const csv = `name,note\nAlpha,He said "hello"`

    expect(() => parseCsv(csv)).toThrow(
      '[VizFlow] CSV parser error: Unexpected quote inside unquoted field'
    )
  })

  it('rejects unexpected characters after a closing quote', () => {
    const csv = `name,note\nAlpha,"hello"x`

    expect(() => parseCsv(csv)).toThrow(
      '[VizFlow] CSV parser error: Unexpected character after closing quote'
    )
  })

  it('rejects explicit Infinity values', () => {
    const csv = `name,value\nAlpha,Infinity`

    expect(() => parseCsv(csv)).toThrow(
      '[VizFlow] CSV parser error: Non-finite numeric value "Infinity" is not allowed'
    )
  })

  it('rejects explicit NaN values', () => {
    const csv = `name,value\nAlpha,NaN`

    expect(() => parseCsv(csv)).toThrow(
      '[VizFlow] CSV parser error: Non-finite numeric value "NaN" is not allowed'
    )
  })

  it('rejects numeric values that overflow to Infinity', () => {
    const csv = `name,value\nAlpha,1e309`

    expect(() => parseCsv(csv)).toThrow(
      '[VizFlow] CSV parser error: Non-finite numeric value "1e309" is not allowed'
    )
  })

  it('keeps non-numeric text values as strings', () => {
    const csv = `name,value\nAlpha,12abc`

    const rows = parseCsv(csv)

    expect(rows[0].value).toBe('12abc')
  })
})

describe('parseJson', () => {
  it('parses JSON string into DataRow array', () => {
    const json = `[{"name":"Alpha","value":10},{"name":"Beta","value":20}]`
    const rows = parseJson(json)

    expect(rows).toHaveLength(2)
    expect(rows[0].name).toBe('Alpha')
  })

  it('rejects JSON root that is not an array', () => {
    const json = `{"name":"Alpha","value":10}`

    expect(() => parseJson(json)).toThrow(
      '[VizFlow] JSON parser error: JSON root must be an array of objects'
    )
  })

  it('rejects nested objects', () => {
    const json = `[{"name":"Alpha","meta":{"value":10}}]`

    expect(() => parseJson(json)).toThrow(
      '[VizFlow] JSON parser error: Value at row 0, key "meta" must be a string, number, boolean, or null'
    )
  })

  it('rejects arrays inside rows', () => {
    const json = `[{"name":"Alpha","values":[10,20]}]`

    expect(() => parseJson(json)).toThrow(
      '[VizFlow] JSON parser error: Value at row 0, key "values" must be a string, number, boolean, or null'
    )
  })

  it('rejects numeric values that overflow to Infinity', () => {
    const json = `[{"name":"Alpha","value":1e309}]`

    expect(() => parseJson(json)).toThrow(
      '[VizFlow] JSON parser error: Value at row 0, key "value" must be a finite number'
    )
  })
})