import { money } from "../lib/format";
import type { DecisionRow } from "../types/forensics";

export function DecisionStart({
  items,
  onOpen,
}: {
  items: DecisionRow[];
  onOpen?: (leakId: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section id="start-here" className="scroll-mt-20">
      <p className="t-eyebrow">Where should I start?</p>
      <h2 className="t-section mt-3">Compare the openings.</h2>
      <p className="t-body mt-4 max-w-xl">
        Ranked by potential monthly difference. Effort comes from the action already on the report.
      </p>
      <ol className="mt-10">
        {items.map((item) => (
          <li key={item.leakId} className="border-t border-line py-6">
            <button
              type="button"
              onClick={() => onOpen?.(item.leakId)}
              className="flex min-h-11 w-full flex-col items-start text-left"
            >
              <p className="text-[15px] tracking-[-0.015em] uppercase">{item.title}</p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <span className="font-mono text-[14px] text-moss tabular">
                  {money(item.potentialMonthly)} / month potential
                </span>
                <span className="t-meta">Effort {item.effort}</span>
              </p>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
