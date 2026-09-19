import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-[440px] overflow-hidden border border-line bg-canvas-2"
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-[15px] font-medium tracking-[-0.015em]">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center text-soft hover:text-fg"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </header>
            <div className="px-5 py-5">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
