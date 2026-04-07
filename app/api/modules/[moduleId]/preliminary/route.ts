import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";
import { assessPlayerDifficulty } from "@/lib/game-logic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ moduleId: string }> }
) {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { moduleId } = await ctx.params;

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, name: true, preliminaryQuestions: true },
  });
  if (!mod) return Response.json({ error: "Module not found" }, { status: 404 });

  return Response.json({ questions: mod.preliminaryQuestions });
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ moduleId: string }> }
) {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { moduleId } = await ctx.params;

  const user = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const { score } = await request.json();
  const playerDifficulty = assessPlayerDifficulty(score);

  // Get first question for this module
  const firstQuestion = await prisma.question.findFirst({
    where: { moduleId },
    orderBy: { orderInModule: "asc" },
  });

  const progress = await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId: user.id, moduleId } },
    create: {
      userId: user.id,
      moduleId,
      status: "ACTIVE",
      playerDifficulty,
      currentPhase: "CODING",
      currentQuestionId: firstQuestion?.id ?? null,
    },
    update: {
      playerDifficulty,
      currentPhase: "CODING",
      currentQuestionId: firstQuestion?.id ?? null,
    },
  });

  return Response.json({ progress, playerDifficulty, firstQuestionId: firstQuestion?.id });
}
