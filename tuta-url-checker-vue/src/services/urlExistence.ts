import { withRetry } from '@/libs/retry'
import { withThrottle } from '@/libs/throttle'
import { withTimeout } from '@/libs/timeout'
import { basicCheckUrlExists } from './urlExistenceMock'

// Retry inside the throttle: one logical call = one throttle slot.
export const checkUrlExists = withTimeout(withThrottle(withRetry(basicCheckUrlExists)))
