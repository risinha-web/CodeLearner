"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

interface ProgressRingProps {
  score: number
  size?: number
  label?: string
}

function getRingColor(score: number): string {
  if (score >= 80) return "#22c55e"
  if (score >= 60) return "#eab308"
  return "#ef4444"
}

export default function ProgressRing({ score, size = 100, label }: ProgressRingProps) {
  const clampedScore = Math.max(0, Math.min(100, score))
  const strokeWidth = size * 0.08
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const ringColor = getRingColor(clampedScore)

  const circleRef = useRef<SVGCircleElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const targetOffset = circumference - (clampedScore / 100) * circumference

    if (circleRef.current) {
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: circumference },
        {
          strokeDashoffset: targetOffset,
          duration: 1.4,
          ease: "power2.out",
        }
      )
    }

    if (countRef.current) {
      const obj = { val: 0 }
      gsap.to(obj, {
        val: clampedScore,
        duration: 1.4,
        ease: "power2.out",
        onUpdate() {
          if (countRef.current) {
            countRef.current.textContent = Math.round(obj.val).toString()
          }
        },
      })
    }
  }, [clampedScore, circumference])

  const cx = size / 2
  const cy = size / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg]"
        >
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            ref={circleRef}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{ filter: `drop-shadow(0 0 6px ${ringColor})` }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            ref={countRef}
            className="font-extrabold leading-none tabular-nums"
            style={{
              fontSize: size * 0.24,
              color: ringColor,
            }}
          >
            0
          </span>
          <span
            className="text-slate-400 leading-none"
            style={{ fontSize: size * 0.11 }}
          >
            %
          </span>
        </div>
      </div>

      {label && (
        <span className="text-xs text-slate-400 font-medium tracking-wide text-center">
          {label}
        </span>
      )}
    </div>
  )
}
