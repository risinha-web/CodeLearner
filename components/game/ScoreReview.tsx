"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { gsap } from "gsap";

interface AttemptSummary {
  questionName: string;
  codingScore: number | null;
  interviewScore: number | null;
  totalScore: number | null;
  hintsUsed: number;
}

interface ScoreReviewProps {
  moduleName: string;
  moduleId: string;
  score: number;
  playerDifficulty: string;
  nextDifficulty: string;
  upgraded: boolean;
  attempts: AttemptSummary[];
  nextModuleId: string | null;
  nextModuleName: string | null;
}

function ScoreCircle({ score }: { score: number }) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!numRef.current) return;
    gsap.fromTo(
      numRef.current,
      { innerText: 0 },
      {
        innerText: score,
        duration: 1.5,
        ease: "power2.out",
        snap: { innerText: 1 },
        onUpdate() {
          if (numRef.current) {
            numRef.current.textContent = Math.round(
              parseFloat(numRef.current.textContent ?? "0")
            ).toString();
          }
        },
      }
    );
  }, [score]);

  const color =
    score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <motion.circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span ref={numRef} className="text-4xl font-extrabold" style={{ color }}>
          0
        </span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

export default function ScoreReview({
  moduleName,
  moduleId,
  score,
  playerDifficulty,
  nextDifficulty,
  upgraded,
  attempts,
  nextModuleId,
  nextModuleName,
}: ScoreReviewProps) {
  const unlockNext = score >= 80 && nextModuleId;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href={`/modules/${moduleId}`} className="text-sm text-slate-500 hover:text-slate-300 transition mb-4 inline-block">
          ← Module Overview
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-100">
          {moduleName} — Round Complete
        </h1>
      </div>

      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-8 border border-white/10 flex flex-col sm:flex-row items-center gap-8"
      >
        <ScoreCircle score={score} />
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-100 mb-1">
            {score >= 80 ? "Excellent! 🌟" : score >= 60 ? "Good Work! 👍" : "Keep Practicing! 💪"}
          </h2>
          <p className="text-slate-400 mb-4">
            Module score: <span className="font-semibold text-slate-200">{score}%</span>
          </p>

          {upgraded && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-semibold mb-3">
              🎉 Difficulty upgraded to{" "}
              <span className="capitalize">{nextDifficulty.toLowerCase()}</span>!
            </div>
          )}

          {score < 80 && (
            <p className="text-sm text-yellow-400/80">
              Score 80%+ in the{" "}
              <span className="font-semibold capitalize">{playerDifficulty.toLowerCase()}</span>{" "}
              round to unlock the next module.
            </p>
          )}
        </div>
      </motion.div>

      {/* Next module unlock */}
      {unlockNext && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 border border-green-500/30 bg-green-500/5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">
              🔓 Module Unlocked!
            </p>
            <p className="text-slate-100 font-semibold">{nextModuleName}</p>
          </div>
          <Link
            href={`/modules/${nextModuleId}`}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-400 hover:scale-105 transition-all duration-200 shrink-0"
          >
            Start Next Module →
          </Link>
        </motion.div>
      )}

      {/* Per-question breakdown */}
      <div>
        <h3 className="text-base font-bold text-slate-200 mb-4">Question Breakdown</h3>
        <div className="space-y-3">
          {attempts.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass rounded-xl px-5 py-4 border border-white/8 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{a.questionName}</p>
                {a.hintsUsed > 0 && (
                  <p className="text-xs text-yellow-400/70">{a.hintsUsed} hint(s) used</p>
                )}
              </div>
              <div className="flex items-center gap-4 shrink-0 text-xs text-slate-400">
                <span>Coding: <span className="text-slate-200 font-semibold">{a.codingScore ?? "—"}</span></span>
                <span>Interview: <span className="text-slate-200 font-semibold">{a.interviewScore != null ? Math.round(a.interviewScore) : "—"}</span></span>
                <span className={`font-bold text-sm ${(a.totalScore ?? 0) >= 80 ? "text-green-400" : (a.totalScore ?? 0) >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                  {a.totalScore != null ? `${Math.round(a.totalScore)}%` : "—"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 flex-wrap">
        <Link
          href={`/modules/${moduleId}`}
          className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-white/20 text-slate-300 hover:bg-white/5 transition"
        >
          Retry Module
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:scale-105 transition-all duration-200"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
