import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, effectScope, nextTick } from 'vue'
import { useUrlCheck } from '@/composables/useUrlCheck'
import type { CheckUrlExists } from '@/types'

function setup(check: CheckUrlExists = vi.fn<CheckUrlExists>()) {
  const scope = effectScope()
  const url = ref('')
  const { state } = scope.run(() => useUrlCheck(url, check))!
  return { url, state, check, stop: () => scope.stop() }
}

const flush = async () => {
  await vi.runAllTimersAsync()
  await nextTick()
}

describe('useUrlCheck', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts in init for empty input', () => {
    const { state, check, stop } = setup()
    expect(state.value).toEqual({ state: 'init' })
    expect(check).not.toHaveBeenCalled()
    stop()
  })

  it('returns to init when input is cleared', async () => {
    const { url, state, check, stop } = setup()
    url.value = 'https://example.com'
    await nextTick()
    url.value = ''
    await nextTick()
    expect(state.value).toEqual({ state: 'init' })
    expect(check).not.toHaveBeenCalled()
    stop()
  })

  it('flags invalid-format without calling the service', async () => {
    const { url, state, check, stop } = setup()
    url.value = 'not a url'
    await nextTick()
    expect(state.value).toEqual({ state: 'invalid-format' })
    expect(check).not.toHaveBeenCalled()
    stop()
  })

  it('shows checking immediately for valid input', async () => {
    const { url, state, stop } = setup(vi.fn().mockResolvedValue({ exists: true, type: 'file' }))
    url.value = 'https://example.com'
    await nextTick()
    expect(state.value).toEqual({ state: 'checking' })
    stop()
  })

  it('resolves to exists after debounce + service call', async () => {
    const { url, state, check, stop } = setup(
      vi.fn().mockResolvedValue({ exists: true, type: 'file' }),
    )
    url.value = 'https://example.com/file.pdf'
    await nextTick()
    await flush()
    expect(check).toHaveBeenCalledWith('https://example.com/file.pdf')
    expect(state.value).toEqual({
      state: 'exists',
      type: 'file',
      url: 'https://example.com/file.pdf',
    })
    stop()
  })

  it('debounces rapid input changes into a single service call', async () => {
    const { url, check, stop } = setup(vi.fn().mockResolvedValue({ exists: true, type: 'file' }))
    url.value = 'https://a.com'
    await nextTick()
    await vi.advanceTimersByTimeAsync(200)
    url.value = 'https://b.com'
    await nextTick()
    await vi.advanceTimersByTimeAsync(200)
    url.value = 'https://c.com'
    await nextTick()
    await flush()
    expect(check).toHaveBeenCalledTimes(1)
    expect(check).toHaveBeenCalledWith('https://c.com')
    stop()
  })

  it('Keep order and abort outdated updates', async () => {
    const checkUrlExistsMock = vi.fn<CheckUrlExists>((url) => {
      const delay = url.includes('slow') ? 1000 : 100
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ exists: true, type: 'file' })
        }, delay)
      })
    })

    const { url, check, stop } = setup(checkUrlExistsMock)

    url.value = 'https://slow.com'
    await nextTick()
    await vi.advanceTimersByTimeAsync(410)
    url.value = 'https://fastNew.com'
    await nextTick()
    await flush()
    expect(check).toHaveBeenCalledTimes(2)
    expect(url.value).toEqual('https://fastNew.com')
    stop()
  })
})
