"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/game/Navbar";
import InterviewSimulator from "@/components/game/InterviewSimulator";
import Link from "next/link";

interface Question {
  id: string;
  name: string;
  difficulty: string;
}

export default function InterviewPage() {
  const params = useParams<{ moduleId: string; questionId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { moduleId, questionId } = params;
  const hintsUsed = parseInt(searchParams.get("hints") ?? "0");

  const [question, setQuestion] = useState<Question | null>(null);
  const [modName, setModName] = useState("");
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/modules/${moduleId}`)
      .then((r) => r.json())
      .then((d) => {
        setModName(d.module?.name ?? "");
        const q = (d.questions as Question[])?.find((q: Question) => q.id === questionId);
        setQuestion(q ?? null);
      });
  }, [moduleId, questionId]);

  async function handleInterviewComplete(
    score: number,
    feedback: string,
    strengths: string[],
    improvements: string[]
  ) {
    setResult({ score, feedback, strengths, improvements });

    // Update module progress phase back to CODING for next question
    await fetch(`/api/modules/${moduleId}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase: "CODING" }),
    });
  }

  async function handleNext() {
    // Get all questions to find the next one
    const res = await fetch(`/api/modules/${moduleId}`);
    const data = await res.json();
    const questions: Question[] = data.questions ?? [];
    const idx = questions.findIndex((q) => q.id === questionId);
    const next = questions[idx + 1];

    if (next) {
      router.push(`/modules/${moduleId}/coding/${next.id}`);
    } else {
      // All questions done — go to score review
      await fetch(`/api/modules/${moduleId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "SCORE_REVIEW" }),
      });
      router.push(`/modules/${moduleId}/score`);
    }
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300 transition">Dashboard</Link>
          <span>/</span>
          <Link href={`/modules/${moduleId}`} className="hover:text-slate-300 transition">{modName}</Link>
          <span>/</span>
          <span className="text-slate-300">Interview — {question.name}</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wider uppercase">
            Phase 4 — AI Interview
          </div>
          {hintsUsed > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400">
              +{hintsUsed} difficulty boost from hints
            </span>
          )}
        </div>

        {!result ? (
          <InterviewSimulator
            questionId={questionId}
            questionName={question.name}
            moduleName={modName}
            difficulty={question.difficulty}
            hintsUsed={hintsUsed}
            onComplete={handleInterviewComplete}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score card */}
            <div className="glass rounded-2xl p-8 border border-white/10 text-center">
              <div className="text-5xl mb-4">
                {result.score >= 80 ? "🌟" : result.score >= 60 ? "👏" : "💪"}
              </div>
              <h2 className="text-3xl font-extrabold mb-1">
                <span className={result.score >= 80 ? "text-green-400" : result.score >= 60 ? "text-yellow-400" : "text-red-400"}>
                  {result.score}
                </span>
                <span className="text-slate-400 text-xl"> / 100</span>
              </h2>
              <p className="text-slate-400 text-sm mb-6">Interview Score</p>
              <p className="text-slate-300 leading-relaxed max-w-xl mx-auto">{result.feedback}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Strengths */}
              <div className="glass rounded-2xl p-6 border border-green-500/20 bg-green-500/5">
                <h3 className="text-sm font-bold text-green-400 mb-3">✓ Strengths</h3>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-green-500 shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="glass rounded-2xl p-6 border border-yellow-500/20 bg-yellow-500/5">
                <h3 className="text-sm font-bold text-yellow-400 mb-3">↑ Areas to Improve</h3>
                <ul className="space-y-2">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-yellow-500 shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={handleNext}
                className="px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg hover:scale-105 transition-all duration-200"
              >
                Continue →
              </button>
              <Link
                href={`/modules/${moduleId}`}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm border border-white/20 text-slate-300 hover:bg-white/5 transition"
              >
                Module Overview
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
