// ─── Shared CLI prompt utilities ──────────────────────────────────

import { input, select } from '@inquirer/prompts'

import type {
  BuiltInThemeName,
  ValueFormatOptions,
} from '@smolina-dev/vizflow-core'

import { parseFiniteNumber } from './number.js'

// ─── Choices ──────────────────────────────────────────────────────

export const themeChoices: { name: string; value: BuiltInThemeName }[] = [
  { name: 'Light — clean default', value: 'light' },
  { name: 'Dark — dark dashboard', value: 'dark' },
  { name: 'Hot — warm red/orange', value: 'hot' },
  { name: 'Cold — cool blue/cyan', value: 'cold' },
  { name: 'Corporate — professional blue/gray', value: 'corporate' },
  { name: 'Emerald — growth-focused green', value: 'emerald' },
  { name: 'Midnight — premium dark', value: 'midnight' },
  { name: 'Sunset — warm presentation style', value: 'sunset' },
]

// ─── Value format prompt ──────────────────────────────────────────

type CliFormatType = 'none' | 'number' | 'currency' | 'percent' | 'compact'

interface CollectValueFormatOptions {
  message?: string
  noneLabel?: string
}

function parseOptionalFiniteNumber(value: string): number | undefined {
  const parsed = parseFiniteNumber(value)
  return parsed === null ? undefined : parsed
}

export async function collectValueFormat({
  message = 'Value format?',
  noneLabel = 'None / default number',
}: CollectValueFormatOptions = {}): Promise<ValueFormatOptions | undefined> {
  const type = await select<CliFormatType>({
    message,
    choices: [
      { name: noneLabel, value: 'none' },
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