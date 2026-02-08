import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function FinalScreen({
  uiLang,
  answer,
  onLeaveQuestion,
  onHome,
}: {
  uiLang: "en" | "de";
  answer: string;
  onLeaveQuestion: (q: string) => void;
  onHome: () => void;
}) {
  const [newQ, setNewQ] = useState("");

  const I18N = {
    en: {
      title: "Your Input",
      leave: "Leave a new question for others",
      placeholder: "Write a question to add to the pile…",
      skip: "Skip",
      add: "Add Question",
    },
    de: {
      title: "Deine Eingabe",
      leave: "Hinterlasse eine neue Frage für andere",
      placeholder: "Schreibe eine Frage für den Stapel…",
      skip: "Überspringen",
      add: "Frage hinzufügen",
    },
  } as const;

  const t = I18N[uiLang];

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="w-full max-w-2xl mt-8 text-center">
        <h1 className="text-3xl font-semibold mb-2">{t.title}</h1>
        <div className="bg-white/5 p-4 rounded text-sm mb-6">{answer}</div>

        <h2 className="text-md font-medium mb-2">{t.leave}</h2>
        <Textarea
          placeholder={t.placeholder}
          value={newQ}
          onChange={(e) => setNewQ(e.target.value)}
          className="min-h-[140px] mb-4"
        />
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onHome}
            className="text-neutral-300"
          >
            {t.skip}
          </Button>
          <Button
            onClick={() => {
              if (!newQ.trim()) return;
              onLeaveQuestion(newQ.trim());
              setNewQ("");
            }}
            disabled={!newQ.trim()}
          >
            {t.add}
          </Button>
        </div>
      </div>
    </div>
  );
}
