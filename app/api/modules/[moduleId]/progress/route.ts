import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ moduleId: string }> }
) {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { moduleId } = await ctx.params;
  const user = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const progress = await prisma.moduleProgress.findUnique({
    where: { userId_moduleId: { userId: user.id, moduleId } },
  });

  return Response.json({ progress });
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ moduleId: string }> }
) {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { moduleId } = await ctx.params;
  const user = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const body = await request.json();
  const { phase, currentQuestionId, playerDifficulty, easyScore, mediumScore, hardScore, status } = body;

  const progress = await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId: user.id, moduleId } },
    create: {
      userId: user.id,
      moduleId,
      status: status ?? "ACTIVE",
      currentPhase: phase ?? "INTRO",
      currentQuestionId: currentQuestionId ?? null,
      playerDifficulty: playerDifficulty ?? "EASY",
    },
    update: {
      ...(phase && { currentPhase: phase }),
      ...(currentQuestionId !== undefined && { currentQuestionId }),
      ...(playerDifficulty && { playerDifficulty }),
      ...(easyScore !== undefined && { easyScore }),
      ...(mediumScore !== undefined && { mediumScore }),
      ...(hardScore !== undefined && { hardScore }),
      ...(status && { status }),
    },
  });

  return Response.json({ progress });
}
