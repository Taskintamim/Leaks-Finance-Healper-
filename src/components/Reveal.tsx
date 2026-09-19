import { useReducedMotion, motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeItem } from "../lib/motion";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={fadeItem.initial}
      whileInView={fadeItem.animate}
      viewport={{ once: true, amount: 0.24, margin: "0px 0px -40px 0px" }}
      transition={{ ...fadeItem.transition, delay }}
    >
      {children}
    </motion.div>
  );
}
