const DATE_LOCALE = 'en-GB';
const TZ = 'Europe/London';

export function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: '2-digit',
    month: 'short',
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatDateFull(iso: string): string {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatDateRange(startIso: string, endIso: string): string {
  return `${formatDateFull(startIso)} – ${formatDateFull(endIso)}`;
}

const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

export function formatPrice(from: number | null | undefined, to?: number | null): string {
  if (from == null) return 'Free';
  if (to != null && to > from) return `${gbpFormatter.format(from)}–${gbpFormatter.format(to)}`;
  return `From ${gbpFormatter.format(from)}`;
}

export function formatPriceCompact(
  from: number | null | undefined,
  to?: number | null,
): string {
  if (from == null) return 'Free';
  if (to != null && to > from) return `${gbpFormatter.format(from)}–${gbpFormatter.format(to)}`;
  return gbpFormatter.format(from);
}

export function getInitials(name: string): string {
  const words = name
    .replace(/[^a-zA-Z\s&]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) {
    const w = words[0] ?? '';
    return w.slice(0, 2).toUpperCase();
  }
  const first = words[0] ?? '';
  const second = words[1] ?? '';
  return (first.charAt(0) + second.charAt(0)).toUpperCase();
}
