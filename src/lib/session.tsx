import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { mockAnalysis, sampleCsv } from "./mockAnalysis";
import { mapAnalysis } from "./mapAnalysis";
import { parseTransactions } from "./parseTransactions";
import { friendlyError } from "./errors";
import type { AnalysisResponse } from "../types/analysis";
import type { ApiAnalyzeResponse, ApiErrorResponse, ApiTransaction } from "../types/api";

type Session = {
  rawInput: string;
  setRawInput: (value: string) => void;
  loadSample: () => void;
  transactions: ApiTransaction[];
  setTransactions: (rows: ApiTransaction[]) => void;
  analysis: AnalysisResponse;
  analysisError: string;
  runAnalysis: () => Promise<void>;
  doneActions: string[];
  toggleAction: (id: string) => void;
};

const SessionContext = createContext<Session | null>(null);

function isSampleText(value: string) {
  return value.trim() === sampleCsv.trim();
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [rawInput, setRawInputState] = useState("");
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse>(mockAnalysis);
  const [analysisError, setAnalysisError] = useState("");
  const [doneActions, setDoneActions] = useState<string[]>([]);
  const sourceRef = useRef<"sample" | "custom">("custom");

  const setRawInput = useCallback((value: string) => {
    sourceRef.current = isSampleText(value) ? "sample" : "custom";
    setRawInputState(value);
  }, []);

  const loadSample = useCallback(() => {
    sourceRef.current = "sample";
    setRawInputState(sampleCsv);
    setTransactions(parseTransactions(sampleCsv));
    setAnalysisError("");
  }, []);

  const runAnalysis = useCallback(async () => {
    const rows =
      transactions.length > 0 ? transactions : parseTransactions(rawInput);
    if (rows.length === 0 && sourceRef.current !== "sample") {
      const message = "Please add at least one transaction.";
      setAnalysisError(message);
      throw new Error(message);
    }

    const useSample =
      sourceRef.current === "sample" || isSampleText(rawInput);
    setAnalysisError("");

    if (useSample) {
      const sampleRows = parseTransactions(sampleCsv);
      setTransactions(sampleRows);
      setRawInputState(sampleCsv);
      setAnalysis(mockAnalysis);
      setDoneActions([]);
      return;
    }

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactions: rows.map((row) => ({
          date: row.date,
          merchant: row.merchant,
          amount:
            row.direction === "income"
              ? -Math.abs(row.amount)
              : Math.abs(row.amount),
        })),
      }),
    });

    let payload: ApiAnalyzeResponse | ApiErrorResponse | null = null;
    try {
      payload = (await response.json()) as ApiAnalyzeResponse | ApiErrorResponse;
    } catch {
      const message = "We couldn't analyze this data. Try again.";
      setAnalysisError(message);
      throw new Error(message);
    }

    if (!response.ok || "error" in payload) {
      const message = friendlyError(
        payload && "error" in payload ? payload.error : "",
      );
      setAnalysisError(message);
      throw new Error(message);
    }

    const mapped = mapAnalysis(payload, rows);
    if (mapped.leaks.length === 0 && mapped.potentialMonthlySavings === 0) {
      const message =
        "We couldn't find enough information to identify meaningful patterns.";
      setAnalysisError(message);
      throw new Error(message);
    }

    setTransactions(rows);
    setAnalysis(mapped);
    setDoneActions([]);
  }, [rawInput, transactions]);

  const toggleAction = useCallback((id: string) => {
    setDoneActions((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }, []);

  const value = useMemo<Session>(
    () => ({
      rawInput,
      setRawInput,
      loadSample,
      transactions,
      setTransactions,
      analysis,
      analysisError,
      runAnalysis,
      doneActions,
      toggleAction,
    }),
    [
      rawInput,
      setRawInput,
      loadSample,
      transactions,
      analysis,
      analysisError,
      runAnalysis,
      doneActions,
      toggleAction,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
