import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isModuleUnlocked } from "@/lib/game-logic";
import Navbar from "@/components/game/Navbar";
import ModuleMap from "@/components/game/ModuleMap";
import type { ModuleCardProps } from "@/components/game/ModuleCard";

export default async function DashboardPage() {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login");

  // Upsert user on first visit
  const dbUser = await prisma.user.upsert({
    where: { auth0Id: session.user.sub },
    create: {
      auth0Id: session.user.sub,
      email: session.user.email ?? "",
      name: session.user.name ?? null,
      avatarUrl: session.user.picture ?? null,
    },
    update: {
      email: session.user.email ?? undefined,
      name: session.user.name ?? undefined,
      avatarUrl: session.user.picture ?? undefined,
    },
  });

  const modules = await prisma.module.findMany({ orderBy: { order: "asc" } });

  // Ensure progress rows exist
  for (const mod of modules) {
    await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId: dbUser.id, moduleId: mod.id } },
      create: { userId: dbUser.id, moduleId: mod.id },
      update: {},
    });
  }

  const progressList = await prisma.moduleProgress.findMany({
    where: { userId: dbUser.id },
    include: { module: true },
    orderBy: { module: { order: "asc" } },
  });

  const cards: ModuleCardProps[] = progressList.map((p, i) => {
    const prevMedium = i > 0 ? progressList[i - 1].mediumScore : null;
    const unlocked = isModuleUnlocked(p.module.order, prevMedium);
    const status = unlocked
      ? p.status === "LOCKED"
        ? "ACTIVE"
        : (p.status as "ACTIVE" | "COMPLETED")
      : "LOCKED";

    return {
      id: p.module.id,
      name: p.module.name,
      description: p.module.description,
      order: p.module.order,
      iconKey: p.module.iconKey,
      status,
      playerDifficulty: p.playerDifficulty as "EASY" | "MEDIUM" | "HARD",
      currentPhase: p.currentPhase,
      easyScore: p.easyScore,
      mediumScore: p.mediumScore,
      hardScore: p.hardScore,
    };
  });

  const completed = cards.filter((c) => c.status === "COMPLETED").length;
  const total = cards.length;

  return (
    <div className="min-h-screen">
      <Navbar user={{ name: session.user.name, picture: session.user.picture }} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-100">
            Welcome back,{" "}
            <span className="gradient-text">
              {session.user.name?.split(" ")[0] ?? "Coder"}
            </span>{" "}
            👋
          </h1>
          <p className="mt-2 text-slate-400">
            {completed} of {total} modules completed · Keep going!
          </p>

          {/* Overall progress bar */}
          <div className="mt-4 h-2 w-full max-w-sm rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-700"
              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        <ModuleMap modules={cards} />
      </main>
    </div>
  );
}
