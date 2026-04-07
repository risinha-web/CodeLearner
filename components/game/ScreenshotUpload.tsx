"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface ScreenshotUploadProps {
  questionId: string
  onSuccess: (url: string) => void
}

type UploadState = "idle" | "dragging" | "preview" | "loading" | "success" | "error"

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]

export default function ScreenshotUpload({ questionId, onSuccess }: ScreenshotUploadProps) {
  const [state, setState] = useState<UploadState>("idle")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successUrl, setSuccessUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function pickFile(f: File) {
    if (!ACCEPTED.includes(f.type)) {
      setErrorMsg("Only PNG, JPG, GIF or WebP images are accepted.")
      setState("error")
      return
    }
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setState("preview")
    setErrorMsg(null)
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setState("idle")
    const dropped = e.dataTransfer.files[0]
    if (dropped) pickFile(dropped)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setState("dragging")
  }, [])

  const handleDragLeave = useCallback(() => {
    setState((s) => (s === "dragging" ? "idle" : s))
  }, [])

  async function submitProof() {
    if (!file) return
    setState("loading")
    setErrorMsg(null)
    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("questionId", questionId)

      const res = await fetch("/api/submissions", { method: "POST", body: formData })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Upload failed (${res.status})`)
      }
      const data = await res.json()
      const url: string = data.url ?? data.imageUrl ?? ""
      setSuccessUrl(url)
      setState("success")
      onSuccess(url)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Upload failed")
      setState("error")
    }
  }

  function reset() {
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setErrorMsg(null)
    setState("idle")
    setSuccessUrl(null)
  }

  const isDragging = state === "dragging"

  return (
    <div className="w-full space-y-4">
      {/* Drop zone (shown when not previewing / success) */}
      {state !== "success" && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => state !== "loading" && inputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 p-8 ${
            isDragging
              ? "border-purple-400 bg-purple-500/10 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
              : "border-white/20 bg-white/3 hover:border-purple-500/60 hover:bg-purple-500/5"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) pickFile(f)
            }}
          />

          <AnimatePresence mode="wait">
            {previewUrl && file ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full max-h-48 rounded-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={previewUrl}
                  alt="Upload preview"
                  width={600}
                  height={300}
                  className="w-full h-auto max-h-48 object-contain rounded-xl"
                />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-2 text-center select-none"
              >
                <span className="text-4xl">📸</span>
                <span className="text-sm font-semibold text-slate-300">
                  {isDragging ? "Drop it here!" : "Drag & drop your screenshot"}
                </span>
                <span className="text-xs text-slate-500">or click to browse — PNG, JPG, GIF, WebP</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Error message */}
      {state === "error" && errorMsg && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <span>❌</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success state */}
      <AnimatePresence>
        {state === "success" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-3 py-6 glass rounded-2xl border border-green-500/30"
          >
            <motion.span
              className="text-5xl"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: 2, duration: 0.4 }}
            >
              ✅
            </motion.span>
            <span className="text-sm font-bold text-green-400">Screenshot uploaded!</span>
            {successUrl && (
              <a
                href={successUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 underline"
              >
                View submission
              </a>
            )}
            <button
              onClick={reset}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1"
            >
              Upload another
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      {(state === "preview" || state === "error" || state === "loading") && file && (
        <div className="flex gap-3">
          <button
            onClick={reset}
            disabled={state === "loading"}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 border border-white/15 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Remove
          </button>
          <button
            onClick={submitProof}
            disabled={state === "loading"}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              boxShadow: state === "loading" ? "none" : "0 0 20px rgba(124,58,237,0.4)",
            }}
          >
            {state === "loading" ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <span>🚀</span>
                Submit Proof
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
