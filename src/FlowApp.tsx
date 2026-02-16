import { useEffect, useMemo, useRef, useState } from "react";
import FloatingQuestions from "@/components/FloatingQuestions";
import QuestionScreen from "@/components/QuestionScreen";
import FinalScreen from "@/components/FinalScreen";
import Database from "@/components/Database";

// —— Types ————————————————————————————————————————————————
type Lang = "en" | "de";

type SeedQ = {
  id: string;
  text: Record<Lang, string>; // translated seed text
  source: "seed";
};

type UserQ = {
  id: string;
  text: string; // user input text as-is
  lang: Lang; // language UI was set to when created
  source: "user";
};

type Q = SeedQ | UserQ;

// —— LocalStorage keys ——————————————————————————————————————
const STORAGE_USER_KEY = "userQuestions";
const STORAGE_LANG_KEY = "uiLang";

// —— Seed questions (bilingual) ————————————————————————————
const seedQuestions: SeedQ[] = [
  {
    id: "seed-1",
    source: "seed",
    text: {
      en: "Which rights feel under threat today?",
      de: "Welche Rechte fühlen sich heute bedroht an?",
    },
  },
  {
    id: "seed-2",
    source: "seed",
    text: {
      en: "When is security used to limit freedom?",
      de: "Wann wird Sicherheit genutzt, um Freiheit einzuschränken?",
    },
  },
  {
    id: "seed-3",
    source: "seed",
    text: {
      en: "What role do political parties play in a democracy?",
      de: "Welche Rolle spielen politische Parteien in einer Demokratie?",
    },
  },
  {
    id: "seed-4",
    source: "seed",
    text: {
      en: "Are human rights universal?",
      de: "Sind Menschenrechte universell?",
    },
  },
  {
    id: "seed-5",
    source: "seed",
    text: {
      en: "How often should elections take place?",
      de: "Wie oft sollten Wahlen stattfinden?",
    },
  },
  {
    id: "seed-6",
    source: "seed",
    text: {
      en: "What other public offices should be popularly elected?",
      de: "Welche weiteren öffentlichen Ämter sollten direkt gewählt werden?",
    },
  },
  {
    id: "seed-7",
    source: "seed",
    text: {
      en: "Do voters have any power between elections?",
      de: "Haben Wählende zwischen Wahlen überhaupt Einfluss?",
    },
  },
  {
    id: "seed-8",
    source: "seed",
    text: {
      en: "How can we improve political participation?",
      de: "Wie können wir politische Teilhabe verbessern?",
    },
  },
  {
    id: "seed-9",
    source: "seed",
    text: {
      en: "What are the limits of free speech?",
      de: "Wo liegen die Grenzen der Meinungsfreiheit?",
    },
  },
  {
    id: "seed-10",
    source: "seed",
    text: {
      en: "How can we better protect minority rights?",
      de: "Wie können wir Minderheitenrechte besser schützen?",
    },
  },
  {
    id: "seed-11",
    source: "seed",
    text: {
      en: "What are the main challenges facing democracy today?",
      de: "Was sind heute die größten Herausforderungen für die Demokratie?",
    },
  },
];

// —— UI labels (bilingual) ————————————————————————————————
const I18N: Record<Lang, Record<string, string>> = {
  en: {
    nav_choose: "Choose a Question",
    nav_answer: "Submit your Voice",
    nav_leave: "Leave a Question",
    idle_title: "Click a question to answer it.",
    idle_hint:
      "By responding to a question, you actively contribute to this evolving democracy. Your input can shape it in different ways. Share your perspective and observe how the tree transforms through collective voices.",
    final_title: "How would you like to participate in this democracy?",
    final_hint: "You can either leave a question for the next visitor or add a statement that will shape this democracy.",
    
    final_question_button: "Leave Question",
    final_statement_button: "Add Statement",
    lang: "Language",

    refresh: "Refresh questions",
  },
  de: {
    nav_choose: "Wähle eine Frage",
    nav_answer: "Antwort eingeben",
    nav_leave: "Frage hinzufügen",
    idle_title: "Klicke eine Frage an, um sie zu beantworten.",
    idle_hint:
      "Mit deiner Antwort trägst du aktiv zu dieser sich entwickelnden Demokratie bei. Dein Beitrag kann sie auf unterschiedliche Weise prägen. Teile deine Perspektive und beobachte, wie sich der Baum durch die Stimmen aller verändert.",
          final_title: "Wie möchtest du dich an dieser Demokratie beteiligen?",
    final_hint: "Du kannst eine Frage für die nächste Person hinterlassen oder ein Statement hinzufügen, das diese Demokratie prägt.",
    final_question_button: "Frage hinterlassen",
    final_statement_button: "Statement hinzufügen",
    lang: "Sprache",
    refresh: "Fragen neu mischen",
  },
};

// —— Helpers ———————————————————————————————————————————————

// Pick N random unique items from an array
function pickRandom<T>(arr: T[], n: number) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

