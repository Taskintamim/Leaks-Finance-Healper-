import { useState } from "react";
import { motion } from "framer-motion";
import { money } from "../lib/format";
import { springFast } from "../lib/motion";
import type { Leak } from "../types/analysis";

export function LeakCard({
  leak,
  onClick,
  featured: _featured = false,
  index = 0,
}: {
  leak: Leak;
  onClick: (leak: Leak) => void;
  featured?: boolean;
  index?: number;
}) {
  const [hover, setHover] = useState(false);

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 6 }}
      whileTap={{ scale: 0.995 }}
      transition={{ ...springFast, delay: index * 0.06 }}
      onClick={() => onClick(leak)}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className="group flex w-full min-h-11 flex-col border-t border-line py-5 text-left first:border-t-0"
    >
      <span className="flex w-full items-baseline justify-between gap-4">
        <span className="flex min-w-0 items-baseline gap-4">
          <span className="font-mono text-[12px] text-copper tabular">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span>
            <span className="block text-[15px] tracking-[-0.02em] md:text-[16px]">
              {leak.name}
            </span>
            <span className="mt-1 block text-[12px] text-faint">
              {leak.category}
              {leak.charges.length > 0
                ? ` · ${leak.charges.length} charge${leak.charges.length === 1 ? "" : "s"}`
                : ""}
            </span>
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-mono text-[15px] tabular md:text-[16px]">
            {money(leak.monthly)}
          </span>
          <span className="mt-1 block font-mono text-[11px] text-moss tabular">
            {money(leak.savings)} save
          </span>
        </span>
      </span>

      <span className="mt-3 block text-[13px] leading-6 text-soft md:hidden">
        {leak.reason}
      </span>

      <motion.span
        initial={false}
        animate={{ height: hover ? "auto" : 0, opacity: hover ? 1 : 0 }}
        className="hidden overflow-hidden md:block"
      >
        <span className="mt-3 flex items-end justify-between gap-4">
          <span className="max-w-xl text-[13px] leading-6 text-soft">{leak.reason}</span>
          <span className="shrink-0 font-mono text-[11px] tracking-[0.12em] text-copper uppercase">
            Open →
          </span>
        </span>
      </motion.span>

      <span
        className="mt-3 block h-px origin-left scale-x-0 bg-copper/70 transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100"
        aria-hidden
      />
    </motion.button>
  );
}
