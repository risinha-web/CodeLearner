import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";
import { isModuleUnlocked } from "@/lib/game-logic";

export async function GET() {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const modules = await prisma.module.findMany({ orderBy: { order: "asc" } });

  // Ensure ModuleProgress rows exist for all modules
  for (const mod of modules) {
    await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId: user.id, moduleId: mod.id } },
      create: { userId: user.id, moduleId: mod.id, status: "LOCKED" },
      update: {},
    });
  }

  const progressList = await prisma.moduleProgress.findMany({
    where: { userId: user.id },
    include: { module: true },
    orderBy: { module: { order: "asc" } },
  });

  // Compute unlock status dynamically
  const result = progressList.map((p, i) => {
    const prevMediumScore = i > 0 ? progressList[i - 1].mediumScore : null;
    const unlocked = isModuleUnlocked(p.module.order, prevMediumScore);
    const status = unlocked ? (p.status === "LOCKED" ? "ACTIVE" : p.status) : "LOCKED";

    // Count completed questions
    return {
      id: p.module.id,
      slug: p.module.slug,
      name: p.module.name,
      description: p.module.description,
      order: p.module.order,
      iconKey: p.module.iconKey,
      status,
      playerDifficulty: p.playerDifficulty,
      currentPhase: p.currentPhase,
      easyScore: p.easyScore,
      mediumScore: p.mediumScore,
      hardScore: p.hardScore,
    };
  });

  return Response.json({ modules: result });
}
