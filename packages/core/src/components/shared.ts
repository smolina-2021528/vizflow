import type {
  ComponentAppearance,
  ProgressBarSize,
  ProgressBarVariant,
  ValueFormatOptions,
} from '../types/index.js'
import {
  generateId,
  resolveValueFormatOptions,
  sanitizeBoolean,
  sanitizeFiniteNumber,
} from '../charts/shared.js'

// ─── Shared helpers for dashboard components ──────────────────────

interface ResolvedComponentAppearance {
  card: boolean
  shadow: boolean
  radius: string
}

export { generateId }

export function assertFiniteComponentNumber(
  value: unknown,
  context: string
): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`[VizFlow] ${context} must be a finite number`)
  }
}

export function formatValueForDisplay(
  value: number,
  format?: ValueFormatOptions
): string {
  const resolved = resolveValueFormatOptions(format)

  const formatterOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: resolved.minimumFractionDigits,
    maximumFractionDigits: resolved.maximumFractionDigits,
  }

  if (resolved.type === 'currency') {
    formatterOptions.style = 'currency'
    formatterOptions.currency = resolved.currency
  }

  if (resolved.type === 'percent') {
    formatterOptions.style = 'percent'
  }

  if (resolved.type === 'compact') {
    formatterOptions.notation = 'compact'
    formatterOptions.compactDisplay = 'short'
  }

  try {
    return (
      resolved.prefix +
      new Intl.NumberFormat(resolved.locale, formatterOptions).format(value) +
      resolved.suffix
    )
  } catch {
    return resolved.prefix + String(value) + resolved.suffix
  }
}

export function formatSignedValueForDisplay(
  value: number,
  format?: ValueFormatOptions
): string {
  const formatted = formatValueForDisplay(Math.abs(value), format)

  if (value > 0) {
    return `+${formatted}`
  }

  if (value < 0) {
    return `-${formatted}`
  }

  return formatted
}

function resolveComponentAppearance(
  appearance: ComponentAppearance | undefined
): ResolvedComponentAppearance {
  const card = sanitizeBoolean(appearance?.card, true)
  const shadow = card ? sanitizeBoolean(appearance?.shadow, true) : false

  const radiusByName: Record<
    NonNullable<ComponentAppearance['rounded']>,
    string
  > = {
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

export function buildBaseComponentCss(
  id: string,
  width: number,
  appearance?: ComponentAppearance
): string {
  const resolvedAppearance = resolveComponentAppearance(appearance)

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
  `.trim()
}

export function resolveProgressBarVariant(
  variant: ProgressBarVariant | undefined
): ProgressBarVariant {
  if (
    variant === 'success' ||
    variant === 'warning' ||
    variant === 'danger' ||
    variant === 'info'
  ) {
    return variant
  }

  return 'default'
}

export function resolveProgressBarSize(size: ProgressBarSize | undefined): {
  className: string
  height: string
} {
  if (size === 'sm') {
    return { className: 'vf-progress-sm', height: '8px' }
  }

  if (size === 'lg') {
    return { className: 'vf-progress-lg', height: '16px' }
  }

  return { className: 'vf-progress-md', height: '12px' }
}

export function resolveSafeWidth(width: unknown, fallback: number): number {
  return sanitizeFiniteNumber(width, fallback, { min: 1 })
}

export function resolveProgressPercentage(value: number, max: number): number {
  const ratio = max === 0 ? 0 : value / max
  const clampedRatio = Math.min(Math.max(ratio, 0), 1)

  return Number((clampedRatio * 100).toFixed(4))
}