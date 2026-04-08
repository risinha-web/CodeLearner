import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";

// Called after login to upsert the user in our DB
export async function POST() {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { sub, email, name, picture } = session.user;

  const user = await prisma.user.upsert({
    where: { auth0Id: sub },
    create: {
      auth0Id: sub,
      email: email ?? "",
      name: name ?? null,
      avatarUrl: picture ?? null,
    },
    update: {
      email: email ?? undefined,
      name: name ?? undefined,
      avatarUrl: picture ?? undefined,
    },
  });

  return Response.json({ user });
}
