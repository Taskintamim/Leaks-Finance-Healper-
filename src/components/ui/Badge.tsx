import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Tone = "neutral" | "copper" | "rust" | "moss" | "faint";

const tones: Record<Tone, string> = {
  neutral: "bg-panel-2 text-soft border-line",
  copper: "bg-copper-dim text-copper border-copper/15",
  rust: "bg-rust-dim text-rust border-rust/15",
  moss: "bg-moss-dim text-moss border-moss/15",
  faint: "bg-transparent text-faint border-line",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[11px] font-medium tracking-[0.04em] uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
