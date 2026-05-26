import type {
  ChartAppearance,
  ChartConfig,
  ChartFormatOptions,
  DataRow,
  ValueFormatOptions,
  ValueFormatType,
} from '../types/index.js'
import { escapeHtml } from '../utils/escape.js'

// ─── Shared utilities for all chart generators ────────────────────

interface NumericSanitizerOptions {
  min?: number
  max?: number
}

interface ResolvedChartAppearance {
  card: boolean
  shadow: boolean
  radius: string
}

export interface ResolvedValueFormatOptions {
  type: ValueFormatType
  locale: string
  currency: string
  minimumFractionDigits: number
  maximumFractionDigits: number
  prefix: string
  suffix: string
}

export interface ResolvedChartFormatOptions {
  x: ResolvedValueFormatOptions
  y: ResolvedValueFormatOptions
  tooltip: ResolvedValueFormatOptions
}

/** Resolves the DataSource from any config that contains a DataSource into a DataRow array */
export function resolveData(config: { data: ChartConfig['data'] }): DataRow[] {
  const { data } = config

  if (data.kind === 'inline') {
    return data.rows
  }

  throw new Error(
    '[VizFlow] File-based DataSource is only supported via the CLI. Use kind: "inline" for programmatic usage.'
  )
}

/** Extracts an array of X axis labels from the resolved rows */
export function extractLabels(rows: DataRow[], xKey: string): string[] {
  return rows.map(row => String(row[xKey] ?? ''))
}

function assertFiniteNumber(
  value: unknown,
  context: string
): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`[VizFlow] ${context} is not a finite number`)
  }
}

/** Sanitizes a numeric option before it is rendered into generated HTML/JS */
export function sanitizeFiniteNumber(
  value: unknown,
  fallback: number,
  options: NumericSanitizerOptions = {}
): number {
  const numericValue =
    typeof value === 'number' || typeof value === 'string'
      ? Number(value)
      : Number.NaN

  if (!Number.isFinite(numericValue)) {
    return fallback
  }

  const min = options.min ?? Number.NEGATIVE_INFINITY
  const max = options.max ?? Number.POSITIVE_INFINITY

  return Math.min(Math.max(numericValue, min), max)
}

/** Sanitizes an integer option before it is rendered into generated HTML/JS */
export function sanitizeInteger(
  value: unknown,
  fallback: number,
  options: NumericSanitizerOptions = {}
): number {
  return Math.trunc(sanitizeFiniteNumber(value, fallback, options))
}

/** Sanitizes a boolean option before it is rendered into generated HTML/JS */
export function sanitizeBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return fallback
}

function sanitizeStringOption(
  value: unknown,
  fallback: string,
  maxLength: number
): string {
  if (typeof value !== 'string') {
    return fallback
  }

  const normalized = value.trim()

  if (normalized.length === 0) {
    return fallback
  }

  return normalized.slice(0, maxLength)
}

function sanitizeAffix(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value.slice(0, 32)
}

function resolveDefaultMaximumFractionDigits(type: ValueFormatType): number {
  switch (type) {
    case 'currency':
      return 2
    case 'percent':
      return 1
    case 'compact':
      return 1
    case 'number':
      return 2
  }
}

function resolveValueFormatType(value: unknown): ValueFormatType {
  if (
    value === 'number' ||
    value === 'currency' ||
    value === 'percent' ||
    value === 'compact'
  ) {
    return value
  }

  return 'number'
}

/** Resolves and sanitizes a value formatter before embedding it in generated JS. */
export function resolveValueFormatOptions(
  format: ValueFormatOptions | undefined
): ResolvedValueFormatOptions {
  const type = resolveValueFormatType(format?.type)
  const defaultMaximumFractionDigits = resolveDefaultMaximumFractionDigits(type)

  const maximumFractionDigits = sanitizeInteger(
    format?.maximumFractionDigits,
    defaultMaximumFractionDigits,
    { min: 0, max: 20 }
  )

  const minimumFractionDigits = sanitizeInteger(
    format?.minimumFractionDigits,
    0,
    { min: 0, max: maximumFractionDigits }
  )

  return {
    type,
    locale: sanitizeStringOption(format?.locale, 'en-US', 32),
    currency: sanitizeStringOption(format?.currency, 'USD', 8).toUpperCase(),
    minimumFractionDigits,
    maximumFractionDigits,
    prefix: sanitizeAffix(format?.prefix),
    suffix: sanitizeAffix(format?.suffix),
  }
}

