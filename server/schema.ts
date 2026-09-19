import { z } from "zod";

export const TransactionSchema = z.object({
  date: z.string().min(1),
  merchant: z.string().min(1),
  amount: z.number().finite(),
});

export const AnalyzeRequestSchema = z.object({
  transactions: z.array(TransactionSchema).min(1),
});

export const AnalyzeResponseSchema = z.object({
  summary: z.object({
    headline: z.string(),
    narrative: z.string(),
    total_spending: z.number(),
    potential_monthly_savings: z.number(),
    hidden_leak_count: z.number(),
    health_score: z.number(),
    health_label: z.enum(["Strong", "Fair", "Strained"]),
    period_label: z.string(),
  }),
  categories: z.array(
    z.object({
      name: z.string(),
      amount: z.number(),
      share: z.number(),
      leak: z.boolean(),
    }),
  ),
  recurring_expenses: z.array(
    z.object({
      name: z.string(),
      cadence: z.string(),
      monthly: z.number(),
      leak: z.boolean(),
    }),
  ),
  leaks: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
      monthly: z.number(),
      yearly: z.number(),
      severity: z.enum(["high", "medium", "low"]),
      cadence: z.string(),
      last_charge: z.string(),
      reason: z.string(),
      recommendation: z.string(),
    }),
  ),
  anomalies: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
      amount: z.number(),
    }),
  ),
  recommendations: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
      monthly: z.number(),
      priority: z.enum(["Now", "This week", "This month"]),
      effort: z.enum(["2 min", "10 min", "30 min"]),
    }),
  ),
  top_leak: z.object({
    name: z.string(),
    monthly: z.number(),
    reason: z.string(),
  }),
  question_nobody_asked: z.string(),
});
