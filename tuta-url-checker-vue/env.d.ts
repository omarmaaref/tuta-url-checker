/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEBOUNCE_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
