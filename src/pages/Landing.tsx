import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { SpendingSheet } from "../components/SpendingSheet";
import { Reveal } from "../components/Reveal";
import { useSession } from "../lib/session";

const finds = [
  ["Unused subscriptions", "Billed, never opened."],
  ["Overlapping tools", "Three products doing one job."],
  ["Fee stacks", "Delivery, bank, and convenience tax."],
  ["Idle memberships", "Paid for, barely used."],
];

export function Landing() {
  const { loadSample } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const node = document.getElementById(location.hash.slice(1));
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  function tryExample() {
    loadSample();
    navigate("/analyzing", { state: { demo: true } });
  }

  return (
    <main>
      <section className="mx-auto grid max-w-[1180px] items-end gap-14 px-5 pb-16 pt-12 md:grid-cols-12 md:gap-10 md:px-8 md:pb-24 md:pt-20">
        <div className="md:col-span-6 lg:col-span-6">
          <p className="t-eyebrow text-copper">Personal finance / Observability</p>
          <h1 className="t-display mt-5">Know where your money is moving.</h1>
          <p className="t-body mt-5 max-w-[420px]">
            Turn everyday spending into patterns, opportunities and decisions.
          </p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button to="/input" size="lg" arrow>
              Analyze spending
            </Button>
            <Button variant="ghost" size="lg" onClick={tryExample}>
              Try example
            </Button>
          </div>
        </div>
        <div className="md:col-span-6 lg:col-span-5 lg:col-start-8">
          <SpendingSheet />
        </div>
      </section>

      <section id="how" className="border-t border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="t-eyebrow">Method</p>
            <h2 className="t-section mt-3 max-w-md">Paste a month. Read the pattern.</h2>
          </Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              ["01", "Collect", "CSV or a copied export. Date, merchant, amount."],
              ["02", "Observe", "Recurring charges and quiet fees surface first."],
              ["03", "Decide", "A short list. Freeze, cap, or keep."],
            ].map(([n, title, body], i) => (
              <Reveal key={n} delay={i * 0.06}>
                <p className="font-mono text-[12px] text-copper">{n}</p>
                <h3 className="mt-3 text-[16px] tracking-[-0.02em]">{title}</h3>
                <p className="t-body mt-2 text-[14px]">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="finds" className="border-t border-line">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-20">
          <Reveal className="md:col-span-5">
            <p className="t-eyebrow">What we find</p>
            <h2 className="t-section mt-3">The quiet ones. Not the rent.</h2>
          </Reveal>
          <ul className="md:col-span-7">
            {finds.map(([label, detail], i) => (
              <Reveal key={label}>
                <li className="flex items-baseline justify-between gap-6 border-t border-line py-4 first:border-t-0 first:pt-0">
                  <div>
                    <p className="text-[15px] tracking-[-0.015em]">{label}</p>
                    <p className="mt-1 text-[13px] text-soft">{detail}</p>
                  </div>
                  <span className="t-meta">0{i + 1}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="simulator" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-16 md:grid-cols-12 md:px-8 md:py-20">
          <Reveal className="md:col-span-6">
            <p className="t-eyebrow">Simulator</p>
            <h2 className="t-section mt-3">Move a number. Watch the year change.</h2>
            <p className="t-body mt-4 max-w-md">
              After analysis, sliders stay local. No new API calls — just the month, the target, and the six-month line.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="md:col-span-5 md:col-start-8">
            <p className="t-eyebrow">Example</p>
            <p className="mt-4 text-[15px]">Food delivery</p>
            <p className="t-meta mt-2">Current ৳1,200 · Target ৳700</p>
            <p className="mt-6 font-mono text-[28px] tracking-[-0.04em] text-moss tabular">
              ৳6,000 / year
            </p>
            <div className="mt-6">
              <Button to="/input" variant="secondary" arrow>
                Analyze spending
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-8 md:px-8">
          <p className="t-meta">LEAKS · Know where your money is moving.</p>
        </div>
      </footer>
    </main>
  );
}
