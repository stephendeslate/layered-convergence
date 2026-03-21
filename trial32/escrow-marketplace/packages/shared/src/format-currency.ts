/**
 * Formats a numeric amount as a currency string.
 * Used by frontend pages to display monetary values.
 *
 * @param amount - The numeric amount to format
 * @param currency - The ISO 4217 currency code (defaults to 'USD')
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
