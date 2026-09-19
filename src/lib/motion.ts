export const spring = { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.7 };
export const springFast = { type: "spring" as const, stiffness: 560, damping: 36, mass: 0.55 };
export const springSoft = { type: "spring" as const, stiffness: 260, damping: 32, mass: 0.8 };

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

export const fadeItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
};

export const slideRow = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  transition: springSoft,
};
