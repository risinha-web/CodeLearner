"use client"

import { motion } from "framer-motion"
import ModuleCard, { type ModuleCardProps } from "./ModuleCard"

interface ModuleMapProps {
  modules: ModuleCardProps[]
}

export default function ModuleMap({ modules }: ModuleMapProps) {
  return (
    <div className="relative w-full">
      {/* Subtle connecting gradient lines between unlocked modules */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
              <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((mod, index) => {
          const isUnlocked = mod.status !== "LOCKED"

          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className="relative"
            >
              {/* Connector dot on unlocked modules */}
              {isUnlocked && index > 0 && (
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full z-10"
                  style={{ background: "rgba(124,58,237,0.6)" }}
                  aria-hidden="true"
                />
              )}
              <ModuleCard {...mod} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
