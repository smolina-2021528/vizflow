// ─── /components wizard ──────────────────────────────────────────

import { confirm, input, select } from '@inquirer/prompts'

import { metricCard, progressBar, toHtmlFile } from '@smolina-dev/vizflow-core'
import type {
  MetricTrendDirection,
  ProgressBarSize,
  ProgressBarVariant,
  ValueFormatOptions,
} from '@smolina-dev/vizflow-core'
import type { BuiltInThemeName } from '@smolina-dev/vizflow-core'

import {
  parseFiniteNumber,
  parseFiniteNumberOrDefault,
} from '../utils/number.js'
import { writeOutputFile } from '../utils/output.js'
import { collectValueFormat, themeChoices } from '../utils/shared.js'

type ComponentType = 'metricCard' | 'progressBar'

// ─── Helpers ──────────────────────────────────────────────────────

function optionalText(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function parseRequiredNumber(raw: string, fallback: number): number {
  return parseFiniteNumber(raw) ?? fallback
}

function parseOptionalFiniteNumber(value: string): number | undefined {
  const parsed = parseFiniteNumber(value)
  return parsed === null ? undefined : parsed
}

async function collectThemeAndFilename(defaultFilename: string): Promise<{
  theme: BuiltInThemeName
  filename: string
}> {
  const theme = await select<BuiltInThemeName>({
    message: 'Theme?',
    choices: themeChoices,
  })

  const filename = await input({
    message: 'Output filename?',
    default: defaultFilename,
  })

  return { theme, filename }
}

// ─── Metric card wizard ───────────────────────────────────────────

async function runMetricCardWizard(): Promise<void> {
  console.log('\n📌 Metric Card Wizard\n')

  const title = await input({
    message: 'Metric title?',
    default: 'Total Sales',
  })

  const subtitleRaw = await input({
    message: 'Subtitle? (leave blank to skip)',
    default: '',
  })

  const valueRaw = await input({
    message: 'Metric value?',
    default: '125000',
  })

  const value = parseRequiredNumber(valueRaw, 125000)

  const valueFormat = await collectValueFormat({
    message: 'Metric value format?',
  })

  const addTrend = await confirm({
    message: 'Add trend indicator?',
    default: true,
  })

  let trend:
    | {
        value: number
        direction?: MetricTrendDirection
        label?: string
        format?: ValueFormatOptions
      }
    | undefined

  if (addTrend) {
    const trendValueRaw = await input({
      message: 'Trend value?',
      default: '12.5',
    })

    const trendDirection = await select<MetricTrendDirection>({
      message: 'Trend direction?',
      choices: [
        { name: 'Infer from value', value: 'neutral' },
        { name: 'Up', value: 'up' },
        { name: 'Down', value: 'down' },
        { name: 'Neutral', value: 'neutral' },
      ],
      default: 'neutral',
    })

    const trendLabelRaw = await input({
      message: 'Trend label?',
      default: 'vs previous period',
    })

    trend = {
      value: parseFiniteNumberOrDefault(trendValueRaw, 0),
      direction: trendDirection,
      label: optionalText(trendLabelRaw),
      format: {
        type: 'number',
        maximumFractionDigits: 1,
        suffix: '%',
      },
    }
  }

  const footerRaw = await input({
    message: 'Footer? (leave blank to skip)',
    default: '',
  })

  const widthRaw = await input({
    message: 'Card width?',
    default: '320',
  })

  const { theme, filename } = await collectThemeAndFilename('metric-card.html')

  const output = metricCard({
    title,
    subtitle: optionalText(subtitleRaw),
    value,
    valueFormat,
    trend,
    footer: optionalText(footerRaw),
    width: parseOptionalFiniteNumber(widthRaw),
  })

  const html = toHtmlFile(output, {
    title: 'VizFlow Metric Card',
    theme,
    includeChartJs: false,
  })

  await writeOutputFile(filename, html, 'Metric card')
}

// ─── Progress bar wizard ──────────────────────────────────────────

async function runProgressBarWizard(): Promise<void> {
  console.log('\n📈 Progress Bar Wizard\n')

  const title = await input({
    message: 'Progress title?',
    default: 'Goal completion',
  })

  const subtitleRaw = await input({
    message: 'Subtitle? (leave blank to skip)',
    default: '',
  })

  const valueRaw = await input({
    message: 'Current value?',
    default: '75',
  })

  const maxRaw = await input({
    message: 'Max value?',
    default: '100',
  })

  const valueFormat = await collectValueFormat({
    message: 'Progress value format?',
  })

  const variant = await select<ProgressBarVariant>({
    message: 'Progress variant?',
    choices: [
      { name: 'Default', value: 'default' },
      { name: 'Success', value: 'success' },
      { name: 'Warning', value: 'warning' },
      { name: 'Danger', value: 'danger' },
      { name: 'Info', value: 'info' },
    ],
    default: 'default',
  })

  const size = await select<ProgressBarSize>({
    message: 'Progress size?',
    choices: [
      { name: 'Small', value: 'sm' },
      { name: 'Medium', value: 'md' },
      { name: 'Large', value: 'lg' },
    ],
    default: 'md',
  })

  const showValue = await confirm({
    message: 'Show raw value?',
    default: true,
  })

  const showPercentage = await confirm({
    message: 'Show percentage?',
    default: true,
  })

  const widthRaw = await input({
    message: 'Card width?',
    default: '420',
  })

  const { theme, filename } = await collectThemeAndFilename('progress-bar.html')

  const output = progressBar({
    title,
    subtitle: optionalText(subtitleRaw),
    value: parseRequiredNumber(valueRaw, 75),
    max: parseRequiredNumber(maxRaw, 100),
    valueFormat,
    variant,
    size,
    showValue,
    showPercentage,
    width: parseOptionalFiniteNumber(widthRaw),
  })

  const html = toHtmlFile(output, {
    title: 'VizFlow Progress Bar',
    theme,
    includeChartJs: false,
  })

  await writeOutputFile(filename, html, 'Progress bar')
}

// ─── Wizard entry point ───────────────────────────────────────────

export async function run(): Promise<void> {
  console.log('\n🧩 Components Wizard\n')

  const componentType = await select<ComponentType>({
    message: 'Component type?',
    choices: [
      { name: 'Metric Card — KPI value card', value: 'metricCard' },
      { name: 'Progress Bar — goal completion card', value: 'progressBar' },
    ],
  })

  if (componentType === 'metricCard') {
    await runMetricCardWizard()
    return
  }

  await runProgressBarWizard()
}