/** Resolves chart-level formatting with sensible fallbacks. */
export function resolveChartFormatOptions(
  format: ChartFormatOptions | undefined
): ResolvedChartFormatOptions {
  const defaultValueFormat = format?.value

  return {
    x: resolveValueFormatOptions(format?.x ?? defaultValueFormat),
    y: resolveValueFormatOptions(format?.y ?? defaultValueFormat),
    tooltip: resolveValueFormatOptions(
      format?.tooltip ?? format?.y ?? defaultValueFormat
    ),
  }
}

/** Extracts an array of numeric Y axis values from the resolved rows */
export function extractValues(rows: DataRow[], yKey: string): number[] {
  return rows.map((row, index) => {
    const value = row[yKey]

    assertFiniteNumber(value, `Chart: value at row ${index} for key "${yKey}"`)

    return value
  })
}

/** Extracts an array of {x, y} points for scatter charts */
export function extractPoints(
  rows: DataRow[],
  xKey: string,
  yKey: string
): { x: number; y: number }[] {
  return rows.map((row, index) => {
    const x = row[xKey]
    const y = row[yKey]

    assertFiniteNumber(
      x,
      `Scatter chart: x value at row ${index} for key "${xKey}"`
    )

    assertFiniteNumber(
      y,
      `Scatter chart: y value at row ${index} for key "${yKey}"`
    )

    return { x, y }
  })
}

function generateFallbackId(): string {
  const randomPart = Math.random().toString(36).slice(2, 10)
  const timePart = Date.now().toString(36).slice(-4)

  return `${randomPart}${timePart}`.slice(0, 8).padEnd(8, '0')
}

/** Generates a unique 8-character ID for scoping chart and table elements */
export function generateId(): string {
  const cryptoObject = globalThis.crypto

  try {
    if (typeof cryptoObject?.randomUUID === 'function') {
      return cryptoObject.randomUUID().replace(/-/g, '').slice(0, 8)
    }

    if (typeof cryptoObject?.getRandomValues === 'function') {
      const bytes = new Uint8Array(4)
      cryptoObject.getRandomValues(bytes)

      return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join(
        ''
      )
    }
  } catch {
    return generateFallbackId()
  }

  return generateFallbackId()
}

function resolveChartAppearance(
  appearance: ChartAppearance | undefined
): ResolvedChartAppearance {
  const card = sanitizeBoolean(appearance?.card, true)
  const shadow = card ? sanitizeBoolean(appearance?.shadow, true) : false

  const radiusByName: Record<NonNullable<ChartAppearance['rounded']>, string> = {
    none: '0',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
  }

  const rounded = appearance?.rounded
  const radius =
    rounded && rounded in radiusByName ? radiusByName[rounded] : '14px'

  return {
    card,
    shadow,
    radius,
  }
}

/** Generates the shared HTML shell for chart visualizations */
export function buildChartShellHtml(
  id: string,
  title: string,
  subtitle?: string
): string {
  const safeTitle = escapeHtml(title)
  const safeSubtitle = subtitle ? escapeHtml(subtitle) : ''

  const subtitleHtml = safeSubtitle
    ? `<p class="vf-chart-subtitle">${safeSubtitle}</p>`
    : ''

  return `
<div id="vf-${id}" class="vf-chart-card">
  <div class="vf-chart-header">
    <h2 class="vf-chart-title">${safeTitle}</h2>
    ${subtitleHtml}
  </div>
  <div class="vf-chart-canvas-wrapper">
    <canvas id="vf-canvas-${id}" aria-label="${safeTitle}" role="img">
      ${safeTitle}
    </canvas>
  </div>
</div>
  `.trim()
}

/** Generates scoped CSS for any chart wrapper */
export function buildWrapperCss(
  id: string,
  width: number,
  height: number,
  appearance?: ChartAppearance
): string {
  const resolvedAppearance = resolveChartAppearance(appearance)

  const cardBackground = resolvedAppearance.card
    ? 'var(--vf-surface, #ffffff)'
    : 'transparent'
  const cardBorder = resolvedAppearance.card
    ? '1px solid var(--vf-border, #e5e7eb)'
    : 'none'
  const cardPadding = resolvedAppearance.card ? '20px' : '0'
  const cardShadow =
    resolvedAppearance.card && resolvedAppearance.shadow
      ? '0 18px 45px rgba(15, 23, 42, 0.10)'
      : 'none'

  return `
#vf-${id} {
  width: ${width}px;
  max-width: 100%;
  font-family: var(--vf-font, system-ui, sans-serif);
  color: var(--vf-text, #111827);
  background: ${cardBackground};
  border: ${cardBorder};
  border-radius: ${resolvedAppearance.radius};
  box-shadow: ${cardShadow};
  padding: ${cardPadding};
  box-sizing: border-box;
}
#vf-${id} .vf-chart-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}
#vf-${id} .vf-chart-title {
  margin: 0;
  color: var(--vf-text, #111827);
  font-size: 1.05rem;
  line-height: 1.35;
  font-weight: 750;
  letter-spacing: -0.01em;
}
#vf-${id} .vf-chart-subtitle {
  margin: 0;
  color: var(--vf-text-muted, #6b7280);
  font-size: 0.875rem;
  line-height: 1.45;
}
#vf-${id} .vf-chart-canvas-wrapper {
  width: 100%;
  height: ${height}px;
  position: relative;
}
#vf-${id} canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
  `.trim()
}

