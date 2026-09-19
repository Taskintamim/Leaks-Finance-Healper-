export type LeakSeverity = "high" | "medium" | "low";
export type HealthLabel = "Strong" | "Fair" | "Strained";
export type ActionPriority = "Now" | "This week" | "This month";
export type ActionEffort = "2 min" | "10 min" | "30 min";

export type Charge = {
  date: string;
  amount: number;
  note: string;
};

export type Leak = {
  id: string;
  name: string;
  category: string;
  monthly: number;
  savings: number;
  yearly: number;
  severity: LeakSeverity;
  cadence: string;
  lastCharge: string;
  reason: string;
  recommendation: string;
  charges: Charge[];
};

export type Category = {
  name: string;
  amount: number;
  share: number;
  leak: boolean;
};

export type RecurringItem = {
  id: string;
  name: string;
  frequency: string | null;
  amount: number;
  annual: number | null;
  leak: boolean;
};

export type WhatIfControl = {
  id: string;
  leakId: string;
  label: string;
  hint: string;
  maxMonthly: number;
  defaultValue: number;
};

export type ActionItem = {
  id: string;
  leakId: string;
  title: string;
  detail: string;
  monthly: number;
  effort: ActionEffort;
  priority: ActionPriority;
};

export type SpendPoint = {
  month: string;
  amount: number;
  leaks: number;
};

export type UnaskedQuestion = {
  title: string;
  body: string;
};

export type SpendingHealth = {
  score: number;
  label: HealthLabel;
  summary: string;
};

/**
 * UI model for the results screens.
 * Built from POST /api/analyze via mapAnalysis().
 */
export type AnalysisResponse = {
  currency: "BDT";
  periodLabel: string;
  headline: string;
  summary: string;
  totalSpending: number;
  totalIncome: number;
  netCash: number;
  expenseCount: number;
  incomeCount: number;
  potentialMonthlySavings: number;
  hiddenLeakCount: number;
  hiddenLeakAmount: number;
  health: SpendingHealth;
  spendSeries: SpendPoint[];
  categories: Category[];
  recurring: RecurringItem[];
  leaks: Leak[];
  whatIf: WhatIfControl[];
  actionPlan: ActionItem[];
  unaskedQuestion: UnaskedQuestion;
};

export type ExpenseInputPayload = {
  source: "paste" | "csv" | "sample";
  rawText: string;
};
