import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function QuestionScreen({
  question,
  onSubmit,
  onBack,
}: {
  question?: { id: string; text: string } | null;
  onSubmit: (answer: string) => void;
  onBack: () => void;
}) {
  const [answer, setAnswer] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="w-full max-w-2xl mt-8 text-center">
        <h1 className="text-3xl font-semibold mb-2">
          {question?.text ?? "Share your voice"}
        </h1>
        <p className="text-sm text-neutral-400 mb-6">
          Share your thoughts below.
        </p>

        <Textarea
          placeholder="I think…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="min-h-[180px] mb-4"
        />

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onBack} className="text-neutral-300">
            Back
          </Button>
          <Button onClick={() => onSubmit(answer)} disabled={!answer.trim()}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
