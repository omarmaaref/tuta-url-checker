import { ref, watch, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { validateUrl } from '@/libs/validateUrl'
import { checkUrlExists } from '@/services/urlExistence'
import type { CheckState, CheckUrlExists } from '@/types'

const DEBOUNCE_MS = Number(import.meta.env.VITE_DEBOUNCE_MS) || 400

/**
 * Watches a URL input, orchestrates checking and exsistence check logic.
 */
export function useUrlCheck(input: Ref<string>, check: CheckUrlExists = checkUrlExists) {
  const state = ref<CheckState>({ state: 'init' })

  //useDebounceFn: is a build in debounce function
  const runCheck = useDebounceFn(async (url: string) => {
    try {
      const result = await check(url)
      state.value = result.exists
        ? { state: 'exists', type: result.type, url }
        : { state: 'not-found', url }
    } catch (e) {
      console.log('error', e)
      state.value = { state: 'error', message: 'server error' }
    }
  }, DEBOUNCE_MS)

  //watch is triggered whenever the watched state changes.
  watch(input, (raw) => {
    if (raw.trim() === '') {
      state.value = { state: 'init' }
      return
    }
    if (!validateUrl(raw)) {
      state.value = { state: 'invalid-format' }
      return
    }
    state.value = { state: 'checking' }
    runCheck(raw)
  })

  return { state }
}
