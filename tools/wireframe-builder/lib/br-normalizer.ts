/**
 * BR Format Normalizer -- parses Brazilian currency and date strings
 * into normalized types for data processing.
 *
 * Used in the product spec to document column format rules, and by the
 * generated NestJS backend for CSV/XLSX upload parsing.
 */

/** Convert Brazilian currency string to number: "1.234,56" -> 1234.56 */
export function parseBRCurrency(value: string): number {
  const cleaned = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  if (isNaN(num)) throw new Error(`Invalid BR currency: "${value}"`)
  return num
}

/** Convert Brazilian date string to ISO date: "25/03/2026" -> "2026-03-25" */
export function parseBRDate(value: string): string {
  const parts = value.split('/')
  if (parts.length !== 3) throw new Error(`Invalid BR date: "${value}"`)
  const [day, month, year] = parts
  if (!day || !month || !year) throw new Error(`Invalid BR date: "${value}"`)
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}
