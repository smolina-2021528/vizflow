import { DataRow } from '../types/index.js'

// ─── Errors ───────────────────────────────────────────────────────

/** Custom error for JSON parsing failures */
export class JsonParseError extends Error {
  constructor(message: string) {
    super(`[VizFlow] JSON parser error: ${message}`)
    this.name = 'JsonParseError'
  }
}

// ─── Validators ───────────────────────────────────────────────────

/** Checks that a value is a plain object (not array, not null) */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Checks that a value is a valid DataRow primitive */
function isValidPrimitive(
  value: unknown
): value is string | number | boolean | null {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  )
}

/** Validates that each row is a plain object with primitive values only */
function validateRows(rows: unknown[]): DataRow[] {
  return rows.map((row, index) => {
    if (!isPlainObject(row)) {
      throw new JsonParseError(`Item at index ${index} is not a plain object`)
    }

    const validated: DataRow = {}

    for (const [key, value] of Object.entries(row)) {
      if (!isValidPrimitive(value)) {
        throw new JsonParseError(
          `Value at row ${index}, key "${key}" must be a string, number, boolean, or null`
        )
      }
      validated[key] = value
    }

    return validated
  })
}

// ─── Parser ───────────────────────────────────────────────────────

/**
 * Parses a raw JSON string into an array of DataRow.
 * The JSON must be an array of flat objects with primitive values.
 *
 * @param raw - Raw JSON string to parse
 * @returns Array of validated DataRow objects
 * @throws JsonParseError if the JSON is invalid or has wrong shape
 */
export function parseJson(raw: string): DataRow[] {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new JsonParseError('Input is not valid JSON')
  }

  if (!Array.isArray(parsed)) {
    throw new JsonParseError('JSON root must be an array of objects')
  }

  if (parsed.length === 0) {
    throw new JsonParseError('JSON array must contain at least one item')
  }

  return validateRows(parsed)
}