/** Shared JavaScript guard used by charts before creating Chart.js instances */
export function buildChartRuntimeGuard(): string {
  return `
    if (typeof Chart === 'undefined') {
      throw new Error('[VizFlow] Chart.js is required to render charts. Use toHtmlFile(), toEmbedSnippet(), or load Chart.js before calling render().')
    }
  `.trimEnd()
}

/** Shared JavaScript used by charts to resolve CSS variable colors at runtime */
export function buildChartColorScript(): string {
  return `
    const rootStyles = getComputedStyle(document.documentElement)

    function vfColor(name, fallback) {
      return rootStyles.getPropertyValue(name).trim() || fallback
    }

    function vfWithAlpha(color, alpha) {
      const normalized = color.trim()

      if (/^#[0-9a-f]{3}$/i.test(normalized)) {
        const r = normalized[1] + normalized[1]
        const g = normalized[2] + normalized[2]
        const b = normalized[3] + normalized[3]
        return 'rgba(' + parseInt(r, 16) + ', ' + parseInt(g, 16) + ', ' + parseInt(b, 16) + ', ' + alpha + ')'
      }

      if (/^#[0-9a-f]{6}$/i.test(normalized)) {
        const r = normalized.slice(1, 3)
        const g = normalized.slice(3, 5)
        const b = normalized.slice(5, 7)
        return 'rgba(' + parseInt(r, 16) + ', ' + parseInt(g, 16) + ', ' + parseInt(b, 16) + ', ' + alpha + ')'
      }

      if (/^rgb\\(/i.test(normalized)) {
        return normalized.replace(/^rgb\\(/i, 'rgba(').replace(/\\)$/, ', ' + alpha + ')')
      }

      if (/^hsl\\(/i.test(normalized)) {
        return normalized.replace(/^hsl\\(/i, 'hsla(').replace(/\\)$/, ', ' + alpha + ')')
      }

      return normalized
    }

    const vfChartColors = [
      vfColor('--vf-chart-1', '#6366f1'),
      vfColor('--vf-chart-2', '#8b5cf6'),
      vfColor('--vf-chart-3', '#ec4899'),
      vfColor('--vf-chart-4', '#f59e0b'),
      vfColor('--vf-chart-5', '#10b981')
    ]

    const vfTextColor = vfColor('--vf-text', '#111827')
    const vfMutedTextColor = vfColor('--vf-text-muted', '#6b7280')
    const vfBorderColor = vfColor('--vf-border', '#e5e7eb')
    const vfSurfaceColor = vfColor('--vf-surface', '#ffffff')
  `.trimEnd()
}

/** Shared JavaScript used by charts to format values in ticks and tooltips. */
export function buildValueFormatterScript(): string {
  return `
    function vfFormatValue(value, options) {
      const numericValue = Number(value)

      if (!Number.isFinite(numericValue)) {
        return String(value)
      }

      const config = options || {}
      const type = config.type || 'number'
      const locale = config.locale || 'en-US'
      const currency = config.currency || 'USD'
      const prefix = typeof config.prefix === 'string' ? config.prefix : ''
      const suffix = typeof config.suffix === 'string' ? config.suffix : ''

      const minimumFractionDigits = Number.isFinite(Number(config.minimumFractionDigits))
        ? Number(config.minimumFractionDigits)
        : 0

      const maximumFractionDigits = Number.isFinite(Number(config.maximumFractionDigits))
        ? Number(config.maximumFractionDigits)
        : 2

      const formatterOptions = {
        minimumFractionDigits: minimumFractionDigits,
        maximumFractionDigits: maximumFractionDigits
      }

      if (type === 'currency') {
        formatterOptions.style = 'currency'
        formatterOptions.currency = currency
      }

      if (type === 'percent') {
        formatterOptions.style = 'percent'
      }

      if (type === 'compact') {
        formatterOptions.notation = 'compact'
        formatterOptions.compactDisplay = 'short'
      }

      try {
        return prefix + new Intl.NumberFormat(locale, formatterOptions).format(numericValue) + suffix
      } catch {
        return prefix + String(numericValue) + suffix
      }
    }
  `.trimEnd()
}