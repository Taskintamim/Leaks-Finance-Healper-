import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border border-line bg-panel", className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <h3 className="text-[15px] font-medium tracking-[-0.015em] text-fg">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-[13px] leading-5 text-soft">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
