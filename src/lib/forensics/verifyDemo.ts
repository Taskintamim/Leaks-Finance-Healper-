import { parseTransactions } from "../parseTransactions";
import { mockAnalysis, sampleCsv } from "../mockAnalysis";
import { reconcileAnalysis } from "../reconcileAnalysis";
import { buildForensics, calculateScenario, calculateCumulative } from "./index";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const ledger = parseTransactions(sampleCsv);
const bundle = buildForensics(ledger, mockAnalysis);

assert(mockAnalysis.totalSpending === 7830, "demo spend must be the expense sum 7830");
assert(mockAnalysis.totalIncome === 0, "demo has no income");
assert(mockAnalysis.netCash === -7830, "net cash is income minus expenses");
assert(mockAnalysis.expenseCount === 11, "demo has 11 expenses");
assert(mockAnalysis.incomeCount === 0, "demo has 0 income rows");

const gymLeak = mockAnalysis.leaks.find((leak) => leak.id === "ghost-gym");
const foodLeak = mockAnalysis.leaks.find((leak) => leak.id === "foodpanda-fees");
const pathaoLeak = mockAnalysis.leaks.find((leak) => leak.id === "pathao-food");
assert(Boolean(gymLeak && foodLeak && pathaoLeak), "demo leaks missing");
assert(gymLeak!.monthly === 2500, "gym monthly is the observed Fitness First charge");
assert(gymLeak!.savings === 2500, "gym savings equals observed supporting sum");
assert(gymLeak!.yearly === 30000, "gym yearly is monthly × 12");
assert(foodLeak!.monthly === 1760, "Foodpanda monthly is 940 + 820");
assert(foodLeak!.savings === 1760, "Foodpanda savings equals observed supporting sum");
assert(pathaoLeak!.monthly === 560, "Pathao Food monthly is the observed charge");
assert(pathaoLeak!.savings === 560, "Pathao Food savings equals observed supporting sum");

const leakSum = mockAnalysis.leaks.reduce((sum, leak) => sum + leak.savings, 0);
assert(
  mockAnalysis.potentialMonthlySavings === leakSum,
  "hero potential must equal sum of leak.savings",
);
assert(mockAnalysis.potentialMonthlySavings === 4820, "demo potential is 2500+1760+560");
assert(mockAnalysis.hiddenLeakCount === 2, "hidden count is non-high leaks");
assert(mockAnalysis.hiddenLeakAmount === 2320, "hidden amount is 1760+560");

const categorySum = mockAnalysis.categories.reduce((sum, cat) => sum + cat.amount, 0);
assert(categorySum === 7830, "categories must sum to observed expenses");
assert(
  mockAnalysis.spendSeries.reduce((sum, point) => sum + point.amount, 0) === 7830,
  "spend series must sum to observed expenses",
);
assert(mockAnalysis.whatIf.every((item) => item.defaultValue === 100), "What-If defaults to 100%");
assert(
  mockAnalysis.whatIf.reduce((sum, item) => sum + item.maxMonthly, 0) ===
    mockAnalysis.potentialMonthlySavings,
  "What-If at 100% must match hero potential",
);
assert(
  mockAnalysis.actionPlan.every((item) => {
    const leak = mockAnalysis.leaks.find((entry) => entry.id === item.leakId);
    return leak != null && item.monthly === leak.savings;
  }),
  "action plan monthly must come from leak.savings",
);
assert(
  mockAnalysis.recurring.every((item) => item.frequency == null && item.annual == null),
  "one-month demo must not invent monthly/annual cadence",
);

const gym = bundle.reports.find((report) => report.leakId === "ghost-gym");
const food = bundle.reports.find((report) => report.leakId === "foodpanda-fees");
const pathao = bundle.reports.find((report) => report.leakId === "pathao-food");

assert(Boolean(gym && food && pathao), "demo reports missing");
assert(gym!.supportingTransactionIds.length === 1, "gym should attach 1 Fitness First row");
assert(food!.supportingTransactionIds.length === 2, "Foodpanda should attach 2 rows");
assert(pathao!.supportingTransactionIds.length === 1, "Pathao Food should attach 1 row");
assert(gym!.amount === gymLeak!.monthly, "forensic amount is leak.monthly");
assert(gym!.potentialSavings === gymLeak!.savings, "forensic savings is leak.savings");
assert(food!.amount === 1760, "forensic Foodpanda amount is supporting sum");

