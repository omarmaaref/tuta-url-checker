
const URL_REGEX = /^https?:\/\/\S+\.\S+/

/** Minimal http(s) URL format check. Trims input; returns true if it looks like a URL. */
export function validateUrl(input: string): boolean {
    console.log('validateUrl_Regex',URL_REGEX.test(input.trim()))
    return URL_REGEX.test(input.trim())
  }
