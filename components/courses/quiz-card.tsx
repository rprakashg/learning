"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trophy } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string;
  correctAnswer: string;
}

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    questions: Question[];
  };
}

export function QuizCard({ quiz }: QuizCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const questions = quiz.questions.map((q) => ({
    ...q,
    options: JSON.parse(q.options) as string[],
  }));

  const handleSelect = (questionId: string, option: string) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) return;
    setLoading(true);

    const res = await fetch(`/api/quiz/${quiz.id}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const reset = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{quiz.title}</h3>

      {result ? (
        <div className="text-center py-4">
          <Trophy className={`mx-auto mb-3 h-12 w-12 ${result.score >= 70 ? "text-yellow-400" : "text-gray-300"}`} />
          <p className="text-3xl font-bold text-gray-900">{Math.round(result.score)}%</p>
          <p className="mt-1 text-sm text-gray-500">
            {result.correct} / {result.total} correct
          </p>
          <p className={`mt-2 font-medium ${result.score >= 70 ? "text-emerald-600" : "text-red-600"}`}>
            {result.score >= 70 ? "Great job! You passed." : "Keep practicing and try again."}
          </p>

          {/* Show correct/incorrect */}
          <div className="mt-6 space-y-3 text-left">
            {questions.map((q) => {
              const selected = answers[q.id];
              const isCorrect = selected === q.correctAnswer;
              return (
                <div key={q.id} className="rounded-lg bg-white p-3">
                  <p className="text-sm font-medium text-gray-800">{q.text}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={isCorrect ? "text-emerald-700" : "text-red-700"}>
                      Your answer: {selected}
                    </span>
                    {!isCorrect && (
                      <span className="text-gray-500">· Correct: {q.correctAnswer}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Button variant="outline" size="sm" onClick={reset} className="mt-4">
            Try again
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {questions.map((q, idx) => (
            <div key={q.id}>
              <p className="mb-2 text-sm font-medium text-gray-800">
                {idx + 1}. {q.text}
              </p>
              <div className="space-y-2">
                {q.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(q.id, option)}
                    className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                      answers[q.id] === option
                        ? "border-indigo-500 bg-indigo-100 font-medium text-indigo-800"
                        : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <Button
            onClick={handleSubmit}
            disabled={loading || Object.keys(answers).length < questions.length}
            className="w-full"
          >
            {loading ? "Submitting..." : "Submit answers"}
          </Button>
        </div>
      )}
    </div>
  );
}
