import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { withRetry } from '@/libs/retry'
import { HttpError } from '@/libs/errors'

type Impl = (arg: string) => Promise<string>

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('passes through when impl succeeds first try', async () => {
    const impl = vi.fn<Impl>(() => Promise.resolve('ok'))
    const wrapped = withRetry(impl)

    await expect(wrapped('x')).resolves.toBe('ok')
    expect(impl).toHaveBeenCalledTimes(1)
  })

  it('retries on HttpError(429) and resolves on subsequent success', async () => {
    const impl = vi.fn<Impl>()
    impl.mockRejectedValueOnce(new HttpError(429))
    impl.mockResolvedValueOnce('ok')
    const wrapped = withRetry(impl)

    const promise = wrapped('x')
    await vi.runAllTimersAsync()

    await expect(promise).resolves.toBe('ok')
    expect(impl).toHaveBeenCalledTimes(2)
  })

  it('does not retry on HttpError with status other than 429', async () => {
    const impl = vi.fn<Impl>()
    impl.mockRejectedValue(new HttpError(500))
    const wrapped = withRetry(impl)

    const promise = wrapped('x')
    promise.catch(() => {})
    await vi.runAllTimersAsync()

    await expect(promise).rejects.toBeInstanceOf(HttpError)
    expect(impl).toHaveBeenCalledTimes(1)
  })
})
