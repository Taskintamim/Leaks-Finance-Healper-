import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedMoney } from "./AnimatedMoney";
import { money } from "../lib/format";
import { calculateCumulative } from "../lib/forensics";
import type { PortfolioScenario, PortfolioScenarioId } from "../types/forensics";

export function ScenarioCompare({ scenarios }: { scenarios: PortfolioScenario[] }) {
  const [active, setActive] = useState<PortfolioScenarioId>("moderate");
  const selected = scenarios.find((item) => item.id === active) ?? scenarios[1];
  const points = useMemo(
    () => calculateCumulative(selected?.monthlyDifference ?? 0),
    [selected?.monthlyDifference],
  );
  const max = Math.max(...points.map((point) => point.amount), 1);

  if (scenarios.length === 0) return null;

  return (
    <section id="scenarios" className="scroll-mt-20">
      <p className="t-eyebrow">Illustrative scenarios</p>
      <h2 className="t-section mt-3">What changes if you change this?</h2>
      <p className="t-body mt-4 max-w-xl">
        Illustrative scenarios based on your observed spending. Not a forecast.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {scenarios.map((item) => {
          const on = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={`min-h-11 border-t pt-5 text-left ${
                on ? "border-copper" : "border-line"
              }`}
            >
              <p className="t-eyebrow">{item.label}</p>
              <p className="t-metric mt-3 text-[32px] md:text-[36px]">
                <AnimatedMoney value={item.spend} />
              </p>
              <p className="t-meta mt-2">/ month</p>
              {item.monthlyDifference > 0 ? (
                <p className="mt-3 font-mono text-[13px] text-moss tabular">
                  {money(item.monthlyDifference)} potential monthly difference
                </p>
              ) : (
                <p className="mt-3 text-[13px] text-soft">No changes.</p>
              )}
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="border-t border-line pt-5">
            <p className="t-eyebrow">Potential monthly difference</p>
            <p className="mt-3 font-mono text-[28px] tracking-[-0.04em] text-moss tabular">
              <AnimatedMoney value={selected.monthlyDifference} />
            </p>
          </div>
          <div className="border-t border-line pt-5">
            <p className="t-eyebrow">Potential yearly difference</p>
            <p className="mt-3 font-mono text-[28px] tracking-[-0.04em] tabular">
              <AnimatedMoney value={selected.yearlyDifference} />
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-12">
        <p className="t-eyebrow">Cumulative potential</p>
        <p className="t-meta mt-2">
          Arithmetic on the selected scenario. Not investment growth.
        </p>
        <svg
          viewBox="0 0 360 120"
          className="mt-5 h-[140px] w-full overflow-visible"
          role="img"
          aria-label="Cumulative potential over six months"
        >
          <Trajectory points={points} max={max} />
        </svg>
        <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {points.map((point) => (
            <li key={point.month} className="t-meta">
              0{point.month} · {money(point.amount)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Trajectory({
  points,
  max,
}: {
  points: { month: number; amount: number }[];
  max: number;
}) {
  const coords = points.map((point, index) => {
    const x = 12 + (index * 336) / Math.max(points.length - 1, 1);
    const y = 108 - (point.amount / max) * 88;
    return { x, y };
  });
  const d = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <>
      <motion.path
        d={d}
        fill="none"
        stroke="#7f9d7c"
        strokeWidth="1.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {coords.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r="2.2" fill="#c9a27a" />
      ))}
    </>
  );
}
