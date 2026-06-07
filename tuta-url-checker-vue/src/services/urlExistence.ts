import type { UrlCheckResult } from '@/types'
const MIN_LATENCY_MS = 200

/**
 * Mock backend. Pretends to check whether a URL exists
 */
export async function checkUrlExists(url: string): Promise<UrlCheckResult> {
  const latency = MIN_LATENCY_MS + Math.random() * 500
  await new Promise((r) => setTimeout(r, latency))

  if (url.includes('404')) return { exists: false }
  if (url.includes('BackendError')) throw new Error('server error')

  return { exists: true, type: url.endsWith('/') ? 'folder' : 'file' }
}
