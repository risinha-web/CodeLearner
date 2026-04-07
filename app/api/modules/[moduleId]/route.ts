import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";
import { isModuleUnlocked } from "@/lib/game-logic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ moduleId: string }> }
) {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { moduleId } = await ctx.params;

  const user = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { questions: { orderBy: { orderInModule: "asc" } } },
  });
  if (!mod) return Response.json({ error: "Module not found" }, { status: 404 });

  const progress = await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId: user.id, moduleId } },
    create: { userId: user.id, moduleId, status: "LOCKED" },
    update: {},
  });

  // Check unlock status
  let prevMediumScore: number | null = null;
  if (mod.order > 1) {
    const prevModule = await prisma.module.findFirst({ where: { order: mod.order - 1 } });
    if (prevModule) {
      const prevProgress = await prisma.moduleProgress.findUnique({
        where: { userId_moduleId: { userId: user.id, moduleId: prevModule.id } },
      });
      prevMediumScore = prevProgress?.mediumScore ?? null;
    }
  }
  const unlocked = isModuleUnlocked(mod.order, prevMediumScore);

  // Attach attempt info per question
  const attempts = await prisma.questionAttempt.findMany({
    where: { userId: user.id, questionId: { in: mod.questions.map((q) => q.id) } },
  });
  const attemptMap = new Map(attempts.map((a) => [a.questionId, a]));

  const questions = mod.questions.map((q) => ({
    id: q.id,
    number: q.number,
    name: q.name,
    topics: q.topics,
    leetcodeUrl: q.leetcodeUrl,
    difficulty: q.difficulty,
    orderInModule: q.orderInModule,
    attempt: attemptMap.get(q.id) ?? null,
  }));

  return Response.json({ module: { ...mod, questions: undefined }, questions, progress, unlocked });
}
