"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import DifficultyBadge from "./DifficultyBadge"

export interface ModuleCardProps {
  id: string
  name: string
  description: string
  order: number
  iconKey: string
  status: "LOCKED" | "ACTIVE" | "COMPLETED"
  playerDifficulty: "EASY" | "MEDIUM" | "HARD"
  currentPhase: string
  easyScore?: number | null
  mediumScore?: number | null
  hardScore?: number | null
}

const iconMap: Record<string, string> = {
  array: "📊",
  pointer: "👆",
  window: "🪟",
  string: "📝",
  list: "🔗",
  stack: "📚",
  search: "🔍",
  tree: "🌳",
  heap: "⛰️",
  backtrack: "🔀",
  dp: "💡",
  greedy: "⚡",
  graph: "🕸️",
  misc: "🎯",
}

function getBorderStyle(status: ModuleCardProps["status"]) {
  if (status === "ACTIVE") return "border-purple-500/60 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
  if (status === "COMPLETED") return "border-green-500/60 shadow-[0_0_16px_rgba(34,197,94,0.2)]"
  return "border-white/8"
}

function getBestScore(props: ModuleCardProps): number | null {
  const scores = [props.easyScore, props.mediumScore, props.hardScore].filter(
    (s): s is number => s != null
  )
  return scores.length > 0 ? Math.max(...scores) : null
}

function ScoreColor(score: number) {
  if (score >= 80) return "text-green-400"
  if (score >= 60) return "text-yellow-400"
  return "text-red-400"
}

const CardInner = ({ props }: { props: ModuleCardProps }) => {
  const icon = iconMap[props.iconKey.toLowerCase()] ?? "🎯"
  const bestScore = getBestScore(props)
  const medScore = props.mediumScore ?? 0
  const borderClass = getBorderStyle(props.status)

  return (
    <div
      className={`glass rounded-2xl p-5 h-full flex flex-col gap-3 border-2 transition-all duration-300 ${borderClass} ${
        props.status === "LOCKED" ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ background: "rgba(124,58,237,0.15)" }}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">#{props.order}</span>
              <DifficultyBadge difficulty={props.playerDifficulty} size="sm" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 leading-tight mt-0.5">{props.name}</h3>
          </div>
        </div>

        {/* Status badge */}
        {props.status === "LOCKED" && (
          <span className="text-slate-500 text-lg flex-shrink-0" title="Locked">
            🔒
          </span>
        )}
        {props.status === "ACTIVE" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 bg-purple-500/20 text-purple-300 border border-purple-500/40 whitespace-nowrap">
            In Progress
          </span>
        )}
        {props.status === "COMPLETED" && (
          <span className="text-green-400 text-lg flex-shrink-0" title="Completed">
            ✅
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed flex-1 line-clamp-2">
        {props.description}
      </p>

      {/* Phase + best score */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Phase:{" "}
          <span className="text-cyan-400 font-semibold capitalize">{props.currentPhase}</span>
        </span>
        {props.status === "COMPLETED" && bestScore != null && (
          <span className={`font-bold ${ScoreColor(bestScore)}`}>Best: {bestScore}%</span>
        )}
      </div>

      {/* Progress bar: medium score */}
      <div className="relative h-1.5 rounded-full overflow-hidden bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${medScore}%`,
            background:
              medScore >= 80
                ? "linear-gradient(90deg,#22c55e,#4ade80)"
                : medScore >= 60
                ? "linear-gradient(90deg,#eab308,#fde047)"
                : "linear-gradient(90deg,#7c3aed,#06b6d4)",
          }}
        />
      </div>
    </div>
  )
}

export default function ModuleCard(props: ModuleCardProps) {
  if (props.status === "LOCKED") {
    return (
      <div className="cursor-not-allowed select-none">
        <CardInner props={props} />
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={`/modules/${props.id}`} className="block h-full">
        <CardInner props={props} />
      </Link>
    </motion.div>
  )
}
