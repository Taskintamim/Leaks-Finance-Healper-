import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./Button";
import { useSession } from "../lib/session";
import { springFast } from "../lib/motion";

export function Logo() {
  return (
    <Link to="/" className="text-[13px] font-medium tracking-[0.22em] text-fg">
      LEAKS
    </Link>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { loadSample } = useSession();
  const onResults = pathname === "/results";
  const [open, setOpen] = useState(false);

  function tryExample() {
    setOpen(false);
    loadSample();
    navigate("/analyzing", { state: { demo: true } });
  }

  function go(to: string) {
    setOpen(false);
    const [path, hash] = to.split("#");
    const targetPath = path || "/";
    if (hash && pathname === targetPath) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate(to);
  }

  const links = onResults
    ? [
        { to: "/input", label: "Analyze" },
        { to: "/results#insights", label: "Insights" },
        { to: "/results#what-if", label: "Simulator" },
      ]
    : [
        { to: "/input", label: "Analyze" },
        { to: "/#finds", label: "Insights" },
        { to: "/#simulator", label: "Simulator" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/92">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between px-5 md:px-8">
        <Logo />

        <nav className="hidden items-center gap-5 lg:gap-8 md:flex">
          {links.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => go(link.to)}
              className="min-h-11 text-[13px] text-soft hover:text-fg"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:block">
          {onResults ? (
            <Button to="/input" variant="secondary" size="sm">
              <span className="lg:hidden">New</span>
              <span className="hidden lg:inline">New analysis</span>
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={tryExample}>
              Try example
            </Button>
          )}
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-soft hover:text-fg md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springFast}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <div className="flex flex-col px-5 py-3">
              {links.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => go(link.to)}
                  className="flex min-h-11 items-center text-left text-[14px] text-soft"
                >
                  {link.label}
                </button>
              ))}
              {onResults ? (
                <button
                  type="button"
                  onClick={() => go("/input")}
                  className="flex min-h-11 items-center text-left text-[14px] text-copper"
                >
                  New analysis
                </button>
              ) : (
                <button
                  type="button"
                  onClick={tryExample}
                  className="flex min-h-11 items-center text-left text-[14px] text-copper"
                >
                  Try example
                </button>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
