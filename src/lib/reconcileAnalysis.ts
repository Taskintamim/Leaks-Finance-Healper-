import type {
  ActionItem,
  AnalysisResponse,
  HealthLabel,
  Leak,
  LeakSeverity,
  RecurringItem,
} from "../types/analysis";
import type { ApiAnalyzeResponse, ApiTransaction } from "../types/api";
import { matchLeakTransactions } from "./forensics/match";
import { detectRecurring } from "./forensics/detect";
import { withTransactionIds } from "./forensics/normalize";
import {
  cadenceFrom,
  categorizeMerchant,
  categoryTotals,
  expensesOf,
  incomeOf,
  lastChargeOf,
  periodLabelFrom,
  spendSeries,
  sumAmount,
} from "./ledger";

export type LeakSeed = {
  id: string;
  name: string;
  category: string;
  severity: LeakSeverity;
  reason: string;
  recommendation: string;
};

export type Interpretation = {
  headline: string;
  summary: string;
  leaks: LeakSeed[];
  actionPlan?: Pick<ActionItem, "id" | "leakId" | "title" | "detail" | "effort" | "priority">[];
  unaskedQuestion: string;
};

const MONEY = /৳[\d,.]+|\bBDT\s*[\d,.]+|potential saving[s]?[:\s][^.]*(?:\.|$)/gi;

export function stripMoneyClaims(text: string): string {
  return text
    .replace(MONEY, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;])/g, "$1")
    .trim();
}

function slug(value: string, index: number) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || `item-${index + 1}`;
}

function healthFrom(spending: number, potential: number): {
  score: number;
  label: HealthLabel;
  summary: string;
} {
  const ratio = spending === 0 ? 0 : potential / spending;
  const score = Math.min(95, Math.max(10, Math.round(100 - ratio * 80)));
  const label: HealthLabel = score >= 75 ? "Strong" : score >= 50 ? "Fair" : "Strained";
  return {
    score,
    label,
    summary:
      potential === 0
        ? "No reviewable charges stood out from the ledger."
        : `Reviewable charges are ${Math.round(ratio * 100)}% of observed expenses if those patterns stop.`,
  };
}

function buildLeak(seed: LeakSeed, rows: ApiTransaction[]): Leak | null {
  const draft: Leak = {
    id: seed.id,
    name: seed.name,
    category: seed.category,
    monthly: 0,
    savings: 0,
    yearly: 0,
    severity: seed.severity,
    cadence: "",
    lastCharge: "",
    reason: stripMoneyClaims(seed.reason),
    recommendation: stripMoneyClaims(seed.recommendation),
    charges: [],
  };
  const supporting = matchLeakTransactions(draft, withTransactionIds(expensesOf(rows)));
  if (supporting.length === 0) return null;
  const observed = Math.round(supporting.reduce((sum, row) => sum + row.amount, 0));
  return {
    ...draft,
    monthly: observed,
    savings: observed,
    yearly: observed * 12,
    cadence: cadenceFrom(supporting.length),
    lastCharge: lastChargeOf(supporting),
    charges: supporting.map((row) => ({
      date: row.date,
      amount: row.amount,
      note: row.merchant,
    })),
  };
}

function recurringFrom(rows: ApiTransaction[], leaks: Leak[]): RecurringItem[] {
  const ledger = withTransactionIds(expensesOf(rows));
  const detected = detectRecurring(ledger);
  const byMerchant = new Map<string, ApiTransaction[]>();
  for (const row of expensesOf(rows)) {
    const key = row.merchant.toLowerCase();
    const current = byMerchant.get(key) ?? [];
    current.push(row);
    byMerchant.set(key, current);
  }

  const items: RecurringItem[] = [];
  const seen = new Set<string>();

  for (const pattern of detected) {
    const first = ledger.find((row) => pattern.transactionIds.includes(row.id));
    if (!first) continue;
    const key = first.merchant.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const group = byMerchant.get(key) ?? [];
    const amount = sumAmount(group);
    items.push({
      id: slug(first.merchant, items.length),
      name: first.merchant,
      frequency: "Monthly",
      amount,
      annual: amount * 12,
      leak: leaks.some((leak) =>
        leak.charges.some((charge) => charge.note.toLowerCase() === key),
      ),
    });
  }

  for (const leak of leaks) {
    const name = leak.charges[0]?.note ?? leak.name;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      id: slug(name, items.length),
      name,
      frequency: null,
      amount: leak.monthly,
      annual: null,
      leak: true,
    });
  }

  return items;
}

