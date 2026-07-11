/**
 * Formatting helpers. The dashboard is Turkish-first, so numbers and
 * currencies use tr-TR conventions (1.234,56) by default.
 */

const eur = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const eurPrecise = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const tl = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const usd = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const decimal = new Intl.NumberFormat("tr-TR");

export function formatEUR(value: number, precise = false) {
  return (precise ? eurPrecise : eur).format(value);
}

export function formatTL(value: number) {
  return tl.format(value);
}

export function formatUSD(value: number) {
  return usd.format(value);
}

export function formatNumber(value: number) {
  return decimal.format(value);
}

/** Compact token counts: 12.400 -> "12,4B" (bin) / 1.200.000 -> "1,2M". */
export function formatTokens(value: number) {
  if (value >= 1_000_000)
    return `${decimal.format(Math.round((value / 1_000_000) * 10) / 10)}M`;
  if (value >= 1_000)
    return `${decimal.format(Math.round((value / 1_000) * 10) / 10)}B`;
  return decimal.format(value);
}

/** Minutes -> human readable duration, e.g. 150 -> "2s 30dk". */
export function formatDuration(minutes: number) {
  if (minutes <= 0) return "0dk";
  const days = Math.floor(minutes / (60 * 8)); // 8h work day
  const hours = Math.floor((minutes % (60 * 8)) / 60);
  const mins = Math.round(minutes % 60);
  const parts: string[] = [];
  if (days) parts.push(`${days}g`);
  if (hours) parts.push(`${hours}s`);
  if (mins && !days) parts.push(`${mins}dk`);
  return parts.join(" ") || "0dk";
}

export function formatPercent(value: number) {
  return `%${decimal.format(Math.round(value))}`;
}
