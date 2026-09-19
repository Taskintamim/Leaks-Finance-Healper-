import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { money } from "../lib/format";

export function AnimatedMoney({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const fromRef = useRef(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduce) {
      fromRef.current = value;
      setShown(value);
      return;
    }

    const from = fromRef.current;
    const start = performance.now();
    const duration = Math.min(720, 280 + Math.abs(value - from) / 8);
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setShown(from + (value - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    fromRef.current = value;
    return () => cancelAnimationFrame(frame);
  }, [value, reduce]);

  return <span className={className}>{money(shown)}</span>;
}
