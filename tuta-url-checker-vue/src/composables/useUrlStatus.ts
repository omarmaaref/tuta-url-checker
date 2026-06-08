import { ref, watch, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { validateUrl } from '@/libs/validateUrl'
import { checkUrlExists } from '@/services/urlExistence'
import type { CheckState, CheckUrlExists } from '@/types'

const DEBOUNCE_MS = Number(import.meta.env.VITE_DEBOUNCE_MS) || 400

/**
 * Watches a URL input and manages its status.
 * Handles debouncing, validation, and stale-result.
 */
export function useUrlStatus(input: Ref<string>, check: CheckUrlExists = checkUrlExists) {
  const state = ref<CheckState>({ state: 'init' });
  //global latest order 
  let CallOrder = 0;
  //useDebounceFn: is a build in debounce function
  const runCheck = useDebounceFn(async (url: string, currentOrder: number) => {
    try {
      const result = await check(url)

      // If currentOrder is deprecated ignore.
      if (currentOrder !== CallOrder) return

      state.value = result.exists
        ? { state: 'exists', type: result.type, url }
        : { state: 'not-found', url }
    } catch (e) {
      console.log('error', e)
      if (currentOrder !== CallOrder) return
      state.value = { state: 'error', message: 'server error' }
    }
  }, DEBOUNCE_MS) 

  //watch is triggered whenever the watched state changes.
  watch(input, (raw) => {
    const currentOrder = ++CallOrder

    if (raw.trim() === '') {
      state.value = { state: 'init' }
      return
    }
    if (!validateUrl(raw)) {
      state.value = { state: 'invalid-format' }
      return
    }
    state.value = { state: 'checking' }
    runCheck(raw, currentOrder)
  })

  return { state }
}
