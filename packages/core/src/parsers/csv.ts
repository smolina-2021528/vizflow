import type { DataRow } from '../types/index.js'

// ─── Errors ───────────────────────────────────────────────────────

/** Custom error for CSV parsing failures */
export class CsvParseError extends Error {
  constructor(message: string) {
    super(`[VizFlow] CSV parser error: ${message}`)
    this.name = 'CsvParseError'
  }
}

// ─── Internal types ────────────────────────────────────────────────

interface CsvCell {
  value: string
  quoted: boolean
}

type CsvRecord = CsvCell[]

// ─── Type inference ───────────────────────────────────────────────

function looksLikeNumericValue(value: string): boolean {
  return /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value)
}

function isNonFiniteToken(value: string): boolean {
  const normalized = value.toLowerCase()

  return (
    normalized === 'nan' ||
    normalized === 'infinity' ||
    normalized === '+infinity' ||
    normalized === '-infinity'
  )
}

/**
 * Infers the correct primitive type from a raw CSV string value.
 * Order of inference: null → boolean → finite number → string.
 *
 * Quoted string values preserve surrounding spaces when they are not inferred
 * as null, boolean, or number.
 */
function inferType(
  value: string,
  quoted: boolean
): string | number | boolean | null {
  const trimmed = value.trim()
  const normalized = trimmed.toLowerCase()

  // Empty string or explicit null → null
  if (trimmed === '' || normalized === 'null') return null

  // Boolean inference
  if (normalized === 'true') return true
  if (normalized === 'false') return false

  // Reject unsafe numeric-like values before they reach chart/table rendering
  if (isNonFiniteToken(trimmed)) {
    throw new CsvParseError(`Non-finite numeric value "${trimmed}" is not allowed`)
  }

  if (looksLikeNumericValue(trimmed)) {
    const asNumber = Number(trimmed)

    if (!Number.isFinite(asNumber)) {
      throw new CsvParseError(
        `Non-finite numeric value "${trimmed}" is not allowed`
      )
    }

    return asNumber
  }

  // Default: keep as string.
  // Quoted strings preserve intentional spacing; unquoted strings are trimmed.
  return quoted ? value : trimmed
}

// ─── Record parser ────────────────────────────────────────────────

function isBlankRecord(record: CsvRecord): boolean {
  return record.every(cell => !cell.quoted && cell.value.trim().length === 0)
}

/**
 * Parses raw CSV text into records while preserving CSV quoting rules.
 *
 * Supports:
 * - commas inside quoted fields
 * - escaped quotes using ""
 * - multiline quoted fields
 * - CRLF and LF line endings
 */
function parseRecords(raw: string): CsvRecord[] {
  const records: CsvRecord[] = []
  let record: CsvRecord = []
  let current = ''

  let insideQuotes = false
  let fieldStarted = false
  let quotedField = false
  let afterClosingQuote = false

  function pushCell(): void {
    record.push({
      value: current,
      quoted: quotedField,
    })

    current = ''
    insideQuotes = false
    fieldStarted = false
    quotedField = false
    afterClosingQuote = false
  }

  function pushRecord(): void {
    pushCell()

    if (!isBlankRecord(record)) {
      records.push(record)
    }

    record = []
  }

  function consumeNewline(char: string, nextChar: string | undefined): boolean {
    if (char === '\r' && nextChar === '\n') {
      return true
    }

    return false
  }

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i]
    const nextChar = raw[i + 1]

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          current += '"'
          i++
          continue
        }

        insideQuotes = false
        afterClosingQuote = true
        continue
      }

      if (char === '\r') {
        if (nextChar === '\n') {
          current += '\n'
          i++
          continue
        }

        current += '\n'
        continue
      }

      current += char
      continue
    }

    if (afterClosingQuote) {
      if (char === ',') {
        pushCell()
        continue
      }

      if (char === '\n' || char === '\r') {
        if (consumeNewline(char, nextChar)) {
          i++
        }

        pushRecord()
        continue
      }

      if (/\s/.test(char)) {
        continue
      }

      throw new CsvParseError('Unexpected character after closing quote')
    }

    if (char === '"') {
      if (!fieldStarted || current.trim().length === 0) {
        current = ''
        insideQuotes = true
        fieldStarted = true
        quotedField = true
        continue
      }

      throw new CsvParseError('Unexpected quote inside unquoted field')
    }

    if (char === ',') {
      pushCell()
      continue
    }

    if (char === '\n' || char === '\r') {
      if (consumeNewline(char, nextChar)) {
        i++
      }

      pushRecord()
      continue
    }

    current += char
    fieldStarted = true
  }

  if (insideQuotes) {
    throw new CsvParseError('Unclosed quoted field')
  }

  if (
    record.length > 0 ||
    current.length > 0 ||
    fieldStarted ||
    afterClosingQuote
  ) {
    pushRecord()
  }

  return records
}

// ─── Main parser ──────────────────────────────────────────────────

/**
 * Parses a raw CSV string into an array of DataRow.
 * The first row is treated as headers.
 * Values are automatically inferred as number, boolean, null, or string.
 *
 * @param raw - Raw CSV string to parse
 * @returns Array of validated DataRow objects
 * @throws CsvParseError if the CSV is malformed or empty
 */
export function parseCsv(raw: string): DataRow[] {
  const normalizedRaw = raw.replace(/^\uFEFF/, '')
  const records = parseRecords(normalizedRaw)

  if (records.length === 0) {
    throw new CsvParseError('Input is empty')
  }

  if (records.length < 2) {
    throw new CsvParseError(
      'CSV must have at least one header row and one data row'
    )
  }

  // First record is always the header
  const headers = records[0].map(cell => cell.value.trim())

  if (headers.length === 0) {
    throw new CsvParseError('Header row is empty')
  }

  if (headers.some(header => header.length === 0)) {
    throw new CsvParseError('Header row contains empty column names')
  }

  // Check for duplicate headers
  const uniqueHeaders = new Set(headers)
  if (uniqueHeaders.size !== headers.length) {
    throw new CsvParseError('Header row contains duplicate column names')
  }

  // Parse each data row
  return records.slice(1).map((record, index) => {
    if (record.length !== headers.length) {
      throw new CsvParseError(
        `Row ${index + 1} has ${record.length} columns but header has ${headers.length}`
      )
    }

    const row: DataRow = {}

    headers.forEach((header, i) => {
      const cell = record[i]
      row[header] = inferType(cell.value, cell.quoted)
    })

    return row
  })
}