export function reconcileAnalysis(
  rows: ApiTransaction[],
  interpretation: Interpretation,
): AnalysisResponse {
  const spendRows = expensesOf(rows);
  const incomeRows = incomeOf(rows);
  const totalSpending = sumAmount(spendRows);
  const totalIncome = sumAmount(incomeRows);
  const leaks = interpretation.leaks
    .map((seed) => buildLeak(seed, rows))
    .filter((leak): leak is Leak => Boolean(leak));

  const potentialMonthlySavings = leaks.reduce((sum, leak) => sum + leak.savings, 0);
  const hidden = leaks.filter((leak) => leak.severity !== "high");
  const leakCategories = new Set(leaks.map((leak) => leak.category));
  const categories = categoryTotals(rows).map((cat) => ({
    ...cat,
    leak: leakCategories.has(cat.name),
  }));

  const series = spendSeries(rows).map((point) => ({
    ...point,
    leaks: leaks
      .filter((leak) =>
        leak.charges.some((charge) => {
          const date = new Date(charge.date);
          if (Number.isNaN(date.getTime())) return true;
          const label = `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()]} ${date.getFullYear()}`;
          return label === point.month;
        }),
      )
      .reduce((sum, leak) => sum + leak.monthly, 0),
  }));

  const health = healthFrom(totalSpending, potentialMonthlySavings);
  const whatIf = leaks.slice(0, 3).map((leak) => ({
    id: leak.id,
    leakId: leak.id,
    label: leak.name,
    hint: leak.recommendation,
    maxMonthly: leak.monthly,
    defaultValue: 100,
  }));

  const actionPlan: ActionItem[] = (interpretation.actionPlan ?? [])
    .map((item) => {
      const leak = leaks.find((entry) => entry.id === item.leakId);
      if (!leak) return null;
      return {
        ...item,
        title: stripMoneyClaims(item.title),
        detail: stripMoneyClaims(item.detail),
        monthly: leak.savings,
      };
    })
    .filter((item): item is ActionItem => Boolean(item));

  if (actionPlan.length === 0) {
    leaks.slice(0, 3).forEach((leak, index) => {
      actionPlan.push({
        id: `a${index + 1}`,
        leakId: leak.id,
        title: leak.name,
        detail: leak.recommendation,
        monthly: leak.savings,
        effort: index === 0 ? "10 min" : "2 min",
        priority: index === 0 ? "Now" : index === 1 ? "This week" : "This month",
      });
    });
  }

  return {
    currency: "BDT",
    periodLabel: periodLabelFrom(spendRows),
    headline: stripMoneyClaims(interpretation.headline) || "Here's what we found.",
    summary: stripMoneyClaims(interpretation.summary),
    totalSpending,
    totalIncome,
    netCash: totalIncome - totalSpending,
    expenseCount: spendRows.length,
    incomeCount: incomeRows.length,
    potentialMonthlySavings,
    hiddenLeakCount: hidden.length,
    hiddenLeakAmount: hidden.reduce((sum, leak) => sum + leak.savings, 0),
    health,
    spendSeries: series,
    categories,
    recurring: recurringFrom(rows, leaks),
    leaks,
    whatIf:
      whatIf.length > 0
        ? whatIf
        : [
            {
              id: "review",
              leakId: "review",
              label: "Review quiet charges",
              hint: "No strong leak pattern in this ledger.",
              maxMonthly: 0,
              defaultValue: 0,
            },
          ],
    actionPlan,
    unaskedQuestion: {
      title: "The question nobody asked",
      body: stripMoneyClaims(interpretation.unaskedQuestion),
    },
  };
}

export function interpretationFromApi(api: ApiAnalyzeResponse): Interpretation {
  return {
    headline: api.summary.headline,
    summary: api.summary.narrative,
    leaks: api.leaks.map((leak, index) => ({
      id: slug(leak.name, index),
      name: leak.name,
      category: leak.category || categorizeMerchant(leak.name),
      severity: leak.severity,
      reason: leak.reason,
      recommendation: leak.recommendation,
    })),
    actionPlan: api.recommendations.slice(0, 3).map((item, index) => ({
      id: `a${index + 1}`,
      leakId: slug(api.leaks[index]?.name ?? item.title, index),
      title: item.title,
      detail: item.detail,
      effort: item.effort,
      priority: item.priority,
    })),
    unaskedQuestion: api.question_nobody_asked,
  };
}
