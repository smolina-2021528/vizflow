// ─── VizFlow Studio local HTTP server ─────────────────────────────

import { createReadStream, existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { STUDIO_HOST } from './config.js'

export interface StudioServerOptions {
  port: number
  host?: string
}

export interface StudioServerHandle {
  server: Server
  url: string
  close: () => Promise<void>
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

function getCurrentDirname(): string {
  return fileURLToPath(new URL('.', import.meta.url))
}

function getPublicDir(): string {
  const currentDir = getCurrentDirname()

  const candidates = [
    resolve(currentDir, '../public'),
    resolve(currentDir, '../../public'),
    resolve(process.cwd(), 'packages/studio/public'),
    resolve(process.cwd(), 'public'),
  ]

  const found = candidates.find(candidate => existsSync(candidate))

  if (!found) {
    throw new Error('VizFlow Studio public directory was not found.')
  }

  return found
}

function getContentType(filePath: string): string {
  return MIME_TYPES[extname(filePath)] ?? 'application/octet-stream'
}

function sendText(
  response: ServerResponse,
  statusCode: number,
  body: string,
  contentType = 'text/plain; charset=utf-8'
): void {
  response.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  })

  response.end(body)
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: Record<string, unknown>
): void {
  sendText(response, statusCode, JSON.stringify(payload, null, 2), 'application/json; charset=utf-8')
}

function isPathInside(basePath: string, targetPath: string): boolean {
  const normalizedBase = normalize(basePath)
  const normalizedTarget = normalize(targetPath)

  return normalizedTarget === normalizedBase || normalizedTarget.startsWith(`${normalizedBase}/`)
}

async function serveStaticFile(
  publicDir: string,
  requestPath: string,
  response: ServerResponse
): Promise<void> {
  const safePath = requestPath === '/' ? '/index.html' : requestPath
  const decodedPath = decodeURIComponent(safePath.split('?')[0] ?? '/index.html')
  const filePath = resolve(publicDir, `.${decodedPath}`)

  if (!isPathInside(publicDir, filePath)) {
    sendText(response, 403, 'Forbidden')
    return
  }

  if (!existsSync(filePath)) {
    sendText(response, 404, 'Not found')
    return
  }

  response.writeHead(200, {
    'Content-Type': getContentType(filePath),
    'Cache-Control': 'no-store',
  })

  createReadStream(filePath).pipe(response)
}

async function handleRequest(
  publicDir: string,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const method = request.method ?? 'GET'
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)

  if (method !== 'GET') {
    sendJson(response, 405, {
      ok: false,
      error: 'Method not allowed',
    })
    return
  }

  if (url.pathname === '/api/health') {
    sendJson(response, 200, {
      ok: true,
      name: 'VizFlow Studio',
      status: 'running',
    })
    return
  }

  if (url.pathname === '/api/version') {
    const packageJsonPath = join(getCurrentDirname(), '../package.json')
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8')) as {
      name?: string
      version?: string
    }

    sendJson(response, 200, {
      ok: true,
      name: packageJson.name ?? '@smolina-dev/vizflow-studio',
      version: packageJson.version ?? 'unknown',
    })
    return
  }

  await serveStaticFile(publicDir, url.pathname, response)
}

export async function startStudioServer({
  port,
  host = STUDIO_HOST,
}: StudioServerOptions): Promise<StudioServerHandle> {
  const publicDir = getPublicDir()

  const server = createServer((request, response) => {
    handleRequest(publicDir, request, response).catch(error => {
      const message = error instanceof Error ? error.message : String(error)

      sendJson(response, 500, {
        ok: false,
        error: message,
      })
    })
  })

  await new Promise<void>((resolvePromise, rejectPromise) => {
    server.once('error', rejectPromise)

    server.listen(port, host, () => {
      server.off('error', rejectPromise)
      resolvePromise()
    })
  })

  const address = server.address()
  const resolvedPort =
    typeof address === 'object' && address !== null ? address.port : port
  const url = `http://${host}:${resolvedPort}`

  return {
    server,
    url,
    close: () =>
      new Promise<void>((resolvePromise, rejectPromise) => {
        server.close(error => {
          if (error) {
            rejectPromise(error)
            return
          }

          resolvePromise()
        })
      }),
  }
}