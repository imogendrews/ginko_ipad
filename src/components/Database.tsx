import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function FinalScreen({
  uiLang,
  answer,
  onLeaveQuestion,

   disabled = false, // ← new
}: {
  uiLang: "en" | "de";
  answer: string;
  onLeaveQuestion: (q: string) => void;

    disabled?: boolean; // ← new
}) {
  const [newQ, setNewQ] = useState("");

  const I18N = {
    en: {
      title: "Your Input",
      leave: "Leave a statement that will shape this democracy",
      placeholder: "Your statement will be used to make up the foudation of this democracy, add wisely",
      back: "Back",
      add: "Add Statement",
    },
    de: {
      title: "Deine Eingabe",
      leave: "Hinterlasse eine neue Frage für andere",
      placeholder: "Schreibe eine Frage für den Stapel…",
      back: "Zurück",
      add: "Statement hinzufügen",
    },
  } as const;

  const t = I18N[uiLang];

  return (
    <div
      className={`flex flex-col items-center p-6 w-full max-w-2xl mt-8 text-center transition-opacity ${
        disabled ? "opacity-50 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* <h1 className="text-3xl font-semibold mb-2">{t.title}</h1>
      <div className="bg-white/5 p-4 rounded text-sm mb-6">{answer}</div> */}

      <h2 className="text-md font-medium mb-2">{t.leave}</h2>
      <Textarea
        placeholder={t.placeholder}
        value={newQ}
        onChange={(e) => setNewQ(e.target.value)}
        className="min-h-[140px] mb-4"
        disabled={disabled} // ← disable textarea
      />
      <div className="flex gap-2 justify-end">
       
        <Button
          onClick={() => {
            if (!newQ.trim()) return;
            onLeaveQuestion(newQ.trim());
            setNewQ("");
          }}
          disabled={disabled || !newQ.trim()} // ← disable button if unanswered
        >
          {t.add}
        </Button>
      </div>
    </div>
  );
}
