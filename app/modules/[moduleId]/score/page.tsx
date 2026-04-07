import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  computeModuleScore,
  shouldUpgradeDifficulty,
  getUpgradedDifficulty,
  isModuleUnlocked,
} from "@/lib/game-logic";
import Navbar from "@/components/game/Navbar";
import ScoreReview from "@/components/game/ScoreReview";

export default async function ScorePage({
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

  const progress = await prisma.moduleProgress.findUnique({
    where: { userId_moduleId: { userId: dbUser.id, moduleId } },
  });
  if (!progress) redirect(`/modules/${moduleId}`);

  const attempts = await prisma.questionAttempt.findMany({
    where: { userId: dbUser.id, questionId: { in: mod.questions.map((q) => q.id) } },
  });

  const moduleScore = computeModuleScore(attempts);

  // Save score to correct tier and potentially upgrade difficulty
  const pd = progress.playerDifficulty;
  const scoreField =
    pd === "EASY" ? "easyScore" : pd === "MEDIUM" ? "mediumScore" : "hardScore";
  const upgrade = shouldUpgradeDifficulty(moduleScore, pd);
  const nextDifficulty = upgrade ? getUpgradedDifficulty(pd) : pd;

  const updatedProgress = await prisma.moduleProgress.update({
    where: { userId_moduleId: { userId: dbUser.id, moduleId } },
    data: {
      [scoreField]: moduleScore,
      playerDifficulty: nextDifficulty,
      currentPhase: moduleScore >= 80 ? "COMPLETED" : "SCORE_REVIEW",
      status: moduleScore >= 80 ? "COMPLETED" : "ACTIVE",
      completedAt: moduleScore >= 80 ? new Date() : null,
    },
  });

  // Check if next module should be unlocked
  const nextModule = await prisma.module.findFirst({ where: { order: mod.order + 1 } });
  const nextUnlocked = nextModule
    ? isModuleUnlocked(nextModule.order, updatedProgress.mediumScore)
    : false;

  return (
    <div className="min-h-screen">
      <Navbar user={{ name: session.user.name, picture: session.user.picture }} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <ScoreReview
          moduleName={mod.name}
          moduleId={moduleId}
          score={moduleScore}
          playerDifficulty={pd}
          nextDifficulty={nextDifficulty}
          upgraded={upgrade}
          attempts={attempts.map((a) => ({
            questionName: mod.questions.find((q) => q.id === a.questionId)?.name ?? "Unknown",
            codingScore: a.codingScore,
            interviewScore: a.interviewScore,
            totalScore: a.totalScore,
            hintsUsed: a.hintsUsed,
          }))}
          nextModuleId={nextUnlocked && nextModule ? nextModule.id : null}
          nextModuleName={nextUnlocked && nextModule ? nextModule.name : null}
        />
      </main>
    </div>
  );
}
