import type { DetectedPattern, LedgerTransaction } from "../../types/forensics";
import {
  average,
  dayOfWeek,
  daysBetween,
  isoWeekKey,
  median,
  normalizeMerchant,
} from "./normalize";

function byMerchant(rows: LedgerTransaction[]) {
  const groups = new Map<string, LedgerTransaction[]>();
  for (const row of rows) {
    const key = normalizeMerchant(row.merchant);
    const current = groups.get(key) ?? [];
    current.push(row);
    groups.set(key, current);
  }
  return groups;
}

export function detectRecurring(rows: LedgerTransaction[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  for (const group of byMerchant(rows).values()) {
    if (group.length < 3) continue;
    const dated = group
      .map((row) => ({ row, time: new Date(row.date).getTime() }))
      .filter((item) => !Number.isNaN(item.time))
      .sort((a, b) => a.time - b.time);
    if (dated.length < 3) continue;
    const gaps = dated
      .slice(1)
      .map((item, index) => (item.time - dated[index].time) / 86400000);
    const gapMedian = median(gaps);
    if (gapMedian == null || gapMedian < 6 || gapMedian > 40) continue;
    const similar = gaps.filter((gap) => Math.abs(gap - gapMedian) <= 8).length;
    if (similar < gaps.length - 1) continue;
    patterns.push({
      kind: "recurring",
      label: "Recurring expense",
      detail: `${group[0].merchant} repeats about every ${Math.round(gapMedian)} days.`,
      transactionIds: group.map((row) => row.id),
    });
  }
  return patterns;
}

export function detectDuplicates(rows: LedgerTransaction[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const groups = byMerchant(rows);
  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < sorted.length; i += 1) {
      for (let j = i + 1; j < sorted.length; j += 1) {
        const gap = daysBetween(sorted[i].date, sorted[j].date);
        if (gap == null || gap > 2) continue;
        if (sorted[i].amount !== sorted[j].amount) continue;
        patterns.push({
          kind: "possible_duplicate",
          label: "Possible duplicate",
          detail: `${sorted[i].merchant} charged ${sorted[i].amount} twice within ${Math.round(gap)} day${Math.round(gap) === 1 ? "" : "s"}.`,
          transactionIds: [sorted[i].id, sorted[j].id],
        });
      }
    }
  }
  return patterns;
}

export function detectSpikes(rows: LedgerTransaction[]): DetectedPattern[] {
  const weeks = new Map<string, LedgerTransaction[]>();
  for (const row of rows) {
    const key = isoWeekKey(row.date);
    if (!key) continue;
    const current = weeks.get(key) ?? [];
    current.push(row);
    weeks.set(key, current);
  }
  if (weeks.size < 3) return [];
  const totals = [...weeks.entries()].map(([key, group]) => ({
    key,
    group,
    amount: group.reduce((sum, row) => sum + row.amount, 0),
  }));
  const mean = average(totals.map((item) => item.amount));
  if (mean == null || mean === 0) return [];
  return totals
    .filter((item) => item.amount >= mean * 1.75 && item.group.length >= 2)
    .map((item) => ({
      kind: "spending_spike" as const,
      label: "Spending spike",
      detail: `One week totaled more than 1.75× the observed weekly average.`,
      transactionIds: item.group.map((row) => row.id),
    }));
}

