import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-line pt-8", className)}>
      <p className="text-[18px] tracking-[-0.02em] text-fg">{title}</p>
      <p className="t-body mt-3 max-w-md text-[14px]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} aria-hidden />;
}
