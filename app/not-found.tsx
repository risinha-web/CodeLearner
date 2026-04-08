import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a]">
      <div className="text-center">
        <div className="text-8xl font-bold gradient-text mb-4">404</div>
        <h2 className="text-2xl font-semibold text-white mb-2">Page Not Found</h2>
        <p className="text-slate-400 mb-8">This level doesn&apos;t exist yet.</p>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
