export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
        </div>
        <p className="text-slate-400 text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
