import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "./components/Header";
import { Landing } from "./pages/Landing";
import { ExpenseInput } from "./pages/ExpenseInput";
import { Analyzing } from "./pages/Analyzing";
import { Results } from "./pages/Results";

import { pageTransition } from "./lib/motion";

function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-canvas text-fg">
      <Header />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <Page>
                <Landing />
              </Page>
            }
          />
          <Route
            path="/input"
            element={
              <Page>
                <ExpenseInput />
              </Page>
            }
          />
          <Route
            path="/analyzing"
            element={
              <Page>
                <Analyzing />
              </Page>
            }
          />
          <Route
            path="/results"
            element={
              <Page>
                <Results />
              </Page>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
