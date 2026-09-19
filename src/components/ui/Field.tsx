import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Label({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[13px] font-medium text-soft"
    >
      {children}
    </label>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-line bg-canvas px-3 text-[14px] text-fg placeholder:text-faint transition-colors duration-150",
        "hover:border-line-2 focus:border-copper/50 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full resize-y rounded-md border border-line bg-canvas px-3.5 py-3 text-[14px] leading-6 text-fg placeholder:text-faint transition-colors duration-150",
        "hover:border-line-2 focus:border-copper/50 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
