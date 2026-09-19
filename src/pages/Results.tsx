import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { LeakCard } from "../components/LeakCard";
import { CategoryChart } from "../components/CategoryChart";
import { RecurringExpense } from "../components/RecurringExpense";
import { SavingsCard } from "../components/SavingsCard";
import { ActionPlan } from "../components/ActionPlan";
import { LeakDetailPanel } from "../components/LeakDetailPanel";
import { ScenarioCompare } from "../components/ScenarioCompare";
import { DecisionStart } from "../components/DecisionStart";
import { HowLeaksWorks } from "../components/HowLeaksWorks";
import { MoneyFlow } from "../components/MoneyFlow";
import { AnimatedMoney } from "../components/AnimatedMoney";
import { Reveal } from "../components/Reveal";
import { EmptyState } from "../components/ui/EmptyState";
import { money } from "../lib/format";
import { buildForensics } from "../lib/forensics";
import { useSession } from "../lib/session";
import type { Leak } from "../types/analysis";

export function Results() {
  const { analysis, transactions } = useSession();
  const [selected, setSelected] = useState<Leak | null>(null);
  const [focusLeak, setFocusLeak] = useState<string | null>(null);
  const [act, setAct] = useState(0);
  const location = useLocation();
  const topLeaks = analysis.leaks.slice(0, 3);
  const planItems = analysis.actionPlan.slice(0, 3);
  const expenseCount = analysis.expenseCount;
  const incomeCount = analysis.incomeCount;
  const forensics = useMemo(
    () => buildForensics(transactions, analysis),
    [transactions, analysis],
  );
  const selectedReport = selected
    ? forensics.reports.find((report) => report.leakId === selected.id)
    : undefined;
  const maxSpend = Math.max(...analysis.spendSeries.map((point) => point.amount), 1);

  useEffect(() => {
    const timers = [0, 1, 2, 3].map((n) =>
      window.setTimeout(() => setAct(n), n * 260),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const node = document.getElementById(id);
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  function addToPlan(leakId: string) {
    setFocusLeak(leakId);
    document.getElementById("plan")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="mx-auto max-w-[1180px] overflow-x-hidden px-5 py-10 md:px-8 md:py-14">
      <p className="t-eyebrow text-copper">
        Report · {analysis.periodLabel}
      </p>
      <h1 className="t-section mt-3 max-w-2xl">{analysis.headline}</h1>
      <p className="t-body mt-4 max-w-xl">{analysis.summary}</p>
      <p className="t-meta mt-4">
        Health {analysis.health.label} · {analysis.health.score}
      </p>

      <section className="mt-10 border-t border-line pt-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: act >= 0 ? 1 : 0 }}
        >
          <p className="t-eyebrow">Your money moved</p>
          <p className="t-metric mt-4">
            <AnimatedMoney value={analysis.totalSpending} />
          </p>
        </motion.div>

        <motion.p
          className="t-meta mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: act >= 1 ? 1 : 0 }}
        >
          {expenseCount} expense{expenseCount === 1 ? "" : "s"}
          {incomeCount > 0
            ? ` · ${incomeCount} income · net ${money(analysis.netCash)}`
            : ""}
        </motion.p>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 8 }}
          animate={act >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        >
          <p className="t-eyebrow text-moss">Potential opportunity</p>
          <p className="t-metric mt-3 text-[40px] text-moss md:text-[56px]">
            <AnimatedMoney value={analysis.potentialMonthlySavings} />
            <span className="ml-2 align-middle font-sans text-[14px] tracking-normal text-faint">
              / month
            </span>
          </p>
        </motion.div>
      </section>

      {analysis.spendSeries.length > 0 ? (
        <Reveal className="mt-12">
          <p className="t-eyebrow">Period</p>
          <ul className="mt-5 border-t border-line">
            {analysis.spendSeries.map((point) => (
              <li key={point.month} className="border-b border-line py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[14px]">{point.month}</p>
                  <p className="font-mono text-[13px] tabular">{money(point.amount)}</p>
                </div>
                <div className="mt-3 h-px bg-line">
                  <div
                    className="h-px bg-fg/70"
                    style={{ width: `${(point.amount / maxSpend) * 100}%` }}
                  />
                </div>
                <p className="t-meta mt-2">{money(point.leaks)} in leaks</p>
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      <motion.section
        id="insights"
        className="mt-16 scroll-mt-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.72, duration: 0.35 }}
      >
        <p className="t-eyebrow">What stood out</p>
        <h2 className="t-section mt-3">Worth reviewing.</h2>
        {topLeaks.length === 0 ? (
          <EmptyState
            className="mt-8"
            title="Nothing significant stood out."
            description="This month looks clean. Run another period if you want a second pass."
            action={
              <Button to="/input" variant="secondary" size="sm">
                New analysis
              </Button>
            }
          />
        ) : (
          <div className="mt-8 border-t border-line">
            {topLeaks.map((leak, index) => (
              <LeakCard
                key={leak.id}
                leak={leak}
                featured={index === 0}
                index={index}
                onClick={setSelected}
              />
            ))}
          </div>
        )}
      </motion.section>

      <Reveal className="mt-16 border-t border-line pt-10">
        <MoneyFlow />
      </Reveal>

      <section id="question" className="mt-20 max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          className="t-eyebrow text-copper"
        >
          The question
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="mt-3 text-[clamp(32px,7vw,52px)] leading-[1.05] font-medium tracking-[-0.035em]"
        >
          Nobody asked
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          className="mt-6 h-px origin-left bg-copper"
        />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.16 }}
          className="mt-8 max-w-2xl text-[clamp(20px,4vw,28px)] leading-snug tracking-[-0.025em]"
        >
          “{analysis.unaskedQuestion.body}”
        </motion.p>
        <p className="t-meta mt-6">
          Hidden leaks {money(analysis.hiddenLeakAmount)} / month
          {analysis.hiddenLeakCount
            ? ` · ${analysis.hiddenLeakCount} quiet items`
            : ""}
        </p>
        <p className="t-body mt-3 max-w-xl text-[14px]">{analysis.health.summary}</p>
      </section>

      <div className="mt-20">
        <CategoryChart categories={analysis.categories} />
      </div>

      <div className="mt-16">
        <RecurringExpense items={analysis.recurring} />
      </div>

      <div className="mt-20">
        <SavingsCard
          key={analysis.leaks.map((leak) => `${leak.id}:${leak.monthly}`).join("|")}
          controls={analysis.whatIf}
        />
      </div>

      <div className="mt-20">
        <ScenarioCompare scenarios={forensics.scenarios} />
      </div>

      <div className="mt-20">
        <DecisionStart
          items={[...forensics.decisions].sort(
            (a, b) => b.potentialMonthly - a.potentialMonthly,
          )}
          onOpen={(leakId) => {
            const leak = analysis.leaks.find((item) => item.id === leakId);
            if (leak) setSelected(leak);
          }}
        />
      </div>

      <div className="mt-20">
        <ActionPlan items={planItems} highlightId={focusLeak} />
      </div>

      <div className="mt-16">
        <HowLeaksWorks />
      </div>

      <div className="mt-16 flex min-h-11 flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
        <p className="text-[13px] text-soft">Your money reset.</p>
        <Button to="/input" variant="secondary" size="sm">
          New analysis
        </Button>
      </div>

      <LeakDetailPanel
        leak={selected}
        report={selectedReport}
        ledger={forensics.ledger}
        onClose={() => setSelected(null)}
        onAdd={addToPlan}
      />
    </main>
  );
}
