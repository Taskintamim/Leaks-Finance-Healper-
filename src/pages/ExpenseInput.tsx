import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Modal } from "../components/ui/Modal";
import { parseTransactions, previewLines } from "../lib/parseTransactions";
import { money } from "../lib/format";
import { useSession } from "../lib/session";

export function ExpenseInput() {
  const { rawInput, setRawInput, loadSample, setTransactions } = useSession();
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [help, setHelp] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const preview = useMemo(() => previewLines(rawInput), [rawInput]);
  const valid = preview.filter((line) => line.ok && line.row);
  const expenseRows = valid.filter((line) => line.row?.direction !== "income");
  const incomeRows = valid.filter((line) => line.row?.direction === "income");
  const expenseTotal = expenseRows.reduce((sum, line) => sum + (line.row?.amount ?? 0), 0);
  const incomeTotal = incomeRows.reduce((sum, line) => sum + (line.row?.amount ?? 0), 0);
  const invalid = preview.some((line) => !line.ok);

  function analyze() {
    if (!rawInput.trim()) {
      setError("Please add at least one transaction.");
      return;
    }
    const rows = parseTransactions(rawInput);
    if (rows.length === 0) {
      setError("We couldn't find enough information to identify meaningful patterns.");
      return;
    }
    setError("");
    setTransactions(rows);
    navigate("/analyzing");
  }

  function tryExample() {
    loadSample();
    navigate("/analyzing", { state: { demo: true } });
  }

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setRawInput(String(reader.result ?? ""));
      setError("");
    };
    reader.readAsText(file);
  }

  return (
    <main className="mx-auto max-w-[860px] px-5 py-10 md:px-8 md:py-14">
      <p className="t-eyebrow text-copper">New analysis</p>
      <h1 className="t-section mt-3">Paste transactions</h1>
      <p className="t-body mt-3 max-w-lg">
        Date, merchant, amount. The sheet updates as you type.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <label htmlFor="ledger" className="t-eyebrow">
            Ledger
          </label>
          <textarea
            id="ledger"
            rows={12}
            value={rawInput}
            placeholder={"date,merchant,amount\n2026-09-01,Foodpanda,350"}
            onChange={(event) => {
              setRawInput(event.target.value);
              if (error) setError("");
            }}
            className="mt-3 min-h-[240px] w-full resize-y border border-line bg-transparent px-0 py-3 font-mono text-[13px] leading-7 text-fg placeholder:text-faint focus:border-copper/40 focus:outline-none"
          />
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDrag(false);
              const file = event.dataTransfer.files[0];
              if (file) readFile(file);
            }}
            className={`mt-3 flex min-h-11 items-center justify-between gap-3 border-t py-3 text-[13px] ${
              drag ? "border-copper text-copper" : "border-line text-soft"
            }`}
          >
            <p>
              Drop a CSV, or{" "}
              <button
                type="button"
                className="text-copper"
                onClick={() => fileRef.current?.click()}
              >
                choose a file
              </button>
            </p>
            <button
              type="button"
              onClick={() => setHelp(true)}
              className="text-faint underline decoration-line-2 underline-offset-4"
            >
              Format
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) readFile(file);
              }}
            />
          </div>
          {error ? <p className="mt-3 text-[13px] text-rust">{error}</p> : null}
          {invalid && !error ? (
            <p className="mt-3 text-[13px] text-faint">
              Some lines need a date, merchant, and amount.
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <p className="t-eyebrow">Sheet</p>
            <p className="t-meta">
              {valid.length} tx · {money(expenseTotal)}
              {incomeRows.length > 0 ? ` · income ${money(incomeTotal)}` : ""}
            </p>
          </div>
          <div className="mt-3 border-t border-line">
            {valid.length === 0 ? (
              <p className="py-8 text-[14px] text-faint">Nothing parsed yet.</p>
            ) : (
              <ul>
                <AnimatePresence initial={false}>
                  {valid.slice(0, 12).map((line) => (
                    <motion.li
                      key={line.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="sheet-row border-b border-line py-3"
                    >
                      <span className="sheet-date t-meta">{line.row?.date}</span>
                      <span className="truncate text-[14px]">{line.row?.merchant}</span>
                      <span className="font-mono text-[13px] tabular">
                        {money(line.row?.amount ?? 0)}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Button size="lg" arrow onClick={analyze}>
          Analyze
        </Button>
        <Button variant="ghost" size="lg" onClick={tryExample}>
          Try example
        </Button>
      </div>

      <Modal open={help} onClose={() => setHelp(false)} title="CSV format">
        <p className="text-[14px] leading-6 text-soft">
          One row per charge. Amounts are in BDT.
        </p>
        <pre className="mt-4 overflow-x-auto border border-line px-3 py-3 font-mono text-[12px] leading-5">
          {`date,merchant,amount
2026-09-01,Foodpanda,350
2026-09-02,Uber,420
2026-09-03,Netflix,650`}
        </pre>
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={() => setHelp(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </main>
  );
}
