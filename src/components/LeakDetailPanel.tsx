import { Button } from "./Button";
import { SidePanel } from "./ui/SidePanel";
import { ForensicReport } from "./ForensicReport";
import { money } from "../lib/format";
import type { Leak } from "../types/analysis";
import type { ForensicReport as ForensicReportModel, LedgerTransaction } from "../types/forensics";

export function LeakDetailPanel({
  leak,
  report,
  ledger,
  onClose,
  onAdd,
}: {
  leak: Leak | null;
  report?: ForensicReportModel;
  ledger: LedgerTransaction[];
  onClose: () => void;
  onAdd: (leakId: string) => void;
}) {
  const yearly = leak?.yearly ?? 0;

  return (
    <SidePanel
      open={Boolean(leak)}
      onClose={onClose}
      title={leak?.name}
      subtitle={leak ? `${leak.category} · ${leak.severity}` : undefined}
      widthClass="max-w-[480px]"
    >
      {leak ? (
        <div className="px-5 py-6">
          <p className="font-mono text-[32px] tracking-[-0.04em] tabular">
            {money(leak.monthly)}
            <span className="ml-2 font-sans text-[13px] tracking-normal text-faint">
              / month
            </span>
          </p>
          <p className="t-meta mt-2">
            {leak.cadence}
            {leak.lastCharge ? ` · last ${leak.lastCharge}` : ""}
            {` · yearly potential ${money(yearly)}`}
          </p>

          <div className="mt-8">
            <ForensicReport leak={leak} report={report} ledger={ledger} />
          </div>

          <section className="mt-8 border-t border-line pt-6">
            <h3 className="t-eyebrow">Suggested action</h3>
            <p className="mt-3 text-[14px] leading-6 text-soft">
              {leak.recommendation}
            </p>
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={() => {
                onAdd(leak.id);
                onClose();
              }}
            >
              Add to action plan
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </SidePanel>
  );
}
