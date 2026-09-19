const number = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function money(value: number) {
  const abs = Math.round(Math.abs(value));
  const formatted = number.format(abs);
  return value < 0 ? `−৳${formatted}` : `৳${formatted}`;
}

export function moneyExact(value: number) {
  return money(value);
}

export function compact(value: number) {
  if (Math.abs(value) >= 100000) {
    return `৳${(value / 100000).toFixed(1)}L`;
  }
  if (Math.abs(value) >= 1000) {
    return `৳${(value / 1000).toFixed(1)}k`;
  }
  return money(value);
}
