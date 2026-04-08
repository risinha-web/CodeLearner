"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface NavbarUser {
  name?: string | null
  email?: string | null
  picture?: string | null
  avatarUrl?: string | null
  leetcodeUsername?: string | null
}

interface NavbarProps {
  user?: NavbarUser
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return "??"
}

export default function Navbar({ user }: NavbarProps) {
  const email = user?.email ?? ""
  const initials = getInitials(user?.name ?? undefined, email ?? undefined)
  const displayName = user?.name || email?.split("@")[0] || "User"
  const avatarSrc = user?.picture ?? user?.avatarUrl ?? null

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 glass border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Beta badge */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold tracking-tight gradient-text select-none">
              CodeLearner
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest"
              style={{
                background: "rgba(124,58,237,0.2)",
                border: "1px solid rgba(124,58,237,0.5)",
                color: "#a78bfa",
              }}
            >
              β
            </span>
          </div>

          {/* Right: Avatar + Username + Sign out */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                boxShadow: "0 0 12px rgba(124,58,237,0.4)",
              }}
            >
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={displayName}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <span className="text-white leading-none">{initials}</span>
              )}
            </div>

            {/* Username */}
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-200">{displayName}</span>
              {user?.leetcodeUsername && (
                <span className="text-xs text-slate-400">@{user.leetcodeUsername}</span>
              )}
            </div>

            {/* Sign out */}
            <a
              href="/auth/logout"
              className="ml-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 text-slate-400 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/5"
            >
              Sign out
            </a>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
