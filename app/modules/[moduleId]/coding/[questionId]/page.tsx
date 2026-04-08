"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/game/Navbar";
import DifficultyBadge from "@/components/game/DifficultyBadge";
import ChatBot from "@/components/game/ChatBot";
import HintReveal from "@/components/game/HintReveal";
import ScreenshotUpload from "@/components/game/ScreenshotUpload";
import Link from "next/link";

interface Question {
  id: string;
  name: string;
  difficulty: string;
  topics: string[];
  leetcodeUrl: string;
  orderInModule: number;
}

interface ModuleInfo {
  id: string;
  name: string;
  questions: Question[];
}

export default function CodingPage() {
  const router = useRouter();
  const params = useParams<{ moduleId: string; questionId: string }>();
  const { moduleId, questionId } = params;

  const [question, setQuestion] = useState<Question | null>(null);
  const [module, setModule] = useState<ModuleInfo | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(() => Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`/api/modules/${moduleId}`)
      .then((r) => r.json())
      .then((d) => {
        setModule(d.module);
        const q = (d.questions as Question[])?.find((q: Question) => q.id === questionId);
        setQuestion(q ?? null);
      });

    // Mark this question as current in progress
    fetch(`/api/modules/${moduleId}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase: "CODING", currentQuestionId: questionId }),
    });

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [moduleId, questionId]);

  function handleHintUsed(count: number) {
    setHintsUsed(count);
  }

  async function handleSubmitSuccess(_url: string) {
    setSubmitted(true);
    const timeSeconds = Math.round((Date.now() - startTime) / 1000);

    // Notify progress we're in interview phase for this question
    await fetch(`/api/modules/${moduleId}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase: "INTERVIEW", currentQuestionId: questionId }),
    });

    // Short delay then navigate to interview
    timerRef.current = setTimeout(() => {
      router.push(`/modules/${moduleId}/interview/${questionId}?time=${timeSeconds}`);
    }, 1800);
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Find adjacent questions
  const questions = module?.questions ?? [];
  const idx = questions.findIndex((q) => q.id === questionId);
  const prevQ = idx > 0 ? questions[idx - 1] : null;
  const nextQ = idx >= 0 && idx < questions.length - 1 ? questions[idx + 1] : null;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300 transition">Dashboard</Link>
          <span>/</span>
          <Link href={`/modules/${moduleId}`} className="hover:text-slate-300 transition">{module?.name ?? "Module"}</Link>
          <span>/</span>
          <span className="text-slate-300">{question.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: problem info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Problem header */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">#{question.orderInModule}</span>
                    <DifficultyBadge difficulty={question.difficulty} size="sm" />
                    {hintsUsed > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400">
                        {hintsUsed} hint{hintsUsed > 1 ? "s" : ""} used
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-slate-100">{question.name}</h1>
                  <p className="text-xs text-slate-500 mt-1">{question.topics.join(" · ")}</p>
                </div>

                <a
                  href={question.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-yellow-500/15 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/25 hover:scale-105 transition-all duration-200"
                >
                  Open LeetCode ↗
                </a>
              </div>

              <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                <p className="text-sm text-slate-300 leading-relaxed">
                  Solve the problem on LeetCode, then upload a screenshot of your successful
                  submission below to unlock the interview round.
                </p>
                {hintsUsed > 0 && (
                  <p className="text-xs text-yellow-400/80 mt-2">
                    ⚠ You&apos;ve used {hintsUsed} hint(s). Your interview will be slightly
                    more challenging.
                  </p>
                )}
              </div>
            </div>

            {/* Hint reveal */}
            <HintReveal questionId={questionId} onHintUsed={handleHintUsed} />

            {/* Screenshot upload */}
            {!submitted ? (
              <ScreenshotUpload questionId={questionId} onSuccess={handleSubmitSuccess} />
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-8 border border-green-500/40 bg-green-500/5 text-center"
              >
                <div className="text-4xl mb-3">🎉</div>
                <h2 className="text-xl font-bold text-green-400 mb-2">Coding round complete!</h2>
                <p className="text-slate-400 text-sm">Redirecting to your interview…</p>
                <div className="mt-4 w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </motion.div>
            )}

            {/* Navigation between questions */}
            <div className="flex justify-between pt-2">
              {prevQ ? (
                <Link
                  href={`/modules/${moduleId}/coding/${prevQ.id}`}
                  className="text-sm text-slate-500 hover:text-slate-300 transition"
                >
                  ← {prevQ.name}
                </Link>
              ) : <div />}
              {nextQ && (
                <Link
                  href={`/modules/${moduleId}/coding/${nextQ.id}`}
                  className="text-sm text-slate-500 hover:text-slate-300 transition"
                >
                  {nextQ.name} →
                </Link>
              )}
            </div>
          </div>

          {/* Right panel: chatbot */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ChatBot questionId={questionId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
