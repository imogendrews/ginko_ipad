import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function FinalScreen({
  answer,
  onLeaveQuestion,
  onHome,
}: {
  answer: string;
  onLeaveQuestion: (q: string) => void;
  onHome: () => void;
}) {
  const [newQ, setNewQ] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="w-full max-w-2xl mt-8 text-center">
        <h1 className="text-3xl font-semibold mb-2">Your submission</h1>
        <div className="bg-white/5 p-4 rounded text-sm mb-6">{answer}</div>

        <h2 className="text-md font-medium mb-2">
          Leave a new question for others
        </h2>
        <Textarea
          placeholder="Write a question to add to the pile…"
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
            Skip
          </Button>
          <Button
            onClick={() => {
              if (!newQ.trim()) return;
              onLeaveQuestion(newQ.trim());
              setNewQ("");
            }}
            disabled={!newQ.trim()}
          >
            Add Question
          </Button>
        </div>
      </div>
    </div>
  );
}
