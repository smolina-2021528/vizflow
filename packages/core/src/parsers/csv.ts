import { DataRow } from '../types/index.js'

// ─── Errors ───────────────────────────────────────────────────────

/** Custom error for CSV parsing failures */
export class CsvParseError extends Error {
  constructor(message: string) {
    super(`[VizFlow] CSV parser error: ${message}`)
    this.name = 'CsvParseError'
  }
}

// ─── Type inference ───────────────────────────────────────────────
/**
 * Infers the correct primitive type from a raw CSV string value.
 * Order of inference: null → boolean → number → string
 */
function inferType(value: string): string | number | boolean | null {
  const trimmed = value.trim()

  // Empty string or explicit null → null
  if (trimmed === '' || trimmed.toLowerCase() === 'null') return null

  // Boolean inference
  if (trimmed.toLowerCase() === 'true') return true
  if (trimmed.toLowerCase() === 'false') return false

  // Number inference — rejects strings like "12abc"
  const asNumber = Number(trimmed)
  if (!isNaN(asNumber) && trimmed !== '') return asNumber

  // Default: keep as string
  return trimmed
}

// ─── Row parser ───────────────────────────────────────────────────
/**
 * Splits a single CSV line into individual cell values.
 * Handles quoted fields that may contain commas inside them.
 *
 * @param line - A single raw CSV line
 * @returns Array of cell strings
 */
function splitLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      // Toggle quoted field mode
      insideQuotes = !insideQuotes
      continue
    }

    if (char === ',' && !insideQuotes) {
      cells.push(current)
      current = ''
      continue
    }

    current += char
  }

  // Push the last cell
  cells.push(current)

  return cells
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
  const lines = raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  if (lines.length === 0) {
    throw new CsvParseError('Input is empty')
  }

  if (lines.length < 2) {
    throw new CsvParseError(
      'CSV must have at least one header row and one data row'
    )
  }

  // First line is always the header
  const headers = splitLine(lines[0])

  if (headers.length === 0) {
    throw new CsvParseError('Header row is empty')
  }

  // Check for duplicate headers
  const uniqueHeaders = new Set(headers)
  if (uniqueHeaders.size !== headers.length) {
    throw new CsvParseError('Header row contains duplicate column names')
  }

  // Parse each data row
  return lines.slice(1).map((line, index) => {
    const cells = splitLine(line)

    if (cells.length !== headers.length) {
      throw new CsvParseError(
        `Row ${index + 1} has ${cells.length} columns but header has ${headers.length}`
      )
    }

    const row: DataRow = {}

    headers.forEach((header, i) => {
      row[header] = inferType(cells[i])
    })

    return row
  })
}
