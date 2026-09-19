import { motion } from "framer-motion";
import { money } from "../lib/format";
import { useSession } from "../lib/session";
import type { ActionItem } from "../types/analysis";

export function ActionPlan({
  items,
  highlightId,
}: {
  items: ActionItem[];
  highlightId?: string | null;
}) {
  const { doneActions, toggleAction } = useSession();
  const actions = items.slice(0, 3);

  return (
    <section id="plan" className="scroll-mt-20">
      <p className="t-eyebrow">Action plan</p>
      <h2 className="t-section mt-3">
        {actions.length > 0 ? "Your money reset." : "No clear moves yet."}
      </h2>
      {actions.length === 0 ? (
        <p className="mt-6 text-[14px] text-soft">Nothing significant stood out.</p>
      ) : (
        <ol className="mt-10">
          {actions.map((item, index) => {
            const done = doneActions.includes(item.id);
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`border-t border-line py-6 ${
                  highlightId === item.leakId ? "bg-copper-dim/20" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-mono text-[12px] text-copper">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleAction(item.id)}
                    className="min-h-11 shrink-0 font-mono text-[11px] tracking-[0.12em] text-soft uppercase"
                    aria-pressed={done}
                  >
                    {done ? "Done" : "Mark done"}
                  </button>
                </div>
                <p
                  className={`mt-2 text-[20px] tracking-[-0.025em] uppercase md:text-[24px] ${
                    done ? "text-faint line-through" : ""
                  }`}
                >
                  {item.title}
                </p>
                <p className="mt-2 max-w-xl text-[14px] leading-6 text-soft">{item.detail}</p>
                <p className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-2 t-meta">
                  <span className="font-mono text-moss">{money(item.monthly)} / mo</span>
                  <span>{item.priority}</span>
                  <span>{item.effort}</span>
                </p>
              </motion.li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
