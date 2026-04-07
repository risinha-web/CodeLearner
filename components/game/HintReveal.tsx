"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface HintRevealProps {
  questionId: string
  onHintUsed: (hintsUsed: number) => void
}

function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-cyan-300 font-mono text-sm">$1</code>')
    .replace(/\n\n/g, "</p><p class='mb-2'>")
    .replace(/\n/g, "<br/>")
}

export default function HintReveal({ questionId, onHintUsed }: HintRevealProps) {
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [hintContent, setHintContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flipped, setFlipped] = useState(false)

  const maxHints = 2
  const isDisabled = hintsUsed >= maxHints

  async function confirmHint() {
    setShowModal(false)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/questions/${questionId}/hint`, { method: "POST" })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      const newCount = hintsUsed + 1
      setHintsUsed(newCount)
      setHintContent(data.hint ?? data.content ?? JSON.stringify(data))
      setFlipped(true)
      onHintUsed(newCount)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch hint")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Button row */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => !isDisabled && setShowModal(true)}
          disabled={isDisabled || loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
            isDisabled
              ? "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed"
              : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-500/30 hover:shadow-[0_0_16px_rgba(234,179,8,0.3)]"
          }`}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
          ) : (
            <span>💡</span>
          )}
          {loading ? "Fetching hint…" : "Get Hint"}
        </button>

        {hintsUsed > 0 && (
          <span className="text-xs text-slate-400">
            {hintsUsed}/{maxHints} hints used
          </span>
        )}

        {isDisabled && (
          <span className="text-xs text-red-400 font-medium">
            ⚠ Maximum hints reached — interview difficulty increased
          </span>
        )}
      </div>

      {/* Hint card with flip animation */}
      <AnimatePresence>
        {hintContent && flipped && (
          <motion.div
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ perspective: 1000 }}
            className="mt-4 glass rounded-2xl p-5 border border-yellow-500/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-400 text-lg">💡</span>
              <span className="text-sm font-bold text-yellow-300">Hint {hintsUsed}</span>
              <span className="ml-auto text-xs text-slate-500">
                -{(hintsUsed) * 20} pts interview score
              </span>
            </div>
            <div
              className="text-sm text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: `<p class='mb-2'>${simpleMarkdownToHtml(hintContent)}</p>`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Confirmation modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 max-w-sm w-full border border-yellow-500/30 shadow-2xl"
            >
              <div className="text-4xl text-center mb-3">⚠️</div>
              <h2 className="text-lg font-bold text-white text-center mb-2">Use a Hint?</h2>
              <p className="text-sm text-slate-400 text-center mb-6">
                Using a hint will increase your interview difficulty and reduce your final score.
                Continue?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 border border-white/15 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmHint}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-500/30 transition-all"
                >
                  Yes, show hint
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
