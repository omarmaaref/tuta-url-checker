import { HttpError } from '@/libs/errors'
import type { UrlCheckResult } from '@/types'

const MIN_LATENCY_MS = 200

/**
 * Mock backend. Pretends to check whether a URL exists.
 * Specific substrings in the URL trigger outcomes for manual/dev testing:
 *  - "404"          → not found
 *  - "429"          → throws HttpError(429) so the retry layer kicks in
 *  - "BackendError" → throws a generic Error (non-retryable)
 */
export async function basicCheckUrlExists(url: string): Promise<UrlCheckResult> {
  const latency = MIN_LATENCY_MS + Math.random() * 500
  // Image we are calling a real backend here.
  await new Promise((r) => setTimeout(r, latency))

  if (url.includes('404')) return { exists: false }
  if (url.includes('429')) throw new HttpError(429, 'rate limited')
  if (url.includes('BackendError')) throw new Error('server error')

  return { exists: true, type: url.endsWith('/') ? 'folder' : 'file' }
}
