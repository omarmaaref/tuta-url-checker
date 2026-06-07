/**
 * UI state machine for the URL checker.
 */
export type CheckState =
        | { state: 'init' }
        | { state: 'invalid-format' }
        | { state: 'checking' }
        | { state: 'exists'; type: 'file' | 'folder'; url: string }
        | { state: 'not-found';  url: string }
        | { state: 'error'; message: string; }

/**
 * Contract returned by the existence service.
 */
export type UrlCheckResult =
        | { exists: false }
        | { exists: true, type: 'file' | 'folder' }

