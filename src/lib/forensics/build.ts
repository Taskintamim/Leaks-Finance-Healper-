import type { AnalysisResponse, Leak } from "../../types/analysis";
import type { ApiTransaction } from "../../types/api";
import type {
  DecisionRow,
  EffortBand,
  ForensicReport,
  ForensicsBundle,
  LedgerTransaction,
} from "../../types/forensics";
import { detectPatterns } from "./detect";
import { matchLeakTransactions } from "./match";
import { average, isoWeekKey, withTransactionIds } from "./normalize";
import { calculatePortfolioScenarios } from "./scenarios";
import { expensesOf } from "../ledger";

function effortBand(leak: Leak, analysis: AnalysisResponse): EffortBand {
  const action = analysis.actionPlan.find((item) => item.leakId === leak.id);
  if (action?.effort === "2 min") return "LOW";
  if (action?.effort === "10 min") return "MEDIUM";
  if (action?.effort === "30 min") return "HIGH";
  return "MEDIUM";
}

function trendPercent(rows: LedgerTransaction[]): number | null {
  if (rows.length < 4) return null;
  const dated = rows
    .map((row) => ({ row, time: new Date(row.date).getTime() }))
    .filter((item) => !Number.isNaN(item.time))
    .sort((a, b) => a.time - b.time);
  if (dated.length < 4) return null;
  const mid = Math.floor(dated.length / 2);
  const first = dated.slice(0, mid).reduce((sum, item) => sum + item.row.amount, 0);
  const second = dated.slice(mid).reduce((sum, item) => sum + item.row.amount, 0);
  if (first === 0) return null;
  return Math.round(((second - first) / first) * 100);
}

function resolveLedger(
  transactions: ApiTransaction[],
  analysis: AnalysisResponse,
): LedgerTransaction[] {
  const spend = expensesOf(transactions);
  if (spend.length > 0) return withTransactionIds(spend);
  return analysis.leaks.flatMap((leak) =>
    leak.charges.map((charge, index) => ({
      id: `${leak.id}-${index + 1}`,
      date: charge.date,
      merchant: charge.note,
      amount: charge.amount,
      direction: "expense" as const,
    })),
  );
}

export function buildLeakForensic(
  leak: Leak,
  ledger: LedgerTransaction[],
  analysis: AnalysisResponse,
): ForensicReport {
  const supporting = matchLeakTransactions(leak, ledger);
  const weeks = new Set(
    supporting
      .map((row) => isoWeekKey(row.date))
      .filter((key): key is string => Boolean(key)),
  );
  const amounts = supporting.map((row) => row.amount);
  const category = analysis.categories.find((item) => item.name === leak.category);
  const leakShare =
    analysis.totalSpending > 0 ? leak.monthly / analysis.totalSpending : null;

  const count = supporting.length;
  const observation =
    count === 0
      ? "Not enough ledger rows to attach supporting transactions."
      : `${count} transaction${count === 1 ? "" : "s"} across ${Math.max(weeks.size, 1)} active week${weeks.size === 1 ? "" : "s"}.`;

  return {
    leakId: leak.id,
    insight: leak.name,
    supportingTransactionIds: supporting.map((row) => row.id),
    amount: leak.monthly,
    potentialSavings: leak.savings,
    observation,
    whyItMatters: leak.reason,
    evidence: {
      transactionCount: count,
      averageAmount: average(amounts),
      largestAmount: amounts.length > 0 ? Math.max(...amounts) : null,
      discretionaryShare: leakShare,
      trendPercent: trendPercent(supporting),
      activeWeeks: weeks.size,
    },
    patterns: detectPatterns(ledger, supporting, category?.share ?? leakShare),
  };
}

export { matchLeakTransactions };

export function buildForensics(
  transactions: ApiTransaction[],
  analysis: AnalysisResponse,
): ForensicsBundle {
  const ledger = resolveLedger(transactions, analysis);
  const reports = analysis.leaks.map((leak) =>
    buildLeakForensic(leak, ledger, analysis),
  );
  const scenarios = calculatePortfolioScenarios(
    analysis.totalSpending,
    analysis.potentialMonthlySavings,
  );
  const decisions: DecisionRow[] = analysis.leaks.map((leak) => {
    const action = analysis.actionPlan.find((item) => item.leakId === leak.id);
    return {
      leakId: leak.id,
      title: action?.title ?? leak.name,
      potentialMonthly: leak.savings,
      effort: effortBand(leak, analysis),
      sourceEffort: action?.effort,
    };
  });

  return { reports, scenarios, decisions, ledger };
}

export function supportingRows(
  report: ForensicReport | undefined,
  ledger: LedgerTransaction[],
): LedgerTransaction[] {
  if (!report) return [];
  const ids = new Set(report.supportingTransactionIds);
  return ledger.filter((row) => ids.has(row.id));
}
