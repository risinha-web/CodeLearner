import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";
import { computeCodingScore } from "@/lib/game-logic";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ questionId: string }> }
) {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId } = await ctx.params;
  const user = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const { interviewScore, codingCompleted, timeSeconds } = body;

  const existing = await prisma.questionAttempt.findUnique({
    where: { userId_questionId: { userId: user.id, questionId } },
  });

  const hintsUsed = existing?.hintsUsed ?? 0;
  const codingScore = codingCompleted ? computeCodingScore(hintsUsed, timeSeconds) : existing?.codingScore ?? null;
  const total =
    codingScore !== null && interviewScore !== null && interviewScore !== undefined
      ? Math.round((codingScore + interviewScore) / 2)
      : null;

  const attempt = await prisma.questionAttempt.upsert({
    where: { userId_questionId: { userId: user.id, questionId } },
    create: {
      userId: user.id,
      questionId,
      hintsUsed,
      codingCompleted: codingCompleted ?? false,
      codingScore: codingScore ?? null,
      interviewScore: interviewScore ?? null,
      totalScore: total,
      completedAt: total !== null ? new Date() : null,
    },
    update: {
      ...(codingCompleted !== undefined && { codingCompleted }),
      ...(codingScore !== null && { codingScore }),
      ...(interviewScore !== undefined && { interviewScore }),
      ...(total !== null && { totalScore: total, completedAt: new Date() }),
    },
  });

  return Response.json({ attempt });
}
