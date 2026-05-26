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