export function detectPatterns(
  all: LedgerTransaction[],
  subset: LedgerTransaction[],
  categoryShare: number | null,
): DetectedPattern[] {
  if (subset.length === 0) return [];

  const patterns: DetectedPattern[] = [];
  const merchants = byMerchant(subset);
  const allAmounts = all.map((row) => row.amount);
  const mid = median(allAmounts);

  for (const group of merchants.values()) {
    if (group.length >= 2) {
      patterns.push({
        kind: "repeated_merchant",
        label: "Repeated merchant",
        detail: `${group[0].merchant} appears ${group.length} times in this insight.`,
        transactionIds: group.map((row) => row.id),
      });
    }
  }

  patterns.push(...detectRecurring(subset));

  const counts = [...byMerchant(all).values()].map((group) => group.length);
  const countMid = median(counts);
  if (countMid != null) {
    for (const group of merchants.values()) {
      if (group.length >= 3 && group.length >= countMid * 2) {
        patterns.push({
          kind: "unusual_frequency",
          label: "Unusual frequency",
          detail: `${group[0].merchant} appears more often than typical merchants in this ledger.`,
          transactionIds: group.map((row) => row.id),
        });
      }
    }
  }

  if (mid != null && subset.length >= 1) {
    const largest = subset.reduce((high, row) =>
      row.amount > high.amount ? row : high,
    );
    if (largest.amount >= mid * 2.5 && largest.amount >= 1000) {
      patterns.push({
        kind: "large_transaction",
        label: "Unusually large transaction",
        detail: `${largest.merchant} is well above the ledger median.`,
        transactionIds: [largest.id],
      });
    }
  }

  for (const spike of detectSpikes(all)) {
    const inWeek = subset.filter((row) => spike.transactionIds.includes(row.id));
    if (inWeek.length === 0) continue;
    const weekTotal = all
      .filter((row) => spike.transactionIds.includes(row.id))
      .reduce((sum, row) => sum + row.amount, 0);
    const subsetAmount = inWeek.reduce((sum, row) => sum + row.amount, 0);
    if (weekTotal > 0 && subsetAmount / weekTotal >= 0.4) {
      patterns.push({
        ...spike,
        transactionIds: inWeek.map((row) => row.id),
      });
    }
  }

  if (categoryShare != null && categoryShare >= 0.25 && subset.length >= 1) {
    patterns.push({
      kind: "category_concentration",
      label: "Category concentration",
      detail: `This category is ${Math.round(categoryShare * 100)}% of observed spending.`,
      transactionIds: subset.map((row) => row.id),
    });
  }

  for (const group of merchants.values()) {
    const sorted = [...group].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < sorted.length; i += 1) {
      const gap = daysBetween(sorted[i - 1].date, sorted[i].date);
      if (gap != null && gap <= 3) {
        patterns.push({
          kind: "short_interval",
          label: "Repeated purchases in a short interval",
          detail: `${sorted[i].merchant} appeared again within ${Math.round(gap)} day${Math.round(gap) === 1 ? "" : "s"}.`,
          transactionIds: [sorted[i - 1].id, sorted[i].id],
        });
      }
    }
  }

  patterns.push(...detectDuplicates(subset));

  if (subset.length >= 4) {
    const days = subset
      .map((row) => dayOfWeek(row.date))
      .filter((day): day is number => day != null);
    if (days.length >= 4) {
      const weekend = days.filter((day) => day === 0 || day === 6).length;
      const weekday = days.length - weekend;
      const end = days.filter((day) => day === 5 || day === 6 || day === 0).length;
      if (weekend / days.length >= 0.7) {
        patterns.push({
          kind: "weekend_concentration",
          label: "Weekend concentration",
          detail: `${Math.round((weekend / days.length) * 100)}% of these charges landed on Saturday or Sunday.`,
          transactionIds: subset.map((row) => row.id),
        });
      } else if (weekday / days.length >= 0.7) {
        patterns.push({
          kind: "weekday_concentration",
          label: "Weekday concentration",
          detail: `${Math.round((weekday / days.length) * 100)}% of these charges landed Monday–Friday.`,
          transactionIds: subset.map((row) => row.id),
        });
      }
      if (end / days.length >= 0.6) {
        patterns.push({
          kind: "end_of_week",
          label: "End-of-week concentration",
          detail: `${Math.round((end / days.length) * 100)}% of these charges landed Friday–Sunday.`,
          transactionIds: subset.map((row) => row.id),
        });
      }
    }
  }

  const seen = new Set<string>();
  return patterns.filter((pattern) => {
    const key = `${pattern.kind}:${pattern.transactionIds.join(",")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function calculateCategoryTotals(
  rows: LedgerTransaction[],
  classify: (row: LedgerTransaction) => string,
): { name: string; amount: number; share: number }[] {
  const totals = new Map<string, number>();
  let sum = 0;
  for (const row of rows) {
    if ((row.direction ?? "expense") !== "expense") continue;
    const name = classify(row);
    totals.set(name, (totals.get(name) ?? 0) + row.amount);
    sum += row.amount;
  }
  return [...totals.entries()]
    .map(([name, amount]) => ({
      name,
      amount,
      share: sum === 0 ? 0 : amount / sum,
    }))
    .sort((a, b) => b.amount - a.amount);
}
