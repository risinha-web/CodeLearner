import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ questionId: string }> }
) {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId } = await ctx.params;
  const user = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, hintContent: true },
  });
  if (!question) return Response.json({ error: "Not found" }, { status: 404 });

  // Upsert attempt and increment hintsUsed
  const attempt = await prisma.questionAttempt.upsert({
    where: { userId_questionId: { userId: user.id, questionId } },
    create: { userId: user.id, questionId, hintsUsed: 1 },
    update: { hintsUsed: { increment: 1 } },
  });

  return Response.json({ hintContent: question.hintContent, hintsUsed: attempt.hintsUsed });
}
