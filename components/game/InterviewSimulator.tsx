"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface InterviewSimulatorProps {
  questionId: string
  questionName: string
  moduleName: string
  difficulty: string
  hintsUsed: number
  onComplete: (
    score: number,
    feedback: string,
    strengths: string[],
    improvements: string[]
  ) => void
}

interface Message {
  role: "assistant" | "user"
  content: string
  ts: string
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  readonly isFinal: boolean
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

export default function InterviewSimulator({
  questionId,
  questionName,
  moduleName,
  difficulty,
  hintsUsed,
  onComplete,
}: InterviewSimulatorProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [questionsAsked, setQuestionsAsked] = useState(0)
  const [streamingText, setStreamingText] = useState("")
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState(false)
  const [transcript, setTranscript] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Start camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        setCameraStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch(() => {
        setCameraError(true)
      })

    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Attach stream to video element when both are ready
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  // Auto scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [messages, streamingText])

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    synthRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  // Start interview on mount
  useEffect(() => {
    const startInterview = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/interview/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId }),
        })
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let fullText = ""
        let sid = ""

        if (!reader) return

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.text) {
                  fullText += data.text
                  setStreamingText(fullText)
                }
                if (data.done && data.sessionId) {
                  sid = data.sessionId
                }
              } catch {}
            }
          }
        }

        setSessionId(sid)
        setStreamingText("")
        setMessages([{ role: "assistant", content: fullText, ts: new Date().toISOString() }])
        setQuestionsAsked(1)
        speakText(fullText)
      } finally {
        setIsLoading(false)
      }
    }

    startInterview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !sessionId || isLoading) return

      const userMsg: Message = { role: "user", content: text, ts: new Date().toISOString() }
      setMessages((prev) => [...prev, userMsg])
      setInputText("")
      setTranscript("")
      setIsLoading(true)

      try {
        const res = await fetch("/api/interview/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, userMessage: text }),
        })

        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let fullText = ""

        if (!reader) return

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.text) {
                  fullText += data.text
                  setStreamingText(fullText)
                }
                if (data.done) {
                  setStreamingText("")
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: fullText, ts: new Date().toISOString() },
                  ])
                  setQuestionsAsked((q) => q + 1)
                  speakText(fullText)

                  if (data.isComplete) {
                    onComplete(
                      data.score ?? 0,
                      data.feedback ?? "",
                      data.strengths ?? [],
                      data.improvements ?? []
                    )
                  }
                }
              } catch {}
            }
          }
        }
      } finally {
        setIsLoading(false)
      }
    },
    [sessionId, isLoading, speakText, onComplete]
  )

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ""
      let final = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript
        } else {
          interim += event.results[i][0].transcript
        }
      }
      setTranscript((prev) => prev + final + interim)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const handleSendTranscript = useCallback(() => {
    if (transcript.trim()) {
      sendMessage(transcript.trim())
    }
  }, [transcript, sendMessage])

  const hasSpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0d0d1a] relative">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0"
        style={{ background: "rgba(13,13,26,0.95)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">
            AI Interview
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-300 font-semibold">{questionName}</span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-500">{moduleName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Question{" "}
            <span className="text-cyan-400 font-bold">{Math.min(questionsAsked, 5)}</span>
            {" "}of{" "}
            <span className="text-slate-300 font-bold">5</span>
          </span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-6 h-1.5 rounded-full transition-all duration-500"
                style={{
                  background:
                    i < questionsAsked
                      ? "linear-gradient(90deg, #7c3aed, #06b6d4)"
                      : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
          {hintsUsed > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              {hintsUsed} hint{hintsUsed > 1 ? "s" : ""} used
            </span>
          )}
        </div>
      </div>

      {/* Main video area */}
      <div className="flex flex-1 min-h-0 gap-4 p-4">
        {/* Left: Video + transcript */}
        <div className="flex flex-col flex-1 min-h-0 gap-4">
          {/* AI Avatar */}
          <div
            className="relative flex items-center justify-center rounded-2xl overflow-hidden flex-shrink-0"
            style={{
              height: "220px",
              background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.05))",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            {/* Animated background grid */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            {/* Avatar circle */}
            <div className={`relative flex flex-col items-center gap-3 ${isSpeaking ? "avatar-speaking" : ""}`}>
              {/* Pulse rings behind avatar */}
              {isSpeaking && (
                <>
                  <div
                    className="absolute rounded-full pulse-ring"
                    style={{
                      width: "120px",
                      height: "120px",
                      border: "2px solid rgba(6,182,212,0.4)",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                  <div
                    className="absolute rounded-full pulse-ring"
                    style={{
                      width: "120px",
                      height: "120px",
                      border: "2px solid rgba(124,58,237,0.3)",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      animationDelay: "0.4s",
                    }}
                  />
                </>
              )}

              {/* Avatar circle with gradient border */}
              <div
                className="avatar-glow relative flex items-center justify-center rounded-full text-3xl select-none transition-all duration-300"
                style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #1a0a3a, #0a1a2e)",
                  boxShadow: isSpeaking
                    ? "0 0 40px rgba(6,182,212,0.6), 0 0 80px rgba(124,58,237,0.3)"
                    : "0 0 20px rgba(124,58,237,0.25)",
                  border: isSpeaking
                    ? "2px solid rgba(6,182,212,0.8)"
                    : "2px solid rgba(124,58,237,0.5)",
                }}
              >
                👤
              </div>

              <div className="text-center">
                <p className="text-sm font-bold text-white">Alex</p>
                <p className="text-xs text-slate-400">AI Interviewer</p>
              </div>

              {/* Waveform animation */}
              {isSpeaking && (
                <div className="flex items-center gap-0.5 h-5">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full"
                      style={{ background: "linear-gradient(180deg, #06b6d4, #7c3aed)" }}
                      animate={{
                        height: ["4px", "16px", "6px", "20px", "4px"],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.08,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* LIVE badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Live</span>
            </div>
          </div>

          {/* Transcript / chat */}
          <div
            ref={transcriptRef}
            className="flex-1 min-h-0 overflow-y-auto rounded-xl p-4 space-y-3"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {isLoading && messages.length === 0 && (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-purple-400"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <span>Alex is preparing your interview...</span>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                    style={{
                      background:
                        msg.role === "assistant"
                          ? "linear-gradient(135deg, #7c3aed, #06b6d4)"
                          : "rgba(255,255,255,0.1)",
                    }}
                  >
                    {msg.role === "assistant" ? "👤" : "🧑"}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "assistant"
                        ? "text-slate-200 rounded-tl-none"
                        : "text-slate-200 rounded-tr-none"
                    }`}
                    style={{
                      background:
                        msg.role === "assistant"
                          ? "rgba(124,58,237,0.12)"
                          : "rgba(6,182,212,0.1)",
                      border:
                        msg.role === "assistant"
                          ? "1px solid rgba(124,58,237,0.2)"
                          : "1px solid rgba(6,182,212,0.2)",
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Streaming assistant message */}
            {streamingText && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
                >
                  👤
                </div>
                <div
                  className="max-w-[80%] rounded-xl rounded-tl-none px-3 py-2 text-sm leading-relaxed text-slate-200"
                  style={{
                    background: "rgba(124,58,237,0.12)",
                    border: "1px solid rgba(124,58,237,0.2)",
                  }}
                >
                  {streamingText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 align-middle"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right: Camera pip + input */}
        <div className="flex flex-col w-64 flex-shrink-0 gap-4">
          {/* Camera feed */}
          <div
            className="relative rounded-2xl overflow-hidden flex-shrink-0"
            style={{
              height: "160px",
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(6,182,212,0.2)",
            }}
          >
            {!cameraError ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
                <span className="text-2xl">🎥</span>
                <span className="text-xs text-center px-2">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="text-xs text-white/70 bg-black/50 px-2 py-0.5 rounded-full">You</span>
              {!cameraError && (
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </div>
          </div>

          {/* Voice transcript preview */}
          {(isListening || transcript) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-3 text-sm text-slate-300"
              style={{
                background: "rgba(6,182,212,0.08)",
                border: "1px solid rgba(6,182,212,0.2)",
                minHeight: "60px",
              }}
            >
              {isListening && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wide">
                    Listening…
                  </span>
                </div>
              )}
              <p className="text-xs leading-relaxed text-slate-300">
                {transcript || <span className="text-slate-500 italic">Start speaking…</span>}
              </p>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {hasSpeechRecognition && (
              <div className="flex gap-2">
                {!isListening ? (
                  <button
                    onClick={startListening}
                    disabled={isLoading || !sessionId}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                      boxShadow: "0 0 16px rgba(124,58,237,0.35)",
                    }}
                  >
                    🎤 Speak
                  </button>
                ) : (
                  <button
                    onClick={stopListening}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{
                      background: "rgba(239,68,68,0.2)",
                      border: "1px solid rgba(239,68,68,0.4)",
                    }}
                  >
                    ⏹ Stop
                  </button>
                )}
                {transcript && !isListening && (
                  <button
                    onClick={handleSendTranscript}
                    disabled={isLoading}
                    className="px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40"
                    style={{
                      background: "rgba(6,182,212,0.2)",
                      border: "1px solid rgba(6,182,212,0.4)",
                    }}
                  >
                    ➤
                  </button>
                )}
              </div>
            )}

            {/* Text input fallback */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(inputText)
                }
              }}
              placeholder="Type your answer… (Enter to send)"
              disabled={isLoading || !sessionId}
              rows={3}
              className="w-full rounded-xl px-3 py-2.5 text-sm resize-none outline-none transition-all duration-200 placeholder:text-slate-500 text-slate-200 disabled:opacity-40"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading || !sessionId}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                boxShadow: "0 0 16px rgba(124,58,237,0.3)",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Thinking...
                </span>
              ) : (
                "Send Answer"
              )}
            </button>
          </div>

          {/* Difficulty info */}
          <div
            className="rounded-xl p-3 text-xs text-slate-400 flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex justify-between mb-1">
              <span>Difficulty</span>
              <span className="text-purple-400 font-semibold">{difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span>Hints used</span>
              <span className={hintsUsed > 0 ? "text-yellow-400" : "text-green-400"}>
                {hintsUsed}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
