import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function App() {
  // Track answers
  const [q1Text, setQ1Text] = useState("")
  const [q2Text, setQ2Text] = useState("")

  // Step state
  const [step, setStep] = useState(1) // 1 = first question, 2 = second

  // Dynamic first question text
  const [q1Question, setQ1Question] = useState("What do you think of democracy?")

  // Handle submit for first question
  const handleQ1Submit = () => {
    setStep(2)        // move to second question
  }

  // Handle submit for second question
  const handleQ2Submit = () => {
    setQ1Question(q2Text)  // update first question
    setQ2Text("")           // reset second textarea
    setStep(1)              // back to first question
    setQ1Text("")           // reset first textarea for new answer
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 p-6">
      <section className="w-full max-w-xl">

        {/* Question 1 */}
        <p className="mb-4 text-center text-xl font-light tracking-wide">{q1Question}</p>
        <Textarea
          placeholder="Type your answer here…"
          value={q1Text}
          onChange={(e) => setQ1Text(e.target.value)}
          className="min-h-[150px] mb-4"
          spellCheck={false}
          disabled={step !== 1} // only enabled on step 1
        />
        {step === 1 && (
          <div className="flex justify-center mb-8">
            <Button
              variant="outline"
              className="border-black text-black bg-white hover:bg-black hover:text-white"
              onClick={handleQ1Submit}
              disabled={!q1Text.trim()}
            >
              Submit
            </Button>
          </div>
        )}

        {/* Question 2 */}
        <p className="mb-4 text-center text-xl font-light tracking-wide">
          What do you want to leave behind?
        </p>
        <Textarea
          placeholder="Type your answer here…"
          value={q2Text}
          onChange={(e) => setQ2Text(e.target.value)}
          className="min-h-[150px] mb-4"
          spellCheck={false}
          disabled={step !== 2} // only enabled on step 2
        />
        {step === 2 && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="border-black text-black bg-white hover:bg-black hover:text-white"
              onClick={handleQ2Submit}
              disabled={!q2Text.trim()}
            >
              Submit
            </Button>
          </div>
        )}

      </section>
    </main>
  )
}
