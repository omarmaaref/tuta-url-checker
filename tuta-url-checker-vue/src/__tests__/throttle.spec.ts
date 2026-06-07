import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const BURST = Number(import.meta.env.VITE_THROTTLE_BURST) || 5
const REFILL_MS = Number(import.meta.env.VITE_THROTTLE_MS) || 300
const WINDOW_MS = BURST * REFILL_MS

type VoidImpl = () => Promise<string>

// Module reset
async function freshWithThrottle() {
  vi.resetModules()
  const mod = await import('@/libs/throttle')
  return mod.withThrottle
}

describe('withThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('passes the first call through immediately', async () => {
    const withThrottle = await freshWithThrottle()
    const impl = vi.fn<VoidImpl>(() => Promise.resolve('ok'))
    const wrapped = withThrottle(impl)

    const promise = wrapped()
    await vi.advanceTimersByTimeAsync(0)

    expect(impl).toHaveBeenCalledTimes(1)
    await expect(promise).resolves.toBe('ok')
  })

  it('allows a burst of BURST calls without delay', async () => {
    const withThrottle = await freshWithThrottle()
    const impl = vi.fn<VoidImpl>(() => Promise.resolve('ok'))
    const wrapped = withThrottle(impl)

    const promises = Array.from({ length: BURST }, () => wrapped())
    await vi.advanceTimersByTimeAsync(0)

    expect(impl).toHaveBeenCalledTimes(BURST)
    await Promise.all(promises)
  })

  it('delays calls beyond the burst until the window refreshes', async () => {
    const withThrottle = await freshWithThrottle()
    const impl = vi.fn<VoidImpl>(() => Promise.resolve('ok'))
    const wrapped = withThrottle(impl)

    const promises = Array.from({ length: BURST + 1 }, () => wrapped())
    await vi.advanceTimersByTimeAsync(0)
    expect(impl).toHaveBeenCalledTimes(BURST)

    await vi.advanceTimersByTimeAsync(WINDOW_MS)
    expect(impl).toHaveBeenCalledTimes(BURST + 1)

    await Promise.all(promises)
  })
})
