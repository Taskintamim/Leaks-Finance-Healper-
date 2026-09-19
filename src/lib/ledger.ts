import type { ApiTransaction } from "../types/api";
import { normalizeMerchant } from "./forensics/normalize";

export type Flow = "expense" | "income";

const INCOME_MARKERS = [
  "salary",
  "payroll",
  "wage",
  "income",
  "refund",
  "cashback",
  "deposit",
  "bonus",
  "reimbursement",
  "transfer from",
];

const CATEGORY_RULES: { name: string; tests: RegExp }[] = [
  { name: "Health", tests: /fitness|gym|hospital|pharmacy|doctor|clinic/i },
  { name: "Food delivery", tests: /foodpanda|pathao food|food ?delivery|restaurant|uber eats/i },
  { name: "Groceries", tests: /shwapno|grocery|grocer|meena|swapno|supermarket/i },
  { name: "Subscriptions", tests: /netflix|spotify|google one|apple|prime|youtube/i },
  { name: "Transport", tests: /uber|pathao|bus|train|cng|taxi/i },
  { name: "Mobile", tests: /recharge|gp |grameen|airtel|robi|banglalink/i },
  { name: "Fees", tests: /bkash|nagad|fee|cash out|charge|atm/i },
  { name: "Shopping", tests: /daraz|ajkerdeal|shopping|mall/i },
];

export function parseSignedAmount(raw: string): number | null {
  const trimmed = raw.trim();
  const paren = /^\((.+)\)$/.exec(trimmed);
  const body = paren ? paren[1] : trimmed;
  const cleaned = body.replace(/[৳$£€,\s]/g, "");
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value === 0) return null;
  return paren ? -Math.abs(value) : value;
}

export function inferExpenseSign(signed: number[]): 1 | -1 {
  const negatives = signed.filter((value) => value < 0).length;
  const positives = signed.filter((value) => value > 0).length;
  return negatives > positives ? -1 : 1;
}

export function classifyFlow(merchant: string, signedAmount: number, expenseSign: 1 | -1): Flow {
  const name = merchant.toLowerCase();
  if (INCOME_MARKERS.some((marker) => name.includes(marker))) return "income";
  return signedAmount * expenseSign > 0 ? "expense" : "income";
}

export function categorizeMerchant(merchant: string): string {
  const hit = CATEGORY_RULES.find((rule) => rule.tests.test(merchant));
  if (hit) {
    if (/pathao/i.test(merchant) && !/food/i.test(merchant)) return "Transport";
    return hit.name;
  }
  return "Other";
}

export function expensesOf(rows: ApiTransaction[]): ApiTransaction[] {
  return rows.filter((row) => (row.direction ?? "expense") === "expense");
}

export function incomeOf(rows: ApiTransaction[]): ApiTransaction[] {
  return rows.filter((row) => row.direction === "income");
}

export function sumAmount(rows: ApiTransaction[]): number {
  return Math.round(rows.reduce((sum, row) => sum + Math.abs(row.amount), 0));
}

export function periodLabelFrom(rows: ApiTransaction[]): string {
  const dates = rows
    .map((row) => new Date(row.date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  if (dates.length === 0) return "This period";
  const start = dates[0];
  const end = dates[dates.length - 1];
  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  const long = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
  if (sameMonth) return long.format(start);
  const short = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });
  return `${short.format(start)} – ${short.format(end)}`;
}

export function categoryTotals(rows: ApiTransaction[]) {
  const spend = expensesOf(rows);
  const total = sumAmount(spend);
  const buckets = new Map<string, number>();
  for (const row of spend) {
    const name = categorizeMerchant(row.merchant);
    buckets.set(name, (buckets.get(name) ?? 0) + Math.abs(row.amount));
  }
  return [...buckets.entries()]
    .map(([name, amount]) => ({
      name,
      amount: Math.round(amount),
      share: total === 0 ? 0 : amount / total,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function spendSeries(rows: ApiTransaction[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const buckets = new Map<string, { order: number; amount: number }>();
  for (const row of expensesOf(rows)) {
    const date = new Date(row.date);
    const valid = !Number.isNaN(date.getTime());
    const monthIndex = valid ? date.getMonth() : 0;
    const year = valid ? date.getFullYear() : 0;
    const label = valid ? `${months[monthIndex]} ${year}` : "Period";
    const order = valid ? year * 12 + monthIndex : 0;
    const current = buckets.get(label);
    if (current) current.amount += Math.abs(row.amount);
    else buckets.set(label, { order, amount: Math.abs(row.amount) });
  }
  return [...buckets.entries()]
    .sort((a, b) => a[1].order - b[1].order)
    .map(([month, data]) => ({ month, amount: Math.round(data.amount) }));
}

export function lastChargeOf(rows: ApiTransaction[]): string {
  const dated = rows
    .filter((row) => row.date && row.date !== "unknown")
    .sort((a, b) => a.date.localeCompare(b.date));
  return dated[dated.length - 1]?.date ?? "";
}

export function cadenceFrom(count: number): string {
  if (count <= 0) return "No supporting rows";
  if (count === 1) return "Seen this period";
  return `${count} charges this period`;
}

export function sameMerchant(a: string, b: string) {
  return normalizeMerchant(a) === normalizeMerchant(b);
}
