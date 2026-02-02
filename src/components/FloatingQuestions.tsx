import { useMemo } from "react";

type Question = {
  id: string;
  text: string;
};

export default function FloatingQuestions({
  questions,
  onSelect,
}: {
  questions: Question[];
  onSelect: (q: Question) => void;
}) {
  // Generate positions and animation params once
  const items = useMemo(() => {
    return questions.map((q, i) => {
      const top = 8 + ((i * 13) % 80);
      const left = (i * 37) % 92;
      const duration = 8 + (i % 7);
      const delay = (i % 5) * 0.4;
      return { q, top: `${top}%`, left: `${left}%`, duration, delay };
    });
  }, [questions]);

  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      {items.map((it) => (
        <button
          key={it.q.id}
          onClick={() => onSelect(it.q)}
          className="floating-question absolute px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm text-white/90 hover:scale-105 focus:outline-none"
          style={{
            top: it.top,
            left: it.left,
            animationDuration: `${it.duration}s`,
            animationDelay: `${it.delay}s`,
          }}
        >
          {it.q.text}
        </button>
      ))}
    </div>
  );
}
