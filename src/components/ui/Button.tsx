import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { springFast } from "../../lib/motion";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-canvas hover:bg-copper disabled:bg-fg/40",
  secondary: "bg-transparent text-fg border border-line-2 hover:border-fg/40 disabled:text-faint",
  ghost: "bg-transparent text-soft hover:text-fg",
  danger: "text-rust border border-rust/25 hover:bg-rust-dim",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-3 text-[13px]",
  md: "min-h-11 px-4 text-[14px]",
  lg: "min-h-12 px-5 text-[14px]",
};

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-[0.02em] uppercase disabled:cursor-not-allowed";

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  arrow?: boolean;
};

type ButtonProps = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    to?: undefined;
  };

type LinkButtonProps = Common & {
  to: string;
};

export function Button(props: ButtonProps | LinkButtonProps) {
  const { variant = "primary", size = "md", className, children, arrow } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  const inner = (
    <>
      <span>{children}</span>
      {arrow ? (
        <motion.span
          aria-hidden
          variants={{ rest: { x: 0 }, hover: { x: 5 } }}
          className="inline-block"
        >
          →
        </motion.span>
      ) : null}
    </>
  );

  if ("to" in props && props.to) {
    return (
      <motion.div
        className="inline-flex"
        initial="rest"
        whileHover="hover"
        whileTap={{ scale: 0.97 }}
        transition={springFast}
      >
        <Link to={props.to} className={classes}>
          {inner}
        </Link>
      </motion.div>
    );
  }

  const buttonProps = props as ButtonProps;
  return (
    <motion.button
      type={buttonProps.type ?? "button"}
      className={classes}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      transition={springFast}
      onClick={buttonProps.onClick}
      disabled={buttonProps.disabled}
      aria-label={buttonProps["aria-label"]}
    >
      {inner}
    </motion.button>
  );
}
