import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ questionId: string }> }
) {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId } = await ctx.params;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      number: true,
      name: true,
      topics: true,
      leetcodeUrl: true,
      difficulty: true,
      orderInModule: true,
      moduleId: true,
            interviewQuestions: true,
      // hintContent excluded by default — only revealed via /hint endpoint
    },
  });

  if (!question) return Response.json({ error: "Question not found" }, { status: 404 });
  return Response.json({ question });
}
