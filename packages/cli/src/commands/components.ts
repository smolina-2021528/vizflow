// ─── /components wizard ──────────────────────────────────────────

import { confirm, input, select } from '@inquirer/prompts'

import {
  metricCard,
  progressBar,
  toHtmlFile,
} from '@smolina-dev/vizflow-core'
import type {
  MetricTrendDirection,
  ProgressBarSize,
  ProgressBarVariant,
  ValueFormatOptions,
} from '@smolina-dev/vizflow-core'
import type { BuiltInThemeName } from '@smolina-dev/vizflow-core'

import { parseFiniteNumber, parseFiniteNumberOrDefault } from '../utils/number.js'
import { writeOutputFile } from '../utils/output.js'

// ─── Choices ──────────────────────────────────────────────────────

const themeChoices: { name: string; value: BuiltInThemeName }[] = [
  { name: 'Light — clean default', value: 'light' },
  { name: 'Dark — dark dashboard', value: 'dark' },
  { name: 'Hot — warm red/orange', value: 'hot' },
  { name: 'Cold — cool blue/cyan', value: 'cold' },
  { name: 'Corporate — professional blue/gray', value: 'corporate' },
  { name: 'Emerald — growth-focused green', value: 'emerald' },
  { name: 'Midnight — premium dark', value: 'midnight' },
  { name: 'Sunset — warm presentation style', value: 'sunset' },
]

type ComponentType = 'metricCard' | 'progressBar'
type CliFormatType = 'none' | 'number' | 'currency' | 'percent' | 'compact'

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

async function collectValueFormat(
  message: string
): Promise<ValueFormatOptions | undefined> {
  const type = await select<CliFormatType>({
    message,
    choices: [
      { name: 'None / default number', value: 'none' },
      { name: 'Number', value: 'number' },
      { name: 'Currency', value: 'currency' },
      { name: 'Percent', value: 'percent' },
      { name: 'Compact number', value: 'compact' },
    ],
  })

  if (type === 'none') {
    return undefined
  }

  const locale = await input({
    message: 'Locale?',
    default: 'en-US',
  })

  const maximumFractionDigitsRaw = await input({
    message: 'Maximum fraction digits?',
    default: type === 'currency' ? '0' : '1',
  })

  const maximumFractionDigits = parseOptionalFiniteNumber(
    maximumFractionDigitsRaw
  )

  if (type === 'currency') {
    const currency = await input({
      message: 'Currency code?',
      default: 'USD',
    })

    return {
      type,
      locale,
      currency,
      maximumFractionDigits,
    }
  }

  return {
    type,
    locale,
    maximumFractionDigits,
  }
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

  const valueFormat = await collectValueFormat('Metric value format?')

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

  const valueFormat = await collectValueFormat('Progress value format?')

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