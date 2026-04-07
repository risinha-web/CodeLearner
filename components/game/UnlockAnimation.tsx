"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface UnlockAnimationProps {
  moduleName: string
  onDone: () => void
}

export default function UnlockAnimation({ moduleName, onDone }: UnlockAnimationProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <AnimatePresence>
      <motion.div
        key="unlock"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onDone}
      >
        {/* Stars */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl pointer-events-none select-none"
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              x: (Math.random() - 0.5) * 600,
              y: (Math.random() - 0.5) * 400,
            }}
            transition={{ duration: 1.5, delay: i * 0.05, ease: "easeOut" }}
          >
            {["⭐", "✨", "🎉", "💫"][i % 4]}
          </motion.div>
        ))}

        {/* Main card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="glass rounded-3xl p-10 text-center max-w-sm border-2 border-purple-500/50"
          style={{ boxShadow: "0 0 60px rgba(124,58,237,0.4)" }}
        >
          <div className="text-6xl mb-4">🔓</div>
          <h2 className="text-2xl font-extrabold gradient-text mb-2">Module Unlocked!</h2>
          <p className="text-slate-300">
            <span className="font-bold text-white">{moduleName}</span> is now available.
          </p>
          <p className="text-xs text-slate-500 mt-4">Click anywhere to continue</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
