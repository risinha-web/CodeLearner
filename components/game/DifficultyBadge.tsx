interface DifficultyBadgeProps {
  difficulty: "EASY" | "MEDIUM" | "HARD" | string
  size?: "sm" | "md"
}

const colorMap: Record<string, string> = {
  EASY: "bg-green-500/20 text-green-400 border-green-500/40",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  HARD: "bg-red-500/20 text-red-400 border-red-500/40",
}

const sizeMap = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
}

export default function DifficultyBadge({ difficulty, size = "sm" }: DifficultyBadgeProps) {
  const colorClass = colorMap[difficulty.toUpperCase()] ?? "bg-slate-500/20 text-slate-400 border-slate-500/40"
  const sizeClass = sizeMap[size]

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border tracking-wide uppercase ${colorClass} ${sizeClass}`}
    >
      {difficulty}
    </span>
  )
}
