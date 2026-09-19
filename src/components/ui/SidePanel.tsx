import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { spring } from "../../lib/motion";

export function SidePanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  widthClass = "max-w-[440px]",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  widthClass?: string;
}) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div
          className={cn(
            "fixed inset-0 z-50 flex",
            mobile ? "items-end justify-center" : "justify-end",
          )}
        >
          <motion.button
            type="button"
            aria-label="Close panel"
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={mobile ? { y: "100%" } : { x: "100%" }}
            animate={mobile ? { y: 0 } : { x: 0 }}
            exit={mobile ? { y: "100%" } : { x: "100%" }}
            transition={spring}
            className={cn(
              "relative flex w-full flex-col border-line bg-canvas-2",
              mobile
                ? "max-h-[88dvh] border-t"
                : cn("h-full border-l", widthClass),
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div className="min-w-0">
                {title ? (
                  <h2 className="text-[16px] font-medium tracking-[-0.02em] text-fg">
                    {title}
                  </h2>
                ) : null}
                {subtitle ? (
                  <p className="mt-1 text-[13px] text-soft">{subtitle}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 shrink-0 items-center justify-center text-soft hover:text-fg"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
