// ─── CLI numeric utilities ────────────────────────────────────────

/**
 * Parses a CLI input value as a finite number.
 * Returns null when the value is empty, malformed, NaN, Infinity or -Infinity.
 */
export function parseFiniteNumber(value: string): number | null {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return null
  }

  const numericValue = Number(trimmed)

  if (!Number.isFinite(numericValue)) {
    return null
  }

  return numericValue
}

/**
 * Parses a CLI input value as a finite number.
 * Returns fallback when the value is invalid.
 */
export function parseFiniteNumberOrDefault(
  value: string,
  fallback: number
): number {
  return parseFiniteNumber(value) ?? fallback
}

/**
 * Parses a CLI input value as a non-negative integer.
 * Returns fallback when the value is invalid.
 */
export function parseNonNegativeIntegerOrDefault(
  value: string,
  fallback: number
): number {
  const numericValue = parseFiniteNumber(value)

  if (numericValue === null) {
    return fallback
  }

  return Math.max(0, Math.trunc(numericValue))
}

/**
 * Converts a table cell to a number only when the full input is numeric and finite.
 * Otherwise keeps the original text.
 */
export function parseTableCell(value: string): string | number {
  const numericValue = parseFiniteNumber(value)

  return numericValue === null ? value : numericValue
}