const foodRows = bundle.ledger.filter((row) =>
  food!.supportingTransactionIds.includes(row.id),
);
assert(
  foodRows.every((row) => row.merchant === "Foodpanda"),
  "Foodpanda evidence must be Foodpanda rows only",
);
assert(
  foodRows.reduce((sum, row) => sum + row.amount, 0) === 1760,
  "Foodpanda supporting total should be 1760",
);

assert(gym!.evidence.trendPercent == null, "single gym charge must not invent a trend");
assert(food!.evidence.trendPercent == null, "two Foodpanda rows must not invent a trend");

const cut = calculateScenario(1200, 25);
assert(cut.nextMonthly === 900, "25% of 1200 must be 900");
assert(cut.potentialMonthly === 300, "savings must be 300");
assert(cut.potentialYearly === 3600, "yearly must be monthly × 12");

const gymCut = calculateScenario(2500, 25);
assert(gymCut.nextMonthly === 1875, "25% of 2500 must be 1875");
assert(gymCut.potentialYearly === gymCut.potentialMonthly * 12, "yearly = monthly × 12");

const current = bundle.scenarios.find((item) => item.id === "current");
const moderate = bundle.scenarios.find((item) => item.id === "moderate");
const aggressive = bundle.scenarios.find((item) => item.id === "aggressive");
assert(current!.spend === mockAnalysis.totalSpending, "current scenario is observed spend");
assert(moderate!.monthlyDifference * 12 === moderate!.yearlyDifference, "moderate yearly");
assert(aggressive!.monthlyDifference * 12 === aggressive!.yearlyDifference, "aggressive yearly");
assert(moderate!.spend === 7830 - moderate!.monthlyDifference, "moderate spend");
assert(
  Math.round(mockAnalysis.potentialMonthlySavings * 0.35) === moderate!.monthlyDifference,
  "moderate cut is 35% of the same potential",
);

const trail = calculateCumulative(890);
assert(trail[0].amount === 890, "month 1");
assert(trail[5].amount === 5340, "month 6");

assert(
  !bundle.reports.some((report) =>
    report.patterns.some((pattern) => pattern.kind === "possible_duplicate"),
  ),
  "demo has no duplicates",
);

const mixed = parseTransactions(`date,merchant,amount
2026-09-01,Salary,50000
2026-09-04,Foodpanda,940`);
const mixedAnalysis = reconcileAnalysis(mixed, {
  headline: "Mixed ledger",
  summary: "Salary should not enter spend.",
  leaks: [
    {
      id: "foodpanda-fees",
      name: "Foodpanda",
      category: "Food delivery",
      severity: "medium",
      reason: "One delivery charge.",
      recommendation: "Review delivery.",
    },
  ],
  unaskedQuestion: "What if salary is treated as spend?",
});
assert(mixedAnalysis.totalIncome === 50000, "salary is income");
assert(mixedAnalysis.totalSpending === 940, "only Foodpanda is spend");
assert(mixedAnalysis.incomeCount === 1, "one income row");
assert(mixedAnalysis.expenseCount === 1, "one expense row");
assert(
  !mixedAnalysis.categories.some((cat) => cat.amount === 50000),
  "income must not appear in expense categories",
);
assert(mixedAnalysis.potentialMonthlySavings === 940, "potential is the expense leak only");

const invented = [
  mockAnalysis.headline,
  mockAnalysis.summary,
  ...mockAnalysis.leaks.flatMap((leak) => [leak.reason, leak.recommendation]),
  mockAnalysis.unaskedQuestion.body,
].join(" ");
assert(
  !/(1550|800|430|200|1230|2550)/.test(invented),
  "demo copy must not keep fabricated money claims",
);

console.log("forensics demo checks passed", {
  gymIds: gym!.supportingTransactionIds,
  foodIds: food!.supportingTransactionIds,
  pathaoIds: pathao!.supportingTransactionIds,
  potential: mockAnalysis.potentialMonthlySavings,
  hidden: mockAnalysis.hiddenLeakAmount,
  scenarios: bundle.scenarios,
  patterns: bundle.reports.map((report) => ({
    leak: report.leakId,
    patterns: report.patterns.map((pattern) => pattern.kind),
  })),
});
