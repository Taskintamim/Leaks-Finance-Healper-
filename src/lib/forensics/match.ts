import type { Leak } from "../../types/analysis";
import type { LedgerTransaction } from "../../types/forensics";
import { leakNameTokens, merchantTokens, normalizeMerchant } from "./normalize";

export function matchLeakTransactions(
  leak: Leak,
  ledger: LedgerTransaction[],
): LedgerTransaction[] {
  const expenses = ledger.filter((row) => (row.direction ?? "expense") === "expense");
  const tokens = leakNameTokens(leak.name);
  if (tokens.length === 0) return matchFromCharges(leak, expenses);

  const needed = Math.min(2, tokens.length);
  const matched = expenses.filter((row) => {
    const merchant = merchantTokens(row.merchant);
    const overlap = tokens.filter((token) => merchant.includes(token)).length;
    return overlap >= needed;
  });

  if (matched.length > 0) return matched;
  return matchFromCharges(leak, expenses);
}

function matchFromCharges(leak: Leak, ledger: LedgerTransaction[]) {
  return ledger.filter((row) =>
    leak.charges.some(
      (charge) =>
        normalizeMerchant(charge.note) === normalizeMerchant(row.merchant) &&
        charge.amount === row.amount &&
        (charge.date === row.date || charge.date === "unknown" || !charge.date),
    ),
  );
}
