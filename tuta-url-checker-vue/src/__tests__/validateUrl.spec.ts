import { describe, it, expect } from 'vitest'
import { validateUrl } from '@/libs/validateUrl'

describe('validateUrl', () => {
  const cases: Array<[string, boolean]> = [
    ['', false],
    ['   ', false],
    ['not a url', false],
    ['http://', false],
    ['https://', false],
    ['abc://example.com', false],
    ['example.com', false],
    ['http://example.com', true],
    ['https://example.com', true],
    ['  https://example.com  ', true],
    ['https://example.com/path/to/file.txt', true],
    ['https://example.com/folder/', true],
  ]

  it.each(cases)('validateUrl(%j) → %s', (input, expected) => {
    expect(validateUrl(input)).toBe(expected)
  })
})
