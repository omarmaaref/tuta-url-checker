/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEBOUNCE_MS?: string
  readonly VITE_THROTTLE_MS?: string
  readonly VITE_THROTTLE_BURST?: string
  readonly VITE_RETRY_MAX?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
