import type { ApiTransaction } from "../../types/api";
import type { LedgerTransaction } from "../../types/forensics";

const STOP = new Set([
  "the",
  "and",
  "for",
  "ltd",
  "limited",
  "inc",
  "llc",
  "app",
  "bd",
  "com",
]);

export function normalizeMerchant(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function merchantTokens(name: string): string[] {
  return normalizeMerchant(name)
    .split(" ")
    .filter((part) => part.length > 2 && !STOP.has(part));
}

export function withTransactionIds(
  rows: ApiTransaction[],
): LedgerTransaction[] {
  return rows.map((row, index) => ({
    id: row.id ?? `tx${index + 1}`,
    date: row.date,
    merchant: row.merchant,
    amount: row.amount,
    direction: row.direction ?? "expense",
  }));
}

export function parseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isoWeekKey(value: string): string | null {
  const date = parseDate(value);
  if (!date) return null;
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function dayOfWeek(value: string): number | null {
  const date = parseDate(value);
  if (!date) return null;
  return date.getDay();
}

export function daysBetween(a: string, b: string): number | null {
  const first = parseDate(a);
  const second = parseDate(b);
  if (!first || !second) return null;
  return Math.abs((first.getTime() - second.getTime()) / 86400000);
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function roundMoney(value: number): number {
  return Math.round(value);
}

const NON_DISCRETIONARY = [
  "grocery",
  "groceries",
  "shwapno",
  "rent",
  "utility",
  "utilities",
  "electric",
  "water",
  "gas",
  "insurance",
  "school",
  "tuition",
  "tax",
];

export function isDiscretionaryCategory(name: string): boolean {
  const normalized = normalizeMerchant(name);
  return !NON_DISCRETIONARY.some((token) => normalized.includes(token));
}

export function leakNameTokens(name: string): string[] {
  const noise = new Set([
    "membership",
    "delivery",
    "fees",
    "fee",
    "extra",
    "orders",
    "order",
    "unused",
    "review",
    "habit",
    "charges",
    "charge",
    "subscription",
    "monthly",
  ]);
  return merchantTokens(name).filter((token) => !noise.has(token));
}
