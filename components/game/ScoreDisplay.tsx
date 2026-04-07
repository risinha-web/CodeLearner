"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface ScoreDisplayProps {
  score: number
  label?: string
  size?: "sm" | "md" | "lg"
  showBar?: boolean
}

function scoreColor(s: number) {
  if (s >= 80) return "#22c55e"
  if (s >= 60) return "#eab308"
  return "#ef4444"
}

export default function ScoreDisplay({ score, label = "Score", size = "md", showBar = true }: ScoreDisplayProps) {
  const numRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = numRef.current
    if (!el) return
    let start = 0
    const duration = 1200
    const startTime = performance.now()
    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(score * eased)
      if (el) el.textContent = String(start)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score])

  const color = scoreColor(score)
  const sizes = { sm: "text-2xl", md: "text-5xl", lg: "text-7xl" }

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className={`font-extrabold tabular-nums ${sizes[size]}`}
        style={{ color }}
      >
        <span ref={numRef}>0</span>
        <span className="text-[0.4em] ml-0.5">%</span>
      </motion.div>

      <p className="text-sm text-slate-400 font-medium">{label}</p>

      {showBar && (
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          />
        </div>
      )}
    </div>
  )
}
