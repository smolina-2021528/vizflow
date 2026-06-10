// ─── Studio runtime configuration ────────────────────────────────

export const DEFAULT_STUDIO_PORT = 4242
export const STUDIO_HOST = '127.0.0.1'

export interface StudioCliOptions {
  port: number
}

function parsePort(value: string | undefined): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    return undefined
  }

  return parsed
}

function readPortFromArgs(args: string[]): number | undefined {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === '--port' || arg === '-p') {
      return parsePort(args[index + 1])
    }

    if (arg.startsWith('--port=')) {
      return parsePort(arg.slice('--port='.length))
    }
  }

  return undefined
}

export function getStudioCliOptions(args: string[] = process.argv.slice(2)): StudioCliOptions {
  return {
    port:
      readPortFromArgs(args) ??
      parsePort(process.env.VIZFLOW_STUDIO_PORT) ??
      DEFAULT_STUDIO_PORT,
  }
}