import { motion, useReducedMotion } from "framer-motion";

const stages = ["Transactions", "Categories", "Patterns", "Opportunities"];

export function MoneyFlow() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden>
      <p className="t-eyebrow">How the ledger resolves</p>
      <div className="mt-6 flex flex-col md:flex-row md:items-center">
        {stages.map((label, index) => (
          <div key={label} className="flex flex-1 md:items-center">
            <div className="min-w-0 py-3 md:py-0">
              <p className="font-mono text-[11px] tracking-[0.14em] text-copper uppercase">
                0{index + 1}
              </p>
              <p className="mt-1 text-[14px] tracking-[-0.015em]">{label}</p>
            </div>
            {index < stages.length - 1 ? (
              <>
                <div className="relative mx-4 hidden h-px flex-1 bg-line md:block">
                  {!reduce ? (
                    <motion.span
                      className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-copper"
                      animate={{ left: ["0%", "100%"] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "linear",
                        delay: index * 0.28,
                      }}
                    />
                  ) : null}
                </div>
                <div className="relative ml-3 h-8 w-px bg-line md:hidden">
                  {!reduce ? (
                    <motion.span
                      className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-copper"
                      animate={{ top: ["0%", "100%"] }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "linear",
                        delay: index * 0.2,
                      }}
                    />
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
