import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedMoney } from "./AnimatedMoney";
import { money } from "../lib/format";
import type { WhatIfControl } from "../types/analysis";

export function SavingsCard({
  controls,
}: {
  controls: WhatIfControl[];
}) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(controls.map((control) => [control.id, control.defaultValue])),
  );

  const saved = useMemo(
    () =>
      controls.reduce(
        (sum, control) =>
          sum + (control.maxMonthly * (values[control.id] ?? 0)) / 100,
        0,
      ),
    [controls, values],
  );

  const points = [1, 2, 3, 4, 5, 6].map((month) => ({
    month,
    amount: saved * month,
  }));
  const max = Math.max(saved * 6, 1);

  return (
    <section id="what-if" className="scroll-mt-20">
      <p className="t-eyebrow text-copper">What if?</p>
      <h2 className="t-section mt-3">Potential savings.</h2>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="border-t border-line pt-5">
          <p className="t-eyebrow">Monthly</p>
          <p className="t-metric mt-3 text-[40px] text-moss md:text-[48px]">
            <AnimatedMoney value={saved} />
          </p>
        </div>
        <div className="border-t border-line pt-5">
          <p className="t-eyebrow">Yearly</p>
          <p className="t-metric mt-3 text-[40px] md:text-[48px]">
            <AnimatedMoney value={saved * 12} />
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-8">
        {controls.map((control) => {
          const pct = values[control.id] ?? 0;
          const current = control.maxMonthly;
          const target = current - (current * pct) / 100;
          const cut = current - target;
          return (
            <div key={control.id} className="border-t border-line pt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-[15px] tracking-[-0.015em]">{control.label}</p>
                <p className="t-meta">{control.hint}</p>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <p className="text-[13px] text-soft">
                  Current{" "}
                  <span className="font-mono text-fg tabular">{money(current)}</span>
                </p>
                <p className="text-[13px] text-soft">
                  Target{" "}
                  <span className="font-mono text-fg tabular">{money(target)}</span>
                </p>
              </div>
              <div className="range-wrap mt-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={pct}
                  aria-label={control.label}
                  onChange={(event) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      [control.id]: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <p className="t-meta">{money(cut)} recovered</p>
            </div>
          );
        })}
      </div>

      <div className="mt-12">
        <p className="t-eyebrow">Six-month trajectory</p>
        <svg
          viewBox="0 0 360 120"
          className="mt-5 h-[140px] w-full overflow-visible"
          role="img"
          aria-label="Savings accumulating over six months"
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
