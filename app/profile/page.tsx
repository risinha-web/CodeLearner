"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/game/Navbar";
import Link from "next/link";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  leetcodeUsername: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [leetcode, setLeetcode] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authUser, setAuthUser] = useState<{ name?: string; picture?: string } | null>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        setLeetcode(d.user?.leetcodeUsername ?? "");
        setAuthUser({ name: d.user?.name ?? undefined, picture: d.user?.avatarUrl ?? undefined });
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leetcodeUsername: leetcode.trim() }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="min-h-screen">
      <Navbar user={authUser ?? undefined} />
      <main className="max-w-2xl mx-auto px-4 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 border border-white/10"
        >
          <h1 className="text-2xl font-bold text-slate-100 mb-6">My Profile</h1>

          {user ? (
            <>
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-8">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name ?? "avatar"}
                    className="w-16 h-16 rounded-full border-2 border-purple-500/50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-purple-600/30 flex items-center justify-center text-2xl font-bold text-purple-300">
                    {(user.name ?? user.email)[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-slate-100">{user.name ?? "—"}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              </div>

              {/* LeetCode link */}
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    LeetCode Username
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Link your LeetCode account to track your progress across the
                    game. Problems will open directly in LeetCode for you to solve.
                  </p>
                  <input
                    type="text"
                    value={leetcode}
                    onChange={(e) => setLeetcode(e.target.value)}
                    placeholder="e.g. john_doe123"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition"
                  />
                </div>

                {user.leetcodeUsername && (
                  <p className="text-xs text-cyan-400">
                    ✓ Currently linked:{" "}
                    <a
                      href={`https://leetcode.com/${user.leetcodeUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-cyan-300"
                    >
                      leetcode.com/{user.leetcodeUsername}
                    </a>
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  {saved && (
                    <span className="text-sm text-green-400 font-medium">✓ Saved!</span>
                  )}
                </div>
              </form>

              <div className="mt-8 pt-8 border-t border-white/10">
                <Link
                  href="/dashboard"
                  className="text-sm text-purple-400 hover:text-purple-300 transition"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </>
          ) : (
            <div className="animate-pulse space-y-4">
              <div className="h-16 w-16 rounded-full bg-white/10" />
              <div className="h-4 w-48 rounded bg-white/10" />
              <div className="h-10 rounded-lg bg-white/10" />
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
