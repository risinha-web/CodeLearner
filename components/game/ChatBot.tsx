"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ChatBotProps {
  questionId: string
}

interface Message {
  id: string
  role: "user" | "ai"
  content: string
  pending?: boolean
}

export default function ChatBot({ questionId }: ChatBotProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || thinking) return

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setThinking(true)

    const aiId = crypto.randomUUID()
    setMessages((prev) => [...prev, { id: aiId, role: "ai", content: "", pending: true }])

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }))

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, messages: history }),
        signal: ctrl.signal,
      })

      if (!res.ok || !res.body) throw new Error(`API error ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })

        // Handle SSE format (data: ...\n\n) or raw text
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const payload = line.slice(6).trim()
            if (payload === "[DONE]") continue
            try {
              const parsed = JSON.parse(payload)
              const delta = parsed.delta ?? parsed.content ?? parsed.text ?? ""
              accumulated += delta
            } catch {
              accumulated += payload
            }
          } else if (line && !line.startsWith(":")) {
            accumulated += line
          }
        }

        const current = accumulated
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, content: current, pending: false } : m))
        )
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId
            ? { ...m, content: "Sorry, something went wrong. Please try again.", pending: false }
            : m
        )
      )
    } finally {
      setThinking(false)
      setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, pending: false } : m)))
    }
  }, [input, thinking, messages, questionId])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm shadow-2xl transition-all duration-200"
        style={{
          background: open
            ? "rgba(124,58,237,0.4)"
            : "linear-gradient(135deg, #7c3aed, #06b6d4)",
          boxShadow: "0 0 24px rgba(124,58,237,0.5)",
        }}
      >
        <span>{open ? "✕" : "💬"}</span>
        <span>{open ? "Close" : "Ask Tutor"}</span>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden shadow-2xl glass border border-purple-500/30"
            style={{ maxHeight: "480px" }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
              style={{ background: "rgba(124,58,237,0.2)" }}
            >
              <span className="text-xl">🤖</span>
              <div>
                <p className="text-sm font-bold text-white leading-tight">AI Tutor</p>
                <p className="text-[10px] text-purple-300">Powered by Claude</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 py-8 text-center">
                  <span className="text-3xl">💡</span>
                  <p className="text-xs text-slate-400">
                    Ask me anything about this problem — hints, strategies, or explanations!
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white rounded-br-sm"
                        : "bg-white/8 text-slate-200 rounded-bl-sm border border-white/10"
                    }`}
                  >
                    {msg.content || (msg.pending ? null : <span className="text-slate-500 italic">…</span>)}
                    {msg.pending && !msg.content && (
                      <span className="inline-flex gap-1 items-center h-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}

              {thinking && messages[messages.length - 1]?.content === "" && (
                <div className="flex items-center gap-1.5 px-2">
                  <span className="text-xs text-slate-500 italic">Thinking</span>
                  <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:300ms]" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-end gap-2 p-3 border-t border-white/10 flex-shrink-0">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question… (Enter to send)"
                rows={1}
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all"
                style={{ maxHeight: 80 }}
                disabled={thinking}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || thinking}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
