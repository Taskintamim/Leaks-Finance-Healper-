export type ApiTransaction = {
  id?: string;
  date: string;
  merchant: string;
  amount: number;
  direction?: "expense" | "income";
};

export type ApiAnalyzeRequest = {
  transactions: ApiTransaction[];
};

export type ApiLeak = {
  name: string;
  category: string;
  monthly: number;
  yearly: number;
  severity: "high" | "medium" | "low";
  cadence: string;
  last_charge: string;
  reason: string;
  recommendation: string;
};

export type ApiAnalyzeResponse = {
  summary: {
    headline: string;
    narrative: string;
    total_spending: number;
    potential_monthly_savings: number;
    hidden_leak_count: number;
    health_score: number;
    health_label: "Strong" | "Fair" | "Strained";
    period_label: string;
  };
  categories: {
    name: string;
    amount: number;
    share: number;
    leak: boolean;
  }[];
  recurring_expenses: {
    name: string;
    cadence: string;
    monthly: number;
    leak: boolean;
  }[];
  leaks: ApiLeak[];
  anomalies: {
    title: string;
    detail: string;
    amount: number;
  }[];
  recommendations: {
    title: string;
    detail: string;
    monthly: number;
    priority: "Now" | "This week" | "This month";
    effort: "2 min" | "10 min" | "30 min";
  }[];
  top_leak: {
    name: string;
    monthly: number;
    reason: string;
  };
  question_nobody_asked: string;
};

export type ApiErrorResponse = {
  error: string;
};
