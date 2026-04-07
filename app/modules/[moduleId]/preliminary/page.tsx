"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/game/Navbar";
import { assessPlayerDifficulty } from "@/lib/game-logic";
import Link from "next/link";

interface PrelimQuestion {
  question: string;
  options: string[];
  answer: "A" | "B" | "C" | "D";
  explanation: string;
}

export default function PreliminaryPage() {
  const router = useRouter();
  const params = useParams<{ moduleId: string }>();
  const moduleId = params.moduleId;

  const [questions, setQuestions] = useState<PrelimQuestion[]>([]);
  const [modName, setModName] = useState("");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/modules/${moduleId}`)
      .then((r) => r.json())
      .then((d) => {
        setModName(d.module?.name ?? "");
        const qs = d.module?.preliminaryQuestions as PrelimQuestion[] | undefined;
        setQuestions(qs ?? []);
      });
  }, [moduleId]);

  function handleSelect(opt: string) {
    if (revealed) return;
    setSelected(opt);
  }

  function handleReveal() {
    if (!selected) return;
    setRevealed(true);
  }

  function handleNext() {
    if (!selected) return;
    const correct = selected === questions[current].answer;
    const newAnswers = [...answers, { correct }];
    setAnswers(newAnswers);

    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  }

  async function handleFinish() {
    setSubmitting(true);
    const score = Math.round((answers.filter((a) => a.correct).length / questions.length) * 100);
    const playerDifficulty = assessPlayerDifficulty(score);

    await fetch(`/api/modules/${moduleId}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase: "CODING", playerDifficulty }),
    });

    router.push(`/modules/${moduleId}`);
  }

  const q = questions[current];
  const optionLabels = ["A", "B", "C", "D"] as const;
  const correctCount = answers.filter((a) => a.correct).length;
  const quizScore = done
    ? Math.round((correctCount / questions.length) * 100)
    : 0;
  const startDifficulty = done ? assessPlayerDifficulty(quizScore) : null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <Link href={`/modules/${moduleId}`} className="text-sm text-slate-500 hover:text-slate-300 transition mb-6 inline-block">
          ← Module Overview
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-bold tracking-wider uppercase">
            Phase 2 — Preliminary Quiz
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-100 mb-2">{modName}</h1>
        <p className="text-slate-400 text-sm mb-8">
          This short quiz will gauge your starting level for this module.
        </p>

        {questions.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 border border-white/10 text-center"
          >
            <div className="text-5xl mb-4">
              {quizScore >= 75 ? "🏆" : quizScore >= 40 ? "👍" : "💪"}
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              {correctCount} / {questions.length} correct
            </h2>
            <p className="text-slate-400 mb-4">Score: {quizScore}%</p>
            {startDifficulty && (
              <p className="text-sm text-cyan-400 mb-8">
                You&apos;ll start at{" "}
                <span className="font-bold capitalize text-cyan-300">
                  {startDifficulty.toLowerCase()}
                </span>{" "}
                difficulty for the coding round.
              </p>
            )}
            <button
              onClick={handleFinish}
              disabled={submitting}
              className="px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Start Coding Round →"}
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress dots */}
              <div className="flex gap-1.5 mb-6">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i < current
                        ? "bg-green-500 flex-1"
                        : i === current
                        ? "bg-purple-500 flex-[2]"
                        : "bg-white/15 flex-1"
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-500 mb-3">
                Question {current + 1} of {questions.length}
              </p>

              <div className="glass rounded-2xl p-6 border border-white/10 mb-5">
                <p className="text-slate-100 font-semibold text-base leading-relaxed">
                  {q.question}
                </p>
              </div>

              <div className="grid gap-3 mb-6">
                {q.options.map((opt, i) => {
                  const label = optionLabels[i];
                  const isSelected = selected === label;
                  const isCorrect = label === q.answer;
                  let cls =
                    "flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer";
                  if (!revealed) {
                    cls += isSelected
                      ? " border-purple-500/70 bg-purple-500/15 text-slate-100"
                      : " border-white/10 bg-white/3 text-slate-300 hover:border-white/25 hover:bg-white/6";
                  } else {
                    if (isCorrect) cls += " border-green-500/60 bg-green-500/10 text-green-300";
                    else if (isSelected && !isCorrect) cls += " border-red-500/60 bg-red-500/10 text-red-300";
                    else cls += " border-white/8 bg-white/3 text-slate-500";
                  }

                  return (
                    <button key={label} className={cls} onClick={() => handleSelect(label)}>
                      <span className="text-xs font-bold mt-0.5 shrink-0">{label}.</span>
                      <span className="text-sm leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {revealed && q.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="glass rounded-xl p-4 border border-cyan-500/30 bg-cyan-500/5 mb-5"
                >
                  <p className="text-xs font-bold text-cyan-400 mb-1">Explanation</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{q.explanation}</p>
                </motion.div>
              )}

              <div className="flex gap-3">
                {!revealed ? (
                  <button
                    onClick={handleReveal}
                    disabled={!selected}
                    className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-purple-500/50 text-purple-300 hover:bg-purple-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:scale-105 transition-all duration-200"
                  >
                    {current + 1 >= questions.length ? "See Results →" : "Next Question →"}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
