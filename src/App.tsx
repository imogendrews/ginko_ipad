import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

async function sendQuestion(text) {
  const res = await fetch("http://localhost:8000/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) {
    throw new Error("Model request failed")
  }

  return await res.json()
}




export default function App() {
  // Track answers
  const [q1Text, setQ1Text] = useState("")
  const [q2Text, setQ2Text] = useState("")
  const [q1Result, setQ1Result] = useState(null)
const [q2Result, setQ2Result] = useState(null)

  // Step state
  const [step, setStep] = useState(1) // 1 = first question, 2 = second

  // Dynamic first question text
  const [q1Question, setQ1Question] = useState("What do you think of democracy?")

  // Handle submit for first question
 const handleQ1Submit = async () => {
  const result = await sendQuestion(q1Text)
   setQ1Result(result) 
  console.log("Model output Q1:", result)

  setStep(2)
}


  // Handle submit for second question
const handleQ2Submit = async () => {
  const result = await sendQuestion(q2Text)
    setQ2Result(result) 
  console.log("Model output Q2:", result)

  setQ1Question(q2Text)
  setQ2Text("")
  setQ1Text("")
  setStep(1)
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
            {q1Result && (
  <pre className="bg-neutral-900 p-4 rounded text-sm overflow-x-auto mb-8">
    {JSON.stringify(q1Result, null, 2)}
  </pre>
)}

{/* Show Q2 result */}
{q2Result && (
  <pre className="bg-neutral-900 p-4 rounded text-sm overflow-x-auto mb-8">
    {JSON.stringify(q2Result, null, 2)}
  </pre>
)}
          </div>
        )}

      </section>
    </main>
  )
}
