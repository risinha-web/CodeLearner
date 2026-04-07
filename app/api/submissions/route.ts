import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import { computeCodingScore } from "@/lib/game-logic";

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const formData = await request.formData();
  const questionId = formData.get("questionId") as string;
  const file = formData.get("screenshot") as File | null;
  const timeSeconds = formData.get("timeSeconds") ? Number(formData.get("timeSeconds")) : undefined;

  if (!questionId || !file) {
    return Response.json({ error: "questionId and screenshot are required" }, { status: 400 });
  }

  // Upload screenshot to Vercel Blob
  const blob = await put(`submissions/${user.id}/${questionId}-${Date.now()}.png`, file, {
    access: "public",
  });

  // Get existing attempt for hints count
  const existing = await prisma.questionAttempt.findUnique({
    where: { userId_questionId: { userId: user.id, questionId } },
  });
  const hintsUsed = existing?.hintsUsed ?? 0;
  const codingScore = computeCodingScore(hintsUsed, timeSeconds);

  const attempt = await prisma.questionAttempt.upsert({
    where: { userId_questionId: { userId: user.id, questionId } },
    create: {
      userId: user.id,
      questionId,
      hintsUsed,
      screenshotUrl: blob.url,
      codingCompleted: true,
      codingScore,
    },
    update: {
      screenshotUrl: blob.url,
      codingCompleted: true,
      codingScore,
    },
  });

  return Response.json({ url: blob.url, attempt });
}
