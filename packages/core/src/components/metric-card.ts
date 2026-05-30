import type { MetricCardConfig, MetricTrendDirection, VizFlowOutput } from '../types/index.js'
import { escapeHtml } from '../utils/escape.js'
import {
  assertFiniteComponentNumber,
  buildBaseComponentCss,
  formatSignedValueForDisplay,
  formatValueForDisplay,
  generateId,
  resolveSafeWidth,
} from './shared.js'

// ─── Metric card helpers ──────────────────────────────────────────

function resolveTrendDirection(
  value: number,
  direction?: MetricTrendDirection
): MetricTrendDirection {
  if (direction === 'up' || direction === 'down' || direction === 'neutral') {
    return direction
  }

  if (value > 0) {
    return 'up'
  }

  if (value < 0) {
    return 'down'
  }

  return 'neutral'
}

function resolveTrendIcon(direction: MetricTrendDirection): string {
  if (direction === 'up') {
    return '▲'
  }

  if (direction === 'down') {
    return '▼'
  }

  return '●'
}

function buildTrendHtml(config: MetricCardConfig): string {
  if (!config.trend) {
    return ''
  }

  assertFiniteComponentNumber(config.trend.value, 'MetricCard trend value')

  const direction = resolveTrendDirection(
    config.trend.value,
    config.trend.direction
  )

  const trendFormat = config.trend.format ?? {
    type: 'number',
    maximumFractionDigits: 1,
    suffix: '%',
  }

  const formattedTrendValue = formatSignedValueForDisplay(
    config.trend.value,
    trendFormat
  )

  const safeTrendValue = escapeHtml(formattedTrendValue)
  const safeTrendLabel = config.trend.label
    ? escapeHtml(config.trend.label)
    : ''
  const icon = resolveTrendIcon(direction)

  return `
  <div class="vf-metric-trend vf-metric-trend-${direction}">
    <span class="vf-metric-trend-icon" aria-hidden="true">${icon}</span>
    <span class="vf-metric-trend-value">${safeTrendValue}</span>
    ${
      safeTrendLabel
        ? `<span class="vf-metric-trend-label">${safeTrendLabel}</span>`
        : ''
    }
  </div>
  `.trim()
}

function buildHtml(
  id: string,
  config: MetricCardConfig,
  formattedValue: string
): string {
  const safeTitle = escapeHtml(config.title)
  const safeSubtitle = config.subtitle ? escapeHtml(config.subtitle) : ''
  const safeFooter = config.footer ? escapeHtml(config.footer) : ''
  const safeValue = escapeHtml(formattedValue)

  const subtitleHtml = safeSubtitle
    ? `<p class="vf-metric-subtitle">${safeSubtitle}</p>`
    : ''

  const footerHtml = safeFooter
    ? `<p class="vf-metric-footer">${safeFooter}</p>`
    : ''

  const trendHtml = buildTrendHtml(config)

  return `
<div id="vf-${id}" class="vf-metric-card">
  <div class="vf-metric-header">
    <p class="vf-metric-title">${safeTitle}</p>
    ${subtitleHtml}
  </div>
  <div class="vf-metric-value">${safeValue}</div>
  ${trendHtml}
  ${footerHtml}
</div>
  `.trim()
}

function buildCss(
  id: string,
  width: number,
  config: MetricCardConfig
): string {
  return `
${buildBaseComponentCss(id, width, config.appearance)}
#vf-${id} .vf-metric-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
#vf-${id} .vf-metric-title {
  margin: 0;
  color: var(--vf-text-muted, #6b7280);
  font-size: 0.82rem;
  line-height: 1.35;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
#vf-${id} .vf-metric-subtitle {
  margin: 0;
  color: var(--vf-text-muted, #6b7280);
  font-size: 0.875rem;
  line-height: 1.45;
}
#vf-${id} .vf-metric-value {
  margin: 0;
  color: var(--vf-text, #111827);
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.04em;
}
#vf-${id} .vf-metric-trend {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  margin-top: 12px;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1;
}
#vf-${id} .vf-metric-trend-up {
  color: var(--vf-success, #15803d);
  background: color-mix(in srgb, var(--vf-success, #22c55e) 12%, transparent);
}
#vf-${id} .vf-metric-trend-down {
  color: var(--vf-danger, #b91c1c);
  background: color-mix(in srgb, var(--vf-danger, #ef4444) 12%, transparent);
}
#vf-${id} .vf-metric-trend-neutral {
  color: var(--vf-text-muted, #6b7280);
  background: color-mix(in srgb, var(--vf-border, #e5e7eb) 70%, transparent);
}
#vf-${id} .vf-metric-trend-icon {
  font-size: 0.7rem;
}
#vf-${id} .vf-metric-trend-label {
  font-weight: 600;
  color: currentColor;
  opacity: 0.82;
}
#vf-${id} .vf-metric-footer {
  margin: 14px 0 0 0;
  color: var(--vf-text-muted, #6b7280);
  font-size: 0.8rem;
  line-height: 1.45;
}
  `.trim()
}

// ─── Main generator ───────────────────────────────────────────────

/**
 * Generates a dashboard-style metric card.
 * Useful for KPIs, totals, growth values and executive summaries.
 *
 * @param config - Metric card configuration object
 * @returns VizFlowOutput ready to insert into the DOM
 */
export function metricCard(config: MetricCardConfig): VizFlowOutput {
  assertFiniteComponentNumber(config.value, 'MetricCard value')

  const id = generateId()
  const width = resolveSafeWidth(config.width, 320)

  const formattedValue = formatValueForDisplay(config.value, config.valueFormat)
  const html = buildHtml(id, config, formattedValue)
  const css = buildCss(id, width, config)

  return {
    html,
    css,
    render: () => `<style>${css}</style>\n${html}`,
  }
}