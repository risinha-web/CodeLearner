import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  return Response.json({ user });
}

export async function PATCH(request: Request) {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const body = await request.json();
  const { leetcodeUsername } = body;

  if (typeof leetcodeUsername !== "string") {
    return Response.json({ error: "leetcodeUsername must be a string" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { leetcodeUsername: leetcodeUsername.trim() || null },
  });

  return Response.json({ user: updated });
}
