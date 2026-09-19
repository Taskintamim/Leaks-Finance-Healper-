import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money } from "../lib/format";
import type { Category } from "../types/analysis";
import { Reveal } from "./Reveal";

export function CategoryChart({ categories }: { categories: Category[] }) {
  const [compact, setCompact] = useState(false);
  const data = categories.map((cat) => ({
    name: cat.name,
    amount: Math.round(cat.amount),
    share: cat.share,
    leak: cat.leak,
  }));

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <Reveal>
      <section>
        <p className="t-eyebrow">Categories</p>
        <h2 className="t-section mt-3">Where it went.</h2>
        {data.length === 0 ? (
          <p className="mt-6 text-[14px] text-soft">No category split.</p>
        ) : compact ? (
          <ul className="mt-8 border-t border-line">
            {data.map((cat) => (
              <li key={cat.name} className="border-b border-line py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[14px]">
                    {cat.name}
                    {cat.leak ? (
                      <span className="ml-2 font-mono text-[11px] text-copper">LEAK</span>
                    ) : null}
                  </p>
                  <p className="font-mono text-[13px] tabular">{money(cat.amount)}</p>
                </div>
                <div className="mt-3 h-px bg-line">
                  <div
                    className="h-px bg-copper"
                    style={{ width: `${Math.max(4, cat.share * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 h-[240px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={(value: number) => money(value)}
                  tick={{ fill: "#7a7670", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fill: "#a8a49c", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(201, 162, 122, 0.08)" }}
                  contentStyle={{
                    background: "#131314",
                    border: "1px solid #262628",
                    color: "#f3efe6",
                    fontSize: 13,
                  }}
                  formatter={(value) => [money(Number(value ?? 0)), "Spend"]}
                />
                <Bar dataKey="amount" fill="#c9a27a" maxBarSize={12} radius={[0, 1, 1, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </Reveal>
  );
}
