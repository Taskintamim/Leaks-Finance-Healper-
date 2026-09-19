import type { AnalysisResponse } from "../types/analysis";
import type { Interpretation } from "./reconcileAnalysis";
import { parseTransactions } from "./parseTransactions";
import { reconcileAnalysis } from "./reconcileAnalysis";

export const sampleCsv = `date,merchant,amount
2026-09-02,Netflix,550
2026-09-03,Spotify,199
2026-09-04,Foodpanda,940
2026-09-05,Uber,340
2026-09-07,Fitness First,2500
2026-09-08,Shwapno,1100
2026-09-09,GP Recharge,499
2026-09-12,Foodpanda,820
2026-09-14,Pathao Food,560
2026-09-22,bKash cash out,80
2026-09-26,Pathao,242`;

export const demoInterpretation: Interpretation = {
  headline: "Here's what we found.",
  summary:
    "One month of spending. Fitness First, Foodpanda, and Pathao Food are the largest reviewable charges.",
  leaks: [
    {
      id: "ghost-gym",
      name: "Fitness First membership",
      category: "Health",
      severity: "high",
      reason:
        "A single Fitness First charge is the largest expense this period. There is no second observation in the ledger.",
      recommendation: "Review the membership before another charge posts.",
    },
    {
      id: "foodpanda-fees",
      name: "Foodpanda",
      category: "Food delivery",
      severity: "medium",
      reason:
        "Two Foodpanda expenses appear this period, alongside groceries at Shwapno.",
      recommendation: "Cap delivery frequency if the food itself is not the issue.",
    },
    {
      id: "pathao-food",
      name: "Pathao Food",
      category: "Food delivery",
      severity: "low",
      reason:
        "One Pathao Food expense sits on top of Foodpanda in the same period.",
      recommendation: "Keep one delivery app if both stay in rotation.",
    },
  ],
  actionPlan: [
    {
      id: "a1",
      leakId: "ghost-gym",
      title: "Review Fitness First",
      detail: "Confirm whether the membership should post again.",
      effort: "10 min",
      priority: "Now",
    },
    {
      id: "a2",
      leakId: "foodpanda-fees",
      title: "Review Foodpanda",
      detail: "Two orders this period. Decide a cap before the next month.",
      effort: "2 min",
      priority: "This week",
    },
    {
      id: "a3",
      leakId: "pathao-food",
      title: "Review Pathao Food",
      detail: "One order besides Foodpanda.",
      effort: "2 min",
      priority: "This month",
    },
  ],
  unaskedQuestion:
    "What happens if Fitness First posts again next month at the same amount?",
};

export const sampleTransactions = parseTransactions(sampleCsv);

export const mockAnalysis: AnalysisResponse = reconcileAnalysis(
  sampleTransactions,
  demoInterpretation,
);
