export function formatCurrency(value: number): string {
  return `${Math.round(value).toLocaleString('vi-VN')} ₫`;
}

export function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace('.', ',')}tr`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return `${Math.round(value)}`;
}

export function formatDateLabel(dateString: string, locale = 'vi-VN'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
  });
}
