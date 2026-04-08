"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/game/Navbar";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export default function IntroPage() {
  const router = useRouter();
  const params = useParams<{ moduleId: string }>();
  const moduleId = params.moduleId;

  const [mod, setMod] = useState<{ name: string; introContent: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/modules/${moduleId}`)
      .then((r) => r.json())
      .then((d) => setMod(d.module));
  }, [moduleId]);

  async function handleStart() {
    setLoading(true);
    await fetch(`/api/modules/${moduleId}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase: "PRELIMINARY" }),
    });
    router.push(`/modules/${moduleId}/preliminary`);
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <Link href={`/modules/${moduleId}`} className="text-sm text-slate-500 hover:text-slate-300 transition mb-6 inline-block">
          ← Module Overview
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider uppercase">
            Phase 1 — Introduction
          </div>
        </div>

        {mod ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-extrabold text-slate-100 mb-8">{mod.name}</h1>

            <div className="glass rounded-2xl p-8 border border-white/10 prose prose-invert prose-slate max-w-none mb-10
              prose-headings:text-slate-100 prose-p:text-slate-300 prose-code:text-cyan-300
              prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
              prose-strong:text-slate-100 prose-li:text-slate-300">
              <ReactMarkdown>{mod.introContent}</ReactMarkdown>
            </div>

            <button
              onClick={handleStart}
              disabled={loading}
              className="px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/30 hover:scale-105 hover:shadow-purple-500/50 transition-all duration-200 disabled:opacity-60"
            >
              {loading ? "Loading…" : "Start Preliminary Quiz →"}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-64 rounded bg-white/10" />
            <div className="h-96 rounded-2xl bg-white/5" />
          </div>
        )}
      </main>
    </div>
  );
}
