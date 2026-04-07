"use client";

import { motion } from "framer-motion";
import ParticlesBackground from "@/components/game/ParticlesBackground";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <ParticlesBackground />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 text-sm font-semibold mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          AI-Powered Coding Game
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6"
        >
          Level Up Your{" "}
          <span className="gradient-text">Coding Skills</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Master 59 curated LeetCode problems across 14 topic modules. Solve
          challenges, get AI-coached interviews, and track your progression from
          beginner to advanced.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/auth/login?screen_hint=signup"
            className="px-8 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-200"
          >
            Start Learning Free →
          </a>
          <a
            href="/auth/login"
            className="px-8 py-3.5 rounded-xl font-bold text-base border border-white/20 text-slate-200 hover:border-purple-500/60 hover:bg-white/5 transition-all duration-200"
          >
            Log In
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mt-14"
        >
          {[
            "🎯 14 Topic Modules",
            "🔢 59 LeetCode Problems",
            "🤖 AI Interview Simulator",
            "🎙️ Voice-Based Interviews",
            "💡 Smart Hints",
            "📈 Adaptive Difficulty",
          ].map((f) => (
            <span key={f} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-sm">
              {f}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0d0d1a] to-transparent pointer-events-none" />
    </div>
  );
}
