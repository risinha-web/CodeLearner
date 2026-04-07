import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";
import { buildInterviewSystemPrompt, streamChatResponse, extractInterviewScore } from "@/lib/claude";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const { sessionId, userMessage } = await request.json();

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: { question: { include: { module: true } } },
  });
  if (!interviewSession || interviewSession.userId !== user.id) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const systemPrompt = buildInterviewSystemPrompt(
    interviewSession.question.name,
    interviewSession.question.module.name,
    interviewSession.question.difficulty,
    interviewSession.difficultyModifier,
    interviewSession.totalQuestions
  );

  // Rebuild message history
  const history = (interviewSession.messages as { role: string; content: string }[]).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  history.push({ role: "user", content: userMessage });

  const encoder = new TextEncoder();
  let fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChatResponse(systemPrompt, history, "claude-sonnet-4-6")) {
          fullText += chunk;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        }

        // Save updated messages
        const updatedMessages = [
          ...history,
          { role: "assistant", content: fullText, ts: new Date().toISOString() },
        ];
        const newQuestionsAsked = interviewSession.questionsAsked + 1;
        const isComplete = newQuestionsAsked >= interviewSession.totalQuestions;

        // Try to extract score from final message
        const scoreData = isComplete ? extractInterviewScore(fullText) : null;

        await prisma.interviewSession.update({
          where: { id: sessionId },
          data: {
            messages: updatedMessages,
            questionsAsked: newQuestionsAsked,
            ...(isComplete && {
              status: "COMPLETED",
              completedAt: new Date(),
              score: scoreData?.score ?? null,
              feedback: scoreData?.feedback ?? null,
            }),
          },
        });

        // Update attempt with interview score
        if (isComplete && scoreData) {
          const existingAttempt = await prisma.questionAttempt.findUnique({
            where: { userId_questionId: { userId: user.id, questionId: interviewSession.questionId } },
          });
          if (existingAttempt) {
            const total = Math.round(
              ((existingAttempt.codingScore ?? 50) + scoreData.score) / 2
            );
            await prisma.questionAttempt.update({
              where: { userId_questionId: { userId: user.id, questionId: interviewSession.questionId } },
              data: {
                interviewScore: scoreData.score,
                totalScore: total,
                completedAt: new Date(),
              },
            });
          }
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              done: true,
              isComplete,
              score: scoreData?.score ?? null,
              feedback: scoreData?.feedback ?? null,
              strengths: scoreData?.strengths ?? null,
              improvements: scoreData?.improvements ?? null,
            })}\n\n`
          )
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
