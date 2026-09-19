import type { ApiTransaction } from "../types/api";
import {
  classifyFlow,
  inferExpenseSign,
  parseSignedAmount,
} from "./ledger";

function splitRow(line: string) {
  if (line.includes("\t")) return line.split("\t").map((cell) => cell.trim());
  return line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
}

function looksLikeHeader(cells: string[]) {
  const joined = cells.join(" ").toLowerCase();
  return (
    joined.includes("merchant") ||
    joined.includes("amount") ||
    joined.includes("date") ||
    joined.includes("description")
  );
}

type Draft = { date: string; merchant: string; signed: number };

function draftRow(line: string): Draft | null {
  const cells = splitRow(line).filter((cell) => cell.length > 0);
  if (cells.length < 2) return null;
  if (looksLikeHeader(cells)) return null;

  let date = "";
  let merchant = "";
  let signed: number | null = null;

  if (cells.length >= 3) {
    date = cells[0];
    signed = parseSignedAmount(cells[cells.length - 1]);
    merchant = cells.slice(1, -1).join(", ");
  } else {
    signed = parseSignedAmount(cells[1]);
    if (signed === null) {
      signed = parseSignedAmount(cells[0]);
      merchant = cells[1];
    } else {
      merchant = cells[0];
    }
  }

  if (!merchant || signed === null) return null;
  return { date: date || "unknown", merchant, signed };
}

export function parseTransactions(raw: string): ApiTransaction[] {
  const drafts: Draft[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const draft = draftRow(trimmed);
    if (draft) drafts.push(draft);
  }

  const expenseSign = inferExpenseSign(drafts.map((row) => row.signed));
  return drafts.map((draft, index) => ({
    id: `tx${index + 1}`,
    date: draft.date,
    merchant: draft.merchant,
    amount: Math.abs(draft.signed),
    direction: classifyFlow(draft.merchant, draft.signed, expenseSign),
  }));
}

export type PreviewLine = {
  id: string;
  text: string;
  ok: boolean;
  row?: ApiTransaction;
};

export function previewLines(raw: string): PreviewLine[] {
  const parsed = parseTransactions(raw);
  const lines: PreviewLine[] = [];
  let cursor = 0;

  raw.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const cells = splitRow(trimmed).filter((cell) => cell.length > 0);
    if (looksLikeHeader(cells)) {
      lines.push({ id: `${index}-header`, text: trimmed, ok: true });
      return;
    }
    if (draftRow(trimmed) && parsed[cursor]) {
      lines.push({
        id: `${index}-${trimmed}`,
        text: trimmed,
        ok: true,
        row: parsed[cursor],
      });
      cursor += 1;
    } else {
      lines.push({
        id: `${index}-${trimmed}`,
        text: trimmed,
        ok: false,
      });
    }
  });

  return lines;
}
