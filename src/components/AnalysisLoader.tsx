import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { useSession } from "../lib/session";
import { friendlyError } from "../lib/errors";

const steps = [
  "Parsing transactions",
  "Normalizing merchants",
  "Detecting patterns",
  "Building opportunity model",
  "Preparing report",
];

const groups = [
  { items: ["Foodpanda", "Pathao Food", "Restaurant"], label: "FOOD" },
  { items: ["Netflix", "Spotify", "Google One"], label: "RECURRING" },
];

export function AnalysisLoader() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [group, setGroup] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { runAnalysis, loadSample, transactions, rawInput } = useSession();
  const demo = Boolean((location.state as { demo?: boolean } | null)?.demo);

  useEffect(() => {
    if (!demo && transactions.length === 0 && !rawInput.trim()) {
      navigate("/input", { replace: true });
      return;
    }

    let cancelled = false;
    if (demo) loadSample();

    const timers = steps.map((_, index) =>
      window.setTimeout(() => {
        if (!cancelled) setStep(index);
      }, index * 700),
    );
    const groupTimer = window.setTimeout(() => {
      if (!cancelled) setGroup(1);
    }, 1600);
    const groupTimer2 = window.setTimeout(() => {
      if (!cancelled) setGroup(2);
    }, 2400);

    const started = Date.now();

    void runAnalysis()
      .then(async () => {
        if (cancelled) return;
        const wait = Math.max(0, 3400 - (Date.now() - started));
        await new Promise((resolve) => window.setTimeout(resolve, wait));
        if (cancelled) return;
        setStep(5);
        window.setTimeout(() => {
          if (!cancelled) navigate("/results", { replace: true });
        }, 280);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(friendlyError(reason));
      });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      clearTimeout(groupTimer);
      clearTimeout(groupTimer2);
    };
    // Mount-only: this screen is a one-shot sequence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = error ? 1 : Math.min(1, (step + 1) / steps.length);

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-56px)] max-w-[920px] flex-col justify-center px-5 py-14 md:px-8">
      <p className="t-eyebrow text-copper">Analysis / September</p>
      <h1 className="t-section mt-3">
        {error ? "We couldn't finish this report." : "The ledger is being read."}
      </h1>

      <div className="mt-8 h-px overflow-hidden bg-line">
        <motion.div
          className="h-full bg-copper"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      </div>

      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <ol>
          {steps.map((label, index) => {
            const done = step > index;
            const active = !error && step === index;
            return (
              <li
                key={label}
                className="flex min-h-11 items-center gap-3 border-t border-line py-3 first:border-t-0"
              >
                <span className="w-4 font-mono text-[12px] text-copper">
                  {done ? "✓" : active ? "→" : "○"}
                </span>
                <span className={done || active ? "text-[14px]" : "text-[14px] text-faint"}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        <div>
          <p className="t-eyebrow">Grouping</p>
          <div className="mt-4 min-h-[180px]">
            <AnimatePresence mode="wait">
              {group < 2 ? (
                <motion.ul
                  key={group}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-2"
                >
                  {groups[Math.min(group, 1)].items.map((item) => (
                    <li key={item} className="border-b border-line py-2 text-[14px] text-soft">
                      {item}
                    </li>
                  ))}
                </motion.ul>
              ) : (
                <motion.div
                  key="labels"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {groups.map((item) => (
                    <p
                      key={item.label}
                      className="border-b border-line py-3 text-[18px] tracking-[0.14em] text-copper"
                    >
                      {item.label}
                    </p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-10">
          <p className="text-[14px] text-rust">{error}</p>
          <div className="mt-4">
            <Button to="/input" variant="secondary">
              Try again
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
