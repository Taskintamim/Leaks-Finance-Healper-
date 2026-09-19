import { cn } from "../lib/cn";
import { AnimatedMoney } from "./AnimatedMoney";

type Tone = "default" | "copper" | "moss" | "rust";

const tones: Record<Tone, string> = {
  default: "text-fg",
  copper: "text-copper",
  moss: "text-moss",
  rust: "text-rust",
};

export function MetricCard({
  label,
  amount,
  suffix,
  tone = "default",
}: {
  label: string;
  amount: number;
  suffix?: string;
  tone?: Tone;
}) {
  return (
    <div className="bg-panel px-4 py-5 md:px-6 md:py-6">
      <p className="text-[11px] tracking-[0.08em] text-faint uppercase">{label}</p>
      <p
        className={cn(
          "mt-2 font-mono text-[22px] tracking-[-0.03em] tabular md:text-[28px]",
          tones[tone],
        )}
      >
        <AnimatedMoney value={amount} />
        {suffix ? (
          <span className="ml-1 text-[12px] font-sans tracking-normal text-faint">
            {suffix}
          </span>
        ) : null}
      </p>
    </div>
  );
}
