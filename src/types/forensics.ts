import type { ActionEffort } from "./analysis";

export type LedgerTransaction = {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  direction?: "expense" | "income";
};

export type PatternKind =
  | "repeated_merchant"
  | "recurring"
  | "unusual_frequency"
  | "large_transaction"
  | "spending_spike"
  | "category_concentration"
  | "short_interval"
  | "possible_duplicate"
  | "weekday_concentration"
  | "weekend_concentration"
  | "end_of_week";

export type DetectedPattern = {
  kind: PatternKind;
  label: string;
  detail: string;
  transactionIds: string[];
};

export type ForensicEvidence = {
  transactionCount: number;
  averageAmount: number | null;
  largestAmount: number | null;
  discretionaryShare: number | null;
  trendPercent: number | null;
  activeWeeks: number;
};

export type ForensicReport = {
  leakId: string;
  insight: string;
  supportingTransactionIds: string[];
  amount: number;
  potentialSavings: number;
  observation: string;
  whyItMatters: string;
  evidence: ForensicEvidence;
  patterns: DetectedPattern[];
};

export type ScenarioResult = {
  percent: number;
  currentMonthly: number;
  nextMonthly: number;
  potentialMonthly: number;
  potentialYearly: number;
};

export type PortfolioScenarioId = "current" | "moderate" | "aggressive";

export type PortfolioScenario = {
  id: PortfolioScenarioId;
  label: string;
  spend: number;
  monthlyDifference: number;
  yearlyDifference: number;
};

export type EffortBand = "LOW" | "MEDIUM" | "HIGH";

export type DecisionRow = {
  leakId: string;
  title: string;
  potentialMonthly: number;
  effort: EffortBand;
  sourceEffort?: ActionEffort;
};

export type CumulativePoint = {
  month: number;
  amount: number;
};

export type ForensicsBundle = {
  reports: ForensicReport[];
  scenarios: PortfolioScenario[];
  decisions: DecisionRow[];
  ledger: LedgerTransaction[];
};
