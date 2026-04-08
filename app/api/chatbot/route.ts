import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/db";
import { buildChatbotSystemPrompt, streamChatResponse } from "@/lib/claude";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { message, questionId, conversationHistory = [] } = await request.json();

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { module: { select: { name: true } } },
  });
  if (!question) return Response.json({ error: "Question not found" }, { status: 404 });

  const systemPrompt = buildChatbotSystemPrompt(question.name, question.module.name);

  const history = [
    ...(conversationHistory as { role: "user" | "assistant"; content: string }[]),
    { role: "user" as const, content: message },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChatResponse(systemPrompt, history, "claude-haiku-4-5-20251001")) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
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
