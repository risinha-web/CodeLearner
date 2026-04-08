import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isModuleUnlocked } from "@/lib/game-logic";
import Navbar from "@/components/game/Navbar";
import PhaseTimeline from "@/components/game/PhaseTimeline";
import DifficultyBadge from "@/components/game/DifficultyBadge";
import Link from "next/link";

export default async function ModuleOverviewPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login");

  const { moduleId } = await params;

  const dbUser = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!dbUser) redirect("/dashboard");

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { questions: { orderBy: { orderInModule: "asc" } } },
  });
  if (!mod) redirect("/dashboard");

  // Check unlock
  let prevMedium: number | null = null;
  if (mod.order > 1) {
    const prev = await prisma.module.findFirst({ where: { order: mod.order - 1 } });
    if (prev) {
      const prevProg = await prisma.moduleProgress.findUnique({
        where: { userId_moduleId: { userId: dbUser.id, moduleId: prev.id } },
      });
      prevMedium = prevProg?.mediumScore ?? null;
    }
  }
  const unlocked = isModuleUnlocked(mod.order, prevMedium);
  if (!unlocked) redirect("/dashboard");

  const progress = await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId: dbUser.id, moduleId } },
    create: { userId: dbUser.id, moduleId, status: "ACTIVE" },
    update: { status: "ACTIVE" },
  });

  const attempts = await prisma.questionAttempt.findMany({
    where: { userId: dbUser.id, questionId: { in: mod.questions.map((q) => q.id) } },
  });
  const attemptMap = new Map(attempts.map((a) => [a.questionId, a]));

  const completedCount = attempts.filter((a) => a.codingCompleted && a.interviewScore != null).length;
  const totalCount = mod.questions.length;

  const phaseOrder = ["INTRO", "PRELIMINARY", "CODING", "INTERVIEW", "SCORE_REVIEW", "COMPLETED"];
  const currentPhaseIndex = phaseOrder.indexOf(progress.currentPhase);

  // Determine CTA
  let ctaHref = `/modules/${moduleId}/intro`;
  let ctaLabel = "Start Introduction";
  if (progress.currentPhase === "PRELIMINARY") {
    ctaHref = `/modules/${moduleId}/preliminary`;
    ctaLabel = "Continue Preliminary Quiz";
  } else if (progress.currentPhase === "CODING" || progress.currentPhase === "INTERVIEW") {
    const current = progress.currentQuestionId ?? mod.questions[0]?.id;
    ctaHref = `/modules/${moduleId}/coding/${current}`;
    ctaLabel = "Continue Coding Round";
  } else if (progress.currentPhase === "SCORE_REVIEW" || progress.currentPhase === "COMPLETED") {
    ctaHref = `/modules/${moduleId}/score`;
    ctaLabel = "View Score";
  }

  return (
    <div className="min-h-screen">
      <Navbar user={{ name: session.user.name, picture: session.user.picture }} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-300 transition mb-4 inline-block">
            ← Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-slate-100">{mod.name}</h1>
            <DifficultyBadge difficulty={progress.playerDifficulty} />
          </div>
          <p className="text-slate-400 max-w-2xl">{mod.description}</p>
          <p className="text-xs text-slate-500 mt-2">
            {completedCount} / {totalCount} questions completed
          </p>
        </div>

        {/* Phase timeline */}
        <div className="mb-8">
          <PhaseTimeline currentPhase={progress.currentPhase} />
        </div>

        {/* CTA */}
        {currentPhaseIndex < phaseOrder.indexOf("COMPLETED") && (
          <div className="mb-10">
            <Link
              href={ctaHref}
              className="inline-flex px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/30 hover:scale-105 hover:shadow-purple-500/50 transition-all duration-200"
            >
              {ctaLabel} →
            </Link>
          </div>
        )}

        {/* Question list */}
        <div>
          <h2 className="text-lg font-bold text-slate-200 mb-4">
            Questions ({totalCount})
          </h2>
          <div className="grid gap-3">
            {mod.questions.map((q) => {
              const attempt = attemptMap.get(q.id);
              const done = attempt?.codingCompleted && attempt?.interviewScore != null;
              const coding = attempt?.codingCompleted && !done;

              return (
                <div
                  key={q.id}
                  className="glass rounded-xl px-5 py-4 flex items-center justify-between border border-white/8"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-slate-500 w-6 shrink-0">
                      {q.orderInModule}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{q.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {q.topics.join(" · ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <DifficultyBadge difficulty={q.difficulty} size="sm" />
                    {done ? (
                      <span className="text-xs font-bold text-green-400">✓ Done</span>
                    ) : coding ? (
                      <span className="text-xs font-bold text-yellow-400">Coding ✓</span>
                    ) : (
                      <span className="text-xs text-slate-600">Not started</span>
                    )}
                    {attempt?.totalScore != null && (
                      <span className="text-xs font-bold text-purple-400">
                        {Math.round(attempt.totalScore)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
