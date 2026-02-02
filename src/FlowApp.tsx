import { useEffect, useMemo, useRef, useState } from "react";
import FloatingQuestions from "@/components/FloatingQuestions";
import QuestionScreen from "@/components/QuestionScreen";
import FinalScreen from "@/components/FinalScreen";

type Q = { id: string; text: string };

// Persist only *user-added* questions (seed stays constant).
const STORAGE_USER_KEY = "userQuestions";

const seedQuestions: Q[] = [
  { id: "seed-1", text: "Which rights feel under threat today?" },
  { id: "seed-2", text: "When is security used to limit freedom?" },
  { id: "seed-3", text: "What role do political parties play in a democracy?" },
  { id: "seed-4", text: "Are human rights universal?" },
  { id: "seed-5", text: "How often should elections take place?" },
  {
    id: "seed-6",
    text: "What other public offices should be popularly elected?",
  },
  { id: "seed-7", text: "Do voters have any power between elections?" },
  { id: "seed-8", text: "How can we improve political participation?" },
  { id: "seed-9", text: "What are the limits of free speech?" },
  { id: "seed-10", text: "How can we better protect minority rights?" },
  {
    id: "seed-11",
    text: "What are the main challenges facing democracy today?",
  },
];

// Pick N unique items, shuffled
function pickRandom<T>(arr: T[], n: number) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

export default function FlowApp() {
  const [page, setPage] = useState<"idle" | "ask" | "final">("idle");
  const [selected, setSelected] = useState<Q | null>(null);
  const [lastAnswer, setLastAnswer] = useState<string>("");

  const [userQuestions, setUserQuestions] = useState<Q[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userQuestions));
    } catch (e) {}
  }, [userQuestions]);

  // Two collections: seed + user questions (pile grows over time)
  const allQuestions = useMemo<Q[]>(
    () => [...userQuestions, ...seedQuestions],
    [userQuestions],
  );

  // Only show 8 random questions on idle page
  const visibleQuestions = useMemo(() => {
    if (page !== "idle") return [];
    return pickRandom(allQuestions, 8);
  }, [page, allQuestions]);

  // --- Inactivity timer (kiosk mode) ---
  const INACTIVITY_TIMEOUT = 30_000; // 30 seconds
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

    inactivityTimer.current = setTimeout(() => {
      // soft reset to idle
      setSelected(null);
      setLastAnswer("");
      setPage("idle");
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // start timer once
    resetInactivityTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Navigation / handlers ---
  const handleSelect = (q: Q) => {
    resetInactivityTimer();
    setSelected(q);
    setPage("ask");
  };

  const handleSubmitAnswer = (text: string) => {
    resetInactivityTimer();
    setLastAnswer(text);
    setPage("final");
  };

  const handleAddQuestion = (text: string) => {
    resetInactivityTimer();

    const trimmed = text.trim();
    if (trimmed.length > 0) {
      const q: Q = { id: `user-${Date.now()}`, text: trimmed };
      setUserQuestions((s) => [q, ...s]);
    }

    // reset flow
    setSelected(null);
    setLastAnswer("");
    setPage("idle");
  };

  const goHome = () => {
    resetInactivityTimer();
    setPage("idle");
  };

  const goToAsk = () => {
    resetInactivityTimer();
    setPage("ask");
  };

  const goToFinal = () => {
    resetInactivityTimer();
    setPage("final");
  };

  return (
    <main
      className="min-h-screen p-6 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white"
      onClick={resetInactivityTimer}
      onKeyDown={resetInactivityTimer}
    >
      <div className="max-w-4xl mx-auto">
        {/* Centered breadcrumb navigation */}
        <nav className="flex justify-center mb-8">
          <ul className="flex items-center gap-8 text-sm">
            {[
              { key: "idle", label: "Choose a Question", onClick: goHome },
              { key: "ask", label: "Submit your Voice", onClick: goToAsk },
              { key: "final", label: "Leave a Question", onClick: goToFinal },
            ].map((item) => {
              const isActive = page === item.key;

              return (
                <li key={item.key}>
                  {isActive ? (
                    <span className="pb-1 border-b border-neutral-300/70 text-white">
                      {item.label}
                    </span>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className="text-neutral-400 hover:text-white transition-colors"
                      type="button"
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {page === "idle" && (
          <section>
            <h1 className="text-3xl font-semibold mb-6 text-center">
              Click a question to answer it.
            </h1>

            <FloatingQuestions
              questions={visibleQuestions}
              onSelect={handleSelect}
            />
          </section>
        )}

        {page === "ask" && (
          <QuestionScreen
            question={selected ?? undefined} // optional prompt only
            onSubmit={handleSubmitAnswer}
            onBack={goHome}
          />
        )}

        {page === "final" && (
          <FinalScreen
            answer={lastAnswer}
            onLeaveQuestion={handleAddQuestion}
            onHome={goHome}
          />
        )}
      </div>
    </main>
  );
}
