"use client"

import { motion } from "framer-motion"

interface PhaseTimelineProps {
  currentPhase: string
}

const PHASES = ["Intro", "Preliminary", "Coding", "Interview"] as const
type Phase = (typeof PHASES)[number]

function normalise(phase: string): Phase | null {
  const map: Record<string, Phase> = {
    intro: "Intro",
    preliminary: "Preliminary",
    coding: "Coding",
    interview: "Interview",
  }
  return map[phase.toLowerCase()] ?? null
}

function getPhaseStatus(phase: Phase, current: Phase | null) {
  if (!current) return "future"
  const currentIndex = PHASES.indexOf(current)
  const phaseIndex = PHASES.indexOf(phase)
  if (phaseIndex < currentIndex) return "completed"
  if (phaseIndex === currentIndex) return "active"
  return "future"
}

export default function PhaseTimeline({ currentPhase }: PhaseTimelineProps) {
  const current = normalise(currentPhase)

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="flex items-center min-w-max mx-auto px-4 sm:px-0 sm:w-full sm:min-w-0 sm:justify-center gap-0">
        {PHASES.map((phase, index) => {
          const status = getPhaseStatus(phase, current)
          const isLast = index === PHASES.length - 1

          return (
            <div key={phase} className="flex items-center">
              {/* Phase node */}
              <div className="flex flex-col items-center gap-1.5 relative">
                {/* Circle */}
                <div className="relative">
                  {status === "active" && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: "rgba(124,58,237,0.4)" }}
                      animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                      status === "active"
                        ? "bg-purple-600 border-purple-400 shadow-[0_0_16px_rgba(124,58,237,0.6)] text-white"
                        : status === "completed"
                        ? "bg-green-600/30 border-green-500 text-green-400"
                        : "bg-white/5 border-white/15 text-slate-500"
                    }`}
                  >
                    {status === "completed" ? (
                      <span className="text-green-400 text-base">✓</span>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </motion.div>
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] font-semibold tracking-wide whitespace-nowrap transition-colors duration-300 ${
                    status === "active"
                      ? "text-purple-300"
                      : status === "completed"
                      ? "text-green-400"
                      : "text-slate-600"
                  }`}
                >
                  {phase}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="w-12 sm:w-16 h-px mx-1 relative flex-shrink-0 overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 rounded-full" />
                  {getPhaseStatus(PHASES[index + 1], current) !== "future" && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }}
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.15 + 0.3, duration: 0.5, ease: "easeOut" }}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