// —— Main component —————————————————————————————————————————
export default function FlowApp() {
  // —— UI language toggle (only affects labels + seed question language)
  const [uiLang, setUiLang] = useState<Lang>(() => {
    const raw = localStorage.getItem(STORAGE_LANG_KEY);
    return raw === "de" || raw === "en" ? raw : "en";
  });

  // Persist UI language
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANG_KEY, uiLang);
    } catch {
      // ignore (private mode etc.)
    }
  }, [uiLang]);

  // Translation helper
  const t = (key: keyof (typeof I18N)["en"]) => I18N[uiLang][key];

  // —— Page flow state
  const [page, setPage] = useState<"idle" | "ask" | "final">("idle");
  const [selected, setSelected] = useState<Q | null>(null);
  const [lastAnswer, setLastAnswer] = useState<string>("");
  // this helps show the UI when the user chooses between two buttons:
  const [finalMode, setFinalMode] = useState< "question" | "statement" | null>(null);
  // submission modal state
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
const [submittedType, setSubmittedType] = useState<"question" | "statement" | null>(null);



  // —— Refresh state (for “new set” + new layout)
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastPickedIds, setLastPickedIds] = useState<Set<string>>(new Set());


  // —— User-added questions (loaded from localStorage)
  const [userQuestions, setUserQuestions] = useState<UserQ[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USER_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // Basic shape guard (older saved formats are ignored)
      return parsed
        .filter(
          (x: any) =>
            x && typeof x.id === "string" && typeof x.text === "string",
        )
        .map((x: any) => ({
          id: x.id,
          text: x.text,
          lang: x.lang === "de" || x.lang === "en" ? x.lang : "en",
          source: "user" as const,
        }));
    } catch {
      return [];
    }
  });

  // Persist user questions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userQuestions));
    } catch {
      // ignore
    }
  }, [userQuestions]);

  // —— Combined question pool (seed + user)
  const allQuestions = useMemo<Q[]>(
    () => [...userQuestions, ...seedQuestions],
    [userQuestions],
  );

  // —— Visible set on idle screen
  // Goal: show 8 random questions, and when you refresh, try to make them "completely new"
  // (meaning: minimal overlap with the previous selection, if possible).
  const visibleQuestions = useMemo(() => {
    if (page !== "idle") return [];

    const N = 10;
    const tries = 10;

    let best: Q[] = [];
    let bestOverlap = Number.POSITIVE_INFINITY;

    for (let k = 0; k < tries; k++) {
      const candidate = pickRandom(allQuestions, N);
      const ids = new Set(candidate.map((q) => q.id));

      let overlap = 0;
      ids.forEach((id) => {
        if (lastPickedIds.has(id)) overlap++;
      });

      // If we can achieve 0 overlap, do it immediately
      if (lastPickedIds.size > 0 && overlap === 0) return candidate;

      // Otherwise keep the best (lowest overlap)
      if (overlap < bestOverlap) {
        bestOverlap = overlap;
        best = candidate;
      }
    }

    return best;
  }, [page, allQuestions, lastPickedIds, refreshKey]);

  // —— What gets displayed (seed uses uiLang; user stays as typed)
  const visibleDisplayQuestions = useMemo(
    () =>
      visibleQuestions.map((q) => ({
        id: q.id,
        q, // keep original object so we know if it's seed/user later
        text: q.source === "seed" ? q.text[uiLang] : q.text,
      })),
    [visibleQuestions, uiLang],
  );

  // —— Inactivity timer (kiosk mode)
  const INACTIVITY_TIMEOUT = 30_000;
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
    resetInactivityTimer();
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // —— Handlers (navigation + actions)
  const goBack = () => {
    resetInactivityTimer();
    setFinalMode(null)
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

  const handleSelect = (item: { id: string; text: string; q: Q }) => {
    resetInactivityTimer();
    setSelected(item.q);
    setPage("ask");
  };

  const handleSubmitAnswer = (text: string) => {
    resetInactivityTimer();
    setLastAnswer(text);
      setFinalMode(null); // 👈 reset to choice screen
    setPage("final");
  };

const handleAddQuestionWithModal = (text: string) => {

  setSubmittedType("question");
  setShowSubmissionModal(true);

  setTimeout(() => {
      handleAddQuestion(text); // properly call function 
    setShowSubmissionModal(false);
    setSubmittedType(null);
    goHome(); // sends back to idle after modal
  }, 4000);
};

const handleAddStatementWithModal = (text: string) => {


  setSubmittedType("statement");
  setShowSubmissionModal(true);

  setTimeout(() => {
      handleAddQuestion(text); // this is just a placeholder; replace with actual statement handling logic
    setShowSubmissionModal(false);
    setSubmittedType(null);
    goHome();
  }, 4000);
};



  const handleAddQuestion = (text: string) => {
    resetInactivityTimer();

    const trimmed = text.trim();
    if (trimmed.length > 0) {
      const q: UserQ = {
        id: `user-${Date.now()}`,
        text: trimmed,
        lang: uiLang, // remember UI language at creation time
        source: "user",
      };
      setUserQuestions((s) => [q, ...s]);
    }

    // reset flow
    setSelected(null);
    setLastAnswer("");
    setPage("idle");
  };

  // Refresh questions button:
  // - store current selection ids so we can avoid them next time
  // - bump refreshKey to force recompute + new layout
  const handleRefreshQuestions = () => {
    setLastPickedIds(new Set(visibleQuestions.map((q) => q.id)));
    setRefreshKey((k) => k + 1);
  };

  // —— Render ———————————————————————————————————————————————
  return (
    <main
      className="min-h-screen p-6 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white"
      onClick={resetInactivityTimer}
      onKeyDown={resetInactivityTimer}
    >
      <div className="max-w-4xl mx-auto">
        {/* —— Top navigation + language toggle —— */}
        <nav className="flex items-center justify-between mb-8">
          {/* left spacer */}
          <div className="w-[140px]" />

          {/* right: language toggle */}
          <div className="w-[140px] flex justify-end items-center gap-2 text-xs">
            <span className="opacity-70">{t("lang")}:</span>
            <button
              type="button"
              onClick={() => setUiLang("en")}
              className={
                uiLang === "en"
                  ? "px-2 py-1 rounded bg-white/15"
                  : "px-2 py-1 rounded hover:bg-white/10"
              }
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setUiLang("de")}
              className={
                uiLang === "de"
                  ? "px-2 py-1 rounded bg-white/15"
                  : "px-2 py-1 rounded hover:bg-white/10"
              }
            >
              DE
            </button>
          </div>
        </nav>

        {/* —— Page: Idle (floating questions) —— */}
        {page === "idle" && (
          <section>
            <h1 className="text-3xl font-semibold mb-6 text-center">
              {t("idle_title")}
            </h1>

            <p className="text-center text-sm text-neutral-300/80 max-w-0.4xl mx-auto mb-4">
              {t("idle_hint")}
            </p>

            {/* —— Refresh button —— */}
            <div className="flex items-center justify-center mb-4">
              <button
                type="button"
                onClick={handleRefreshQuestions}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/0 hover:bg-white/35 border border-white/15 text-sm text-white transition"
              >
                <i className="bi bi-arrow-clockwise text-base leading-none" />
                <span>{t("refresh")}</span>
              </button>
            </div>

            <FloatingQuestions
              questions={visibleDisplayQuestions}
              onSelect={handleSelect}
              //refreshKey={refreshKey}
            />
          </section>
        )}

{page !== "idle" && selected && (
  <>
    {/* —— QuestionScreen —— */}
    {lastAnswer.trim() === "" && (
      <QuestionScreen
        uiLang={uiLang}
        question={{
          id: selected.id,
          text:
            selected.source === "seed"
              ? selected.text[uiLang]
              : selected.text,
        }}
        onSubmit={(text) => {
          handleSubmitAnswer(text);
        }}
        onBack={goHome}
        hasAnswered={false}
      />
    )}

    {/* —— FinalScreen + Database —— */}
 {page === "final" && (
  <div className="mt-6 max-w-2xl mx-auto">
    {/* Text */}
     <h1 className="text-3xl font-semibold mb-6 text-center">
              {t("final_title")}
            </h1>

            <p className="text-center text-sm text-neutral-300/80 max-w-0.4xl mx-auto mb-4">
              {t("final_hint")}
            </p>

    {/* Buttons */}
    <div className="flex justify-center gap-4 mb-6">
      <button
        onClick={() => setFinalMode("question")}
        className={`px-4 py-2 rounded-lg border transition
          ${finalMode === "question"
            ? "bg-white/20 border-white/40"
            : "bg-white/5 border-white/20 hover:bg-white/10"}
        `}
      >
      {t("final_question_button")}
      </button>

      <button
        onClick={() => setFinalMode("statement")}
        className={`px-4 py-2 rounded-lg border transition
          ${finalMode === "statement"
            ? "bg-white/20 border-white/40"
            : "bg-white/5 border-white/20 hover:bg-white/10"}
        `}
      >
          {t("final_statement_button")}
      </button>
        <button
    onClick={goHome}
    className="px-4 py-2 rounded-lg border border-white/20 bg-white/0 hover:bg-white/10"
  >
    Skip
  </button>
    </div>

    {/* Conditional UI below */}
    {finalMode === "question" && (
      <FinalScreen
        uiLang={uiLang}
        answer={lastAnswer}
        onLeaveQuestion={handleAddQuestionWithModal}
   
        disabled={lastAnswer.trim() === ""}
      />
    )}

    {finalMode === "statement" && (
      <Database
        uiLang={uiLang}
        answer={lastAnswer}
        onLeaveQuestion={handleAddStatementWithModal}
       
        disabled={lastAnswer.trim() === ""}
      />
    )}
  </div>
)}
{showSubmissionModal && submittedType && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-neutral-900 p-6 rounded-xl max-w-sm text-center text-white">
      <h2 className="text-xl font-semibold mb-4">
        {submittedType === "question" ? "Question submitted!" : "Statement submitted!"}
      </h2>
      <p className="mb-6">
        {submittedType === "question"
          ? "Thank you for leaving a question. It will be shown to the next visitor."
          : "Thank you for adding a statement. It will help shape this democracy."}
      </p>
   
    </div>
  </div>
)}


  </>
)}
      </div>
    </main>
  );
}
