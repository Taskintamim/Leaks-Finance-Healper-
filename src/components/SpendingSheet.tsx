import { useEffect, useState, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { money } from "../lib/format";
import { springSoft } from "../lib/motion";

const rows = [
  { merchant: "Foodpanda", amount: 350, category: "FOOD" },
  { merchant: "Uber", amount: 420, category: "TRANSPORT" },
  { merchant: "Netflix", amount: 650, category: "SUBSCRIPTIONS" },
  { merchant: "Daraz", amount: 1200, category: "SHOPPING" },
];

type Phase = "tx" | "cat" | "pattern";

export function SpendingSheet() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("tx");
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduce) return;
    const order: Phase[] = ["tx", "cat", "pattern"];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % order.length;
      setPhase(order[i]);
    }, 2800);
    return () => window.clearInterval(id);
  }, [reduce]);

  function onPointer(event: PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 4;
    setOffset({ x, y });
  }

  return (
    <div
      className="relative"
      onPointerMove={onPointer}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
    >
      <motion.div
        style={{ x: offset.x, y: offset.y }}
        transition={springSoft}
        className="will-change-transform"
      >
        <p className="t-eyebrow">Spending sheet</p>
        <div className="mt-5 border-t border-line">
          <AnimatePresence mode="wait">
            {phase === "pattern" ? (
              <motion.div
                key="pattern"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className="py-10"
              >
                <p className="t-eyebrow text-copper">Pattern found</p>
                <p className="mt-3 max-w-xs text-[22px] leading-snug tracking-[-0.03em]">
                  Quiet charges repeating while groceries stay honest.
                </p>
              </motion.div>
            ) : (
              <motion.ul
                key={phase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="divide-y divide-line"
              >
                {rows.map((row, index) => (
                  <motion.li
                    key={row.merchant}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.35 }}
                    className="sheet-row py-3.5"
                  >
                    <span className="sheet-date t-meta">09 / 0{index + 1}</span>
                    <span className="truncate text-[14px]">
                      {phase === "cat" ? row.category : row.merchant}
                    </span>
                    <span className="font-mono text-[13px] tabular">
                      {money(row.amount)}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
