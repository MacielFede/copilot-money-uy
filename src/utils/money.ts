// Money formatting utilities
// All amounts in the app are in cents (integers)

/**
 * Format cents as a currency string with no +/- sign (absolute value only).
 */
export function formatAbsoluteMoney(
  cents: number,
  showCents: boolean = true
): string {
  const dollars = Math.abs(cents) / 100;
  const formatted = dollars.toLocaleString("en-US", {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });
  return `$${formatted}`;
}

/** Same as `formatAbsoluteMoney` (no +/- prefix). */
export function formatMoney(
  cents: number,
  showCents: boolean = true
): string {
  return formatAbsoluteMoney(cents, showCents);
}

/** Same as `formatMoney` (no +/- prefix). */
export function formatSignedMoney(cents: number): string {
  return formatAbsoluteMoney(cents);
}

/**
 * Format cents without currency symbol (absolute value, no sign).
 */
export function formatAmount(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  return dollars.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Format percentage
 * @param value Percentage value (0-100 or 0-1)
 * @param decimals Number of decimal places
 * @returns Formatted string like "25.5%"
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K/M suffixes
 * @param cents Amount in cents
 * @returns Formatted string like "$1.2K" or "$2.5M"
 */
export function formatCompactMoney(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  
  if (dollars >= 1000000) {
    return `$${(dollars / 1000000).toFixed(1)}M`;
  }
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  }
  return `$${dollars.toFixed(0)}`;
}

/**
 * Parse a money string to cents
 * @param value String like "$1,234.56" or "1234.56"
 * @returns Amount in cents
 */
export function parseMoney(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}