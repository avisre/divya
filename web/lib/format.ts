export const DEFAULT_DISPLAY_CURRENCY = "GBP";

function currencyLocale(currency: string) {
  if (currency === "GBP") return "en-GB";
  if (currency === "USD") return "en-US";
  return "en";
}

export function formatPrice(amount?: number | null, currency = DEFAULT_DISPLAY_CURRENCY) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "Price on request";
  return new Intl.NumberFormat(currencyLocale(currency), {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options
  }).format(new Date(value));
}

export function formatRelativeDays(days?: number | null) {
  if (typeof days !== "number") return "Date to be announced";
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function formatPujaAvailability(estimatedWaitWeeks?: number | null) {
  if (typeof estimatedWaitWeeks === "number" && estimatedWaitWeeks > 0) {
    return `Typically within ${estimatedWaitWeeks * 7} days`;
  }

  return "Next available: within 7 days - confirm at booking";
}

export function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
