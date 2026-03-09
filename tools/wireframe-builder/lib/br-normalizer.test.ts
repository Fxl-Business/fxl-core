import { describe, it, expect } from 'vitest'
import { parseBRCurrency, parseBRDate } from './br-normalizer'

// ─── parseBRCurrency tests ───────────────────────────────────────────────

describe('parseBRCurrency', () => {
  it('parses standard BR currency: "1.234,56" -> 1234.56', () => {
    expect(parseBRCurrency('1.234,56')).toBe(1234.56)
  })

  it('parses with R$ prefix: "R$ 1.234,56" -> 1234.56', () => {
    expect(parseBRCurrency('R$ 1.234,56')).toBe(1234.56)
  })

  it('parses without thousands separator: "100,50" -> 100.50', () => {
    expect(parseBRCurrency('100,50')).toBe(100.50)
  })

  it('parses multi-million values: "1.234.567,89" -> 1234567.89', () => {
    expect(parseBRCurrency('1.234.567,89')).toBe(1234567.89)
  })

  it('throws on invalid input', () => {
    expect(() => parseBRCurrency('invalid')).toThrow()
  })
})

// ─── parseBRDate tests ───────────────────────────────────────────────────

describe('parseBRDate', () => {
  it('parses standard BR date: "25/03/2026" -> "2026-03-25"', () => {
    expect(parseBRDate('25/03/2026')).toBe('2026-03-25')
  })

  it('parses zero-padded date: "01/01/2025" -> "2025-01-01"', () => {
    expect(parseBRDate('01/01/2025')).toBe('2025-01-01')
  })

  it('throws on invalid input', () => {
    expect(() => parseBRDate('invalid')).toThrow()
  })
})
