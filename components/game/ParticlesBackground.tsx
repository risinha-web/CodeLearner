"use client"

import { useMemo } from "react"

interface Particle {
  id: number
  left: string
  duration: string
  delay: string
}

export default function ParticlesBackground() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.floor(Math.random() * 101)}%`,
      duration: `${10 + Math.floor(Math.random() * 16)}s`,
      delay: `${Math.floor(Math.random() * 16)}s`,
    }))
  }, [])

  return (
    <div className="particles" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}
