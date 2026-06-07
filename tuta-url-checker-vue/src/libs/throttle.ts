import pThrottle from 'p-throttle'

const REFILL_MS = Number(import.meta.env.VITE_THROTTLE_MS) || 300
const BURST = Number(import.meta.env.VITE_THROTTLE_BURST) || 5

// At most BURST calls per (BURST * REFILL_MS) window ≈ average 1 per REFILL_MS.
// pthrottle is also a secure dependecy
const throttle = pThrottle({ limit: BURST, interval: BURST * REFILL_MS })

// Wrap an async function so it shares the module-level throttle window.
export function withThrottle<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return throttle(async (...args: TArgs) => {
    console.info('[throttle] call released')
    return fn(...args)
  })
}
