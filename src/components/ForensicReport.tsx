import { useMemo, useState, type ReactNode } from "react";
import { money } from "../lib/format";
import {
  calculateScenario,
  SCENARIO_PERCENTS,
  supportingRows,
} from "../lib/forensics";
import type { Leak } from "../types/analysis";
import type { ForensicReport as ForensicReportModel, LedgerTransaction } from "../types/forensics";
import { AnimatedMoney } from "./AnimatedMoney";

export function ForensicReport({
  leak,
  report,
  ledger,
}: {
  leak: Leak;
  report?: ForensicReportModel;
  ledger: LedgerTransaction[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(2);
  const percent = SCENARIO_PERCENTS[step] ?? 25;
  const scenario = useMemo(
    () => calculateScenario(leak.monthly, percent),
    [leak.monthly, percent],
  );
  const rows = supportingRows(report, ledger);
  const evidence = report?.evidence;

  return (
    <div>
      <section className="border-t border-line pt-6">
        <p className="t-eyebrow">Observation</p>
        <p className="mt-3 text-[14px] leading-6 text-soft">
          {report?.observation ?? "Not enough ledger rows to attach supporting transactions."}
        </p>
      </section>

      {evidence && evidence.transactionCount > 0 ? (
        <section className="mt-8 border-t border-line pt-6">
          <p className="t-eyebrow">Evidence</p>
          <dl className="mt-4 space-y-3">
            <EvidenceRow label="Transaction frequency" value={String(evidence.transactionCount)} />
            {evidence.averageAmount != null ? (
              <EvidenceRow
                label="Average transaction"
                value={money(evidence.averageAmount)}
              />
            ) : null}
            {evidence.largestAmount != null ? (
              <EvidenceRow
                label="Largest single transaction"
                value={money(evidence.largestAmount)}
              />
            ) : null}
            {evidence.discretionaryShare != null ? (
              <EvidenceRow
                label="Share of spending"
                value={`${Math.round(evidence.discretionaryShare * 100)}%`}
              />
            ) : null}
            {evidence.trendPercent != null ? (
              <EvidenceRow
                label="Trend"
                value={`${evidence.trendPercent > 0 ? "+" : ""}${evidence.trendPercent}%`}
              />
            ) : null}
          </dl>
          {report && report.patterns.length > 0 ? (
            <ul className="mt-5 border-t border-line">
              {report.patterns.map((pattern) => (
                <li key={`${pattern.kind}-${pattern.detail}`} className="border-b border-line py-3">
                  <p className="text-[13px] tracking-[-0.01em]">{pattern.label}</p>
                  <p className="mt-1 text-[13px] leading-5 text-soft">{pattern.detail}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className="mt-8 border-t border-line pt-6">
        <p className="t-eyebrow">Why it matters</p>
        <p className="mt-3 text-[14px] leading-6 text-soft">
          {report?.whyItMatters ?? leak.reason}
        </p>
      </section>

      <section className="mt-8 border-t border-line pt-6">
        <p className="t-eyebrow text-moss">Possible opportunity</p>
        <p className="mt-3 font-mono text-[28px] tracking-[-0.04em] text-moss tabular">
          {money(leak.savings)}
          <span className="ml-2 font-sans text-[13px] tracking-normal text-faint">
            / month potential
          </span>
        </p>
        <p className="t-meta mt-2">Not a guaranteed saving.</p>
      </section>

      {rows.length > 0 ? (
        <section className="mt-8 border-t border-line pt-6">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between text-left"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            <span className="t-eyebrow text-copper">
              {open ? "Hide supporting transactions" : "Show supporting transactions"}
            </span>
            <span className="t-meta">{rows.length}</span>
          </button>
          {open ? (
            <ul className="mt-2">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="sheet-row border-t border-line py-3"
                >
                  <span className="sheet-date t-meta">{row.date}</span>
                  <span className="truncate text-[14px]">{row.merchant}</span>
                  <span className="font-mono text-[13px] tabular">
                    {money(row.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className="mt-8 border-t border-line pt-6">
        <p className="t-eyebrow">What changes if you change this?</p>
        <p className="mt-3 text-[14px] text-soft">
          Current {money(scenario.currentMonthly)} / month
        </p>
        <p className="mt-4 text-[13px] text-soft">
          Scenario: reduce by {scenario.percent}%
        </p>
        <div className="range-wrap mt-1">
          <input
            type="range"
            min={0}
            max={SCENARIO_PERCENTS.length - 1}
            step={1}
            value={step}
            aria-label="Reduce this leak by percent"
            onChange={(event) => setStep(Number(event.target.value))}
          />
        </div>
        <p className="t-meta">
          {SCENARIO_PERCENTS.map((value) => `${value}%`).join("   ")}
        </p>
        <dl className="mt-6 space-y-3">
          <EvidenceRow
            label="New estimated spending"
            value={
              <AnimatedMoney value={scenario.nextMonthly} />
            }
          />
          <EvidenceRow
            label="Potential savings"
            value={<AnimatedMoney value={scenario.potentialMonthly} />}
          />
          <EvidenceRow
            label="Annualized"
            value={<AnimatedMoney value={scenario.potentialYearly} />}
          />
        </dl>
        <p className="t-meta mt-4">
          Illustrative only. Yearly is monthly × 12.
        </p>
      </section>
    </div>
  );
}

function EvidenceRow({
  label,
  value,
}: {
  label: string;
  value: string | number | ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[13px] text-soft">{label}</dt>
      <dd className="font-mono text-[13px] tabular">{value}</dd>
    </div>
  );
}
