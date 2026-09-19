import type {
  CumulativePoint,
  PortfolioScenario,
  ScenarioResult,
} from "../../types/forensics";
import { roundMoney } from "./normalize";

export const SCENARIO_PERCENTS = [0, 10, 25, 50, 75] as const;
export const MODERATE_RATE = 0.35;
export const AGGRESSIVE_RATE = 0.75;

export function calculateAnnualOpportunity(monthly: number): number {
  return roundMoney(monthly) * 12;
}

export function calculateScenario(
  currentMonthly: number,
  reducePercent: number,
): ScenarioResult {
  const percent = Math.min(100, Math.max(0, reducePercent));
  const current = roundMoney(currentMonthly);
  const nextMonthly = roundMoney(current * (1 - percent / 100));
  const potentialMonthly = current - nextMonthly;
  return {
    percent,
    currentMonthly: current,
    nextMonthly,
    potentialMonthly,
    potentialYearly: calculateAnnualOpportunity(potentialMonthly),
  };
}

export function calculateCumulative(
  monthlyDifference: number,
  months = 6,
): CumulativePoint[] {
  const step = roundMoney(monthlyDifference);
  return Array.from({ length: months }, (_, index) => ({
    month: index + 1,
    amount: step * (index + 1),
  }));
}

export function calculatePortfolioScenarios(
  totalSpending: number,
  potentialMonthly: number,
): PortfolioScenario[] {
  const total = roundMoney(totalSpending);
  const potential = roundMoney(potentialMonthly);
  const moderateCut = roundMoney(potential * MODERATE_RATE);
  const aggressiveCut = roundMoney(potential * AGGRESSIVE_RATE);

  return [
    {
      id: "current",
      label: "Current",
      spend: total,
      monthlyDifference: 0,
      yearlyDifference: 0,
    },
    {
      id: "moderate",
      label: "Moderate",
      spend: total - moderateCut,
      monthlyDifference: moderateCut,
      yearlyDifference: calculateAnnualOpportunity(moderateCut),
    },
    {
      id: "aggressive",
      label: "Aggressive",
      spend: total - aggressiveCut,
      monthlyDifference: aggressiveCut,
      yearlyDifference: calculateAnnualOpportunity(aggressiveCut),
    },
  ];
}
