import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateId } from '../src/charts/shared.js'

describe('generateId', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses crypto.randomUUID when available', () => {
    vi.stubGlobal('crypto', {
      randomUUID: () => '12345678-aaaa-bbbb-cccc-123456789abc',
    })

    expect(generateId()).toBe('12345678')
  })

  it('uses crypto.getRandomValues when randomUUID is not available', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (bytes: Uint8Array) => {
        bytes.set([1, 2, 15, 255])
        return bytes
      },
    })

    expect(generateId()).toBe('01020fff')
  })

  it('uses fallback id when crypto is not available', () => {
    vi.stubGlobal('crypto', undefined)

    const id = generateId()

    expect(id).toHaveLength(8)
    expect(id).toMatch(/^[a-z0-9]+$/)
  })

  it('uses fallback id when crypto throws', () => {
    vi.stubGlobal('crypto', {
      randomUUID: () => {
        throw new Error('crypto unavailable')
      },
    })

    const id = generateId()

    expect(id).toHaveLength(8)
    expect(id).toMatch(/^[a-z0-9]+$/)
  })
})