export { normalizeMerchant, withTransactionIds } from "./normalize";
export {
  calculateCategoryTotals,
  detectDuplicates,
  detectPatterns,
  detectRecurring,
  detectSpikes,
} from "./detect";
export {
  calculateAnnualOpportunity,
  calculateCumulative,
  calculatePortfolioScenarios,
  calculateScenario,
  SCENARIO_PERCENTS,
} from "./scenarios";
export {
  buildForensics,
  buildLeakForensic,
  matchLeakTransactions,
  supportingRows,
} from "./build";
