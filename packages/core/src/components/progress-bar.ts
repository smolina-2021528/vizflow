import type { ProgressBarConfig, VizFlowOutput } from '../types/index.js'
import { escapeHtml } from '../utils/escape.js'
import {
  assertFiniteComponentNumber,
  buildBaseComponentCss,
  formatValueForDisplay,
  generateId,
  resolveProgressBarSize,
  resolveProgressBarVariant,
  resolveProgressPercentage,
  resolveSafeWidth,
} from './shared.js'

// ─── Progress bar helpers ─────────────────────────────────────────

function buildMetaHtml(
  config: ProgressBarConfig,
  formattedValue: string,
  formattedPercentage: string
): string {
  const showValue = config.showValue ?? true
  const showPercentage = config.showPercentage ?? true

  if (!showValue && !showPercentage) {
    return ''
  }

  const parts: string[] = []

  if (showValue) {
    parts.push(`<span>${escapeHtml(formattedValue)}</span>`)
  }

  if (showPercentage) {
    parts.push(`<span>${escapeHtml(formattedPercentage)}</span>`)
  }

  return `<div class="vf-progress-meta">${parts.join('')}</div>`
}

function buildHtml(
  id: string,
  config: ProgressBarConfig,
  percentage: number,
  formattedValue: string,
  formattedPercentage: string
): string {
  const safeTitle = escapeHtml(config.title)
  const safeSubtitle = config.subtitle ? escapeHtml(config.subtitle) : ''
  const variant = resolveProgressBarVariant(config.variant)
  const size = resolveProgressBarSize(config.size)

  const subtitleHtml = safeSubtitle
    ? `<p class="vf-progress-subtitle">${safeSubtitle}</p>`
    : ''

  const metaHtml = buildMetaHtml(config, formattedValue, formattedPercentage)

  return `
<div id="vf-${id}" class="vf-progress-card vf-progress-${variant} ${size.className}">
  <div class="vf-progress-header">
    <div>
      <p class="vf-progress-title">${safeTitle}</p>
      ${subtitleHtml}
    </div>
    ${metaHtml}
  </div>
  <div
    class="vf-progress-track"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="${percentage}"
    aria-label="${safeTitle}"
  >
    <div class="vf-progress-fill" style="width:${percentage}%"></div>
  </div>
</div>
  `.trim()
}

function buildCss(
  id: string,
  width: number,
  config: ProgressBarConfig
): string {
  const size = resolveProgressBarSize(config.size)

  return `
${buildBaseComponentCss(id, width, config.appearance)}
#vf-${id} .vf-progress-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
#vf-${id} .vf-progress-title {
  margin: 0;
  color: var(--vf-text, #111827);
  font-size: 0.95rem;
  line-height: 1.35;
  font-weight: 750;
}
#vf-${id} .vf-progress-subtitle {
  margin: 4px 0 0 0;
  color: var(--vf-text-muted, #6b7280);
  font-size: 0.825rem;
  line-height: 1.45;
}
#vf-${id} .vf-progress-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  color: var(--vf-text-muted, #6b7280);
  font-size: 0.82rem;
  line-height: 1.35;
  font-weight: 700;
}
#vf-${id} .vf-progress-track {
  width: 100%;
  height: ${size.height};
  overflow: hidden;
  background: color-mix(in srgb, var(--vf-border, #e5e7eb) 70%, transparent);
  border-radius: 999px;
}
#vf-${id} .vf-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--vf-primary, #6366f1);
  transition: width 0.35s ease;
}
#vf-${id}.vf-progress-success .vf-progress-fill {
  background: var(--vf-success, #22c55e);
}
#vf-${id}.vf-progress-warning .vf-progress-fill {
  background: var(--vf-warning, #f59e0b);
}
#vf-${id}.vf-progress-danger .vf-progress-fill {
  background: var(--vf-danger, #ef4444);
}
#vf-${id}.vf-progress-info .vf-progress-fill {
  background: var(--vf-info, #0ea5e9);
}
  `.trim()
}

// ─── Main generator ───────────────────────────────────────────────

/**
 * Generates a dashboard-style progress bar.
 * Useful for goal completion, project progress and KPI tracking.
 *
 * @param config - Progress bar configuration object
 * @returns VizFlowOutput ready to insert into the DOM
 */
export function progressBar(config: ProgressBarConfig): VizFlowOutput {
  assertFiniteComponentNumber(config.value, 'ProgressBar value')

  const max = config.max ?? 100

  assertFiniteComponentNumber(max, 'ProgressBar max')

  if (max <= 0) {
    throw new Error('[VizFlow] ProgressBar max must be greater than 0')
  }

  const id = generateId()
  const width = resolveSafeWidth(config.width, 420)
  const percentage = resolveProgressPercentage(config.value, max)

  const formattedValue = formatValueForDisplay(
    config.value,
    config.valueFormat
  )

  const formattedPercentage = formatValueForDisplay(
    percentage / 100,
    config.percentageFormat ?? {
      type: 'percent',
      maximumFractionDigits: 1,
    }
  )

  const html = buildHtml(
    id,
    config,
    percentage,
    formattedValue,
    formattedPercentage
  )
  const css = buildCss(id, width, config)

  return {
    html,
    css,
    render: () => `<style>${css}</style>\n${html}`,
  }
}