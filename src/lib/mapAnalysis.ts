import type { AnalysisResponse } from "../types/analysis";
import type { ApiAnalyzeResponse, ApiTransaction } from "../types/api";
import { interpretationFromApi, reconcileAnalysis } from "./reconcileAnalysis";

export function mapAnalysis(
  api: ApiAnalyzeResponse,
  transactions: ApiTransaction[],
): AnalysisResponse {
  return reconcileAnalysis(transactions, interpretationFromApi(api));
}
