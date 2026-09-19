const steps = [
  ["01", "Normalize transactions"],
  ["02", "Run deterministic financial analysis"],
  ["03", "Detect statistical / pattern signals"],
  ["04", "Use AI to interpret the signals"],
  ["05", "Generate evidence-backed insights"],
  ["06", "Simulate user-controlled scenarios"],
];

export function HowLeaksWorks() {
  return (
    <section className="border-t border-line pt-8">
      <details>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-left">
          <span className="t-eyebrow">How LEAKS works</span>
          <span className="t-meta">Architecture</span>
        </summary>
        <ol className="mt-6">
          {steps.map(([n, label]) => (
            <li
              key={n}
              className="flex items-baseline gap-4 border-t border-line py-3"
            >
              <span className="font-mono text-[12px] text-copper">{n}</span>
              <span className="text-[14px]">{label}</span>
            </li>
          ))}
        </ol>
        <p className="t-meta mt-4">
          Arithmetic stays local. AI is used only to interpret evidence — not to calculate it.
        </p>
      </details>
    </section>
  );
}
