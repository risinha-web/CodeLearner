import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const progress = await prisma.moduleProgress.findMany({
    where: { userId: user.id },
    include: { module: { select: { id: true, name: true, slug: true, order: true } } },
    orderBy: { module: { order: "asc" } },
  });

  return Response.json({ progress });
}
