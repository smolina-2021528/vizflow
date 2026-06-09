// ─── Shared structured data loading utilities ─────────────────────

import { confirm, input } from '@inquirer/prompts'
import { readFileSync } from 'fs'
import { resolve } from 'path'

import {
  CsvParseError,
  JsonParseError,
  parseCsv,
  parseJson,
} from '@smolina-dev/vizflow-core'
import type { DataRow } from '@smolina-dev/vizflow-core'

type StructuredDataKind = 'csv' | 'json'

interface CollectStructuredDataRowsOptions {
  kind: StructuredDataKind
  defaultPath?: string
  promptMessage?: string
}

// ─── Helpers ──────────────────────────────────────────────────────

function getKindLabel(kind: StructuredDataKind): string {
  return kind.toUpperCase()
}

function parseRows(kind: StructuredDataKind, raw: string): DataRow[] {
  return kind === 'csv' ? parseCsv(raw) : parseJson(raw)
}

function isStructuredDataParseError(error: unknown): boolean {
  if (error instanceof CsvParseError || error instanceof JsonParseError) {
    return true
  }

  if (!(error instanceof Error)) {
    return false
  }

  return error.name === 'CsvParseError' || error.name === 'JsonParseError'
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

// ─── Public API ───────────────────────────────────────────────────

export async function collectStructuredDataRows({
  kind,
  defaultPath = kind === 'csv' ? './data.csv' : './data.json',
  promptMessage = `Path to ${getKindLabel(kind)} file:`,
}: CollectStructuredDataRowsOptions): Promise<DataRow[] | undefined> {
  while (true) {
    const filePath = await input({
      message: promptMessage,
      default: defaultPath,
    })

    const absolutePath = resolve(process.cwd(), filePath)

    try {
      const raw = readFileSync(absolutePath, 'utf-8')
      const rows = parseRows(kind, raw)

      console.log(`\n✅ Loaded ${rows.length} rows from ${absolutePath}\n`)

      return rows
    } catch (error) {
      const label = getKindLabel(kind)
      const message = getErrorMessage(error)

      if (isStructuredDataParseError(error)) {
        console.error(`\n❌ Invalid ${label} data: ${message}\n`)
      } else {
        console.error(`\n❌ Could not read ${label} file: ${absolutePath}`)
        console.error(`   ${message}\n`)
      }

      const retry = await confirm({
        message: `Do you want to try another ${label} file?`,
        default: true,
      })

      if (!retry) {
        return undefined
      }
    }
  }
}