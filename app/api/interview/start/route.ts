import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";
import { buildInterviewSystemPrompt, streamChatResponse } from "@/lib/claude";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const { questionId } = await request.json();

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { module: true },
  });
  if (!question) return Response.json({ error: "Question not found" }, { status: 404 });

  const attempt = await prisma.questionAttempt.findUnique({
    where: { userId_questionId: { userId: user.id, questionId } },
  });
  const hintsUsed = attempt?.hintsUsed ?? 0;
  const difficultyModifier = Math.min(hintsUsed, 2);

  // Create interview session
  const session_ = await prisma.interviewSession.create({
    data: {
      userId: user.id,
      questionId,
      difficultyModifier,
      totalQuestions: 5,
    },
  });

  const systemPrompt = buildInterviewSystemPrompt(
    question.name,
    question.module.name,
    question.difficulty,
    difficultyModifier,
    5
  );

  // Get opening message from AI (streaming)
  const encoder = new TextEncoder();
  let fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChatResponse(systemPrompt, [], "claude-sonnet-4-6")) {
          fullText += chunk;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        }
        // Save opening message to session
        await prisma.interviewSession.update({
          where: { id: session_.id },
          data: {
            messages: [{ role: "assistant", content: fullText, ts: new Date().toISOString() }],
            questionsAsked: 1,
          },
        });
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, sessionId: session_.id })}\n\n`)
        );
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
