import { useEffect, useMemo, useState } from "react";
import FloatingQuestions from "@/components/FloatingQuestions";
import QuestionScreen from "@/components/QuestionScreen";
import FinalScreen from "@/components/FinalScreen";

type Q = { id: string; text: string };

// Persist only *user-added* questions (seed stays constant).
const STORAGE_USER_KEY = "userQuestions";

const seedQuestions: Q[] = [
  { id: "seed-1", text: "What matters most to you today?" },
  { id: "seed-2", text: "Which habit changed your life?" },
  { id: "seed-3", text: "What's a question you can't stop thinking about?" },
  { id: "seed-4", text: "If you could ask the future one thing, what is it?" },
  { id: "seed-5", text: "What would you teach the next generation?" },
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

  const [page, setPage] = useState<"idle" | "ask" | "final">("idle");
  const [selected, setSelected] = useState<Q | null>(null);
  const [lastAnswer, setLastAnswer] = useState<string>("");

  // Only show 8 random questions on idle page
  const visibleQuestions = useMemo(() => {
    if (page !== "idle") return [];
    return pickRandom(allQuestions, 8);
  }, [page, allQuestions]);

  const handleSelect = (q: Q) => {
    setSelected(q);
    setPage("ask");
  };

  const handleSubmitAnswer = (text: string) => {
    setLastAnswer(text);
    setPage("final");
  };

  const handleAddQuestion = (text: string) => {
    const q: Q = { id: `user-${Date.now()}`, text };
    setUserQuestions((s) => [q, ...s]);

    // reset flow
    setSelected(null);
    setLastAnswer("");
    setPage("idle");
  };

  const goHome = () => setPage("idle");
  const goToAsk = () => setPage("ask");
  const goToFinal = () => setPage("final");

  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white">
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
                    <span
                      className="pb-1 border-b border-neutral-300/70
 text-white"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className="text-neutral-400 hover:text-white transition-colors"
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
            question={selected ?? undefined}
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
