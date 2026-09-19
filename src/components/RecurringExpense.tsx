import { money } from "../lib/format";
import type { RecurringItem } from "../types/analysis";
import { Reveal } from "./Reveal";

export function RecurringExpense({ items }: { items: RecurringItem[] }) {
  return (
    <Reveal>
      <section>
        <p className="t-eyebrow">Recurring</p>
        <h2 className="t-section mt-3">What repeats.</h2>
        <div className="mt-8 border-t border-line">
          {items.length === 0 ? (
            <p className="py-6 text-[14px] text-soft">No repeating charges stood out.</p>
          ) : (
            <ul>
              <li className="hidden grid-cols-[1fr_120px_120px_120px] gap-2 py-3 md:grid">
                <p className="t-eyebrow">Merchant</p>
                <p className="t-eyebrow">Frequency</p>
                <p className="t-eyebrow text-right">Amount</p>
                <p className="t-eyebrow text-right">Annual</p>
              </li>
              {items.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-2 gap-2 border-b border-line py-4 md:grid-cols-[1fr_120px_120px_120px]"
                >
                  <p className="col-span-2 text-[14px] md:col-span-1">
                    {item.name}
                    {item.leak ? (
                      <span className="ml-2 font-mono text-[11px] text-copper">LEAK</span>
                    ) : null}
                  </p>
                  <p className="t-meta">{item.frequency ?? "—"}</p>
                  <p className="font-mono text-[13px] tabular md:text-right">
                    {money(item.amount)}
                  </p>
                  <p className="t-meta md:text-right">
                    {item.annual == null ? "—" : money(item.annual)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Reveal>
  );
}
