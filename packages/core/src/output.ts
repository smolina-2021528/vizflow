import { VizFlowOutput } from './types/index.js'

// ─── Standalone HTML output options ──────────────────────────────

export interface StandaloneOptions {
  /** Page title shown in the browser tab — defaults to 'VizFlow' */
  title?: string
  /** Visual theme — defaults to 'light' */
  theme?: 'light' | 'dark'
  /** Include Chart.js from CDN — defaults to true */
  includeChartJs?: boolean
}

// ─── Theme tokens ─────────────────────────────────────────────────

function buildThemeStyle(theme: 'light' | 'dark'): string {
  if (theme === 'dark') {
    return `:root{
  --vf-primary:#818cf8;
  --vf-on-primary:#1e1b4b;
  --vf-background:#1f2937;
  --vf-surface:#111827;
  --vf-text:#f9fafb;
  --vf-text-muted:#9ca3af;
  --vf-border:#374151;
  --vf-row-alt:#273244;
  --vf-row-hover:#312e81;
  --vf-radius:8px;
  --vf-font:system-ui,sans-serif;
}`
  }

  return `:root{
  --vf-primary:#6366f1;
  --vf-on-primary:#ffffff;
  --vf-background:#ffffff;
  --vf-surface:#f9fafb;
  --vf-text:#111827;
  --vf-text-muted:#6b7280;
  --vf-border:#e5e7eb;
  --vf-row-alt:#f5f5f5;
  --vf-row-hover:#ede9fe;
  --vf-radius:8px;
  --vf-font:system-ui,sans-serif;
}`
}

// ─── Main builder ─────────────────────────────────────────────────

/**
 * Wraps a VizFlowOutput into a complete standalone HTML document.
 * The result can be written directly to a .html file.
 *
 * @param output  - VizFlowOutput from any chart or table generator
 * @param options - Optional standalone document settings
 * @returns Complete HTML string ready to save as a file
 */
export function toHtmlFile(
  output: VizFlowOutput,
  options: StandaloneOptions = {}
): string {
  const title = options.title ?? 'VizFlow'
  const theme = options.theme ?? 'light'
  const includeChartJs = options.includeChartJs ?? true

  const chartJsScript = includeChartJs
    ? `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"><\/script>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>${buildThemeStyle(theme)}</style>
</head>
<body style="padding:32px;background:var(--vf-background);margin:0">
  ${chartJsScript}
  ${output.render()}
</body>
</html>`
}

// ─── Embeddable snippet options ───────────────────────────────────

export interface EmbedOptions {
  /** Include a comment with usage instructions — defaults to true */
  includeInstructions?: boolean
  /** Include Chart.js script tag — defaults to true */
  includeChartJs?: boolean
}

// ─── Embed snippet builder ────────────────────────────────────────

/**
 * Generates a minimal embeddable HTML snippet from a VizFlowOutput.
 * Paste this directly into any existing HTML page.
 *
 * @param output  - VizFlowOutput from any chart or table generator
 * @param options - Optional embed settings
 * @returns HTML snippet string ready to copy-paste into any page
 */
export function toEmbedSnippet(
  output: VizFlowOutput,
  options: EmbedOptions = {}
): string {
  const includeInstructions = options.includeInstructions ?? true
  const includeChartJs = options.includeChartJs ?? true

  const instructions = includeInstructions
    ? `<!-- VizFlow embed snippet
     1. Paste this block anywhere inside your <body>
     2. Make sure your page loads Chart.js if using charts
     3. Customize colors via CSS variables (--vf-primary, --vf-background, etc.)
-->\n`
    : ''

  const chartJsScript = includeChartJs
    ? `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"><\/script>\n`
    : ''

  return `${instructions}${chartJsScript}${output.render()}`
}
