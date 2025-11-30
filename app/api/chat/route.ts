// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { streamAgent } from "@/lib/llm/agentStream";

export const runtime = "nodejs";

type FrontendMessage = {
  role: string;
  content: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const messages = (body?.messages ?? []) as FrontendMessage[];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages is empty" },
        { status: 400 }
      );
    }

    
    const stream = await streamAgent(messages);
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        // record last sent text to avoid duplicates
        let lastText = "";

        try {
          for await (const step of stream as any) {
            const msgs = (step as any).messages ?? step;
            if (!Array.isArray(msgs) || msgs.length === 0) continue;

            const last = msgs[msgs.length - 1];
            if (!last) continue;

            // determine type
            const type: string | undefined =
              typeof last._getType === "function"
                ? last._getType()
                : (last.type ?? last.role);

            if (type !== "ai" && type !== "assistant") {
              // human / tool 等都跳过
              continue;
            }

            // get content
            let text = "";

            if (typeof last.content === "string") {
              text = last.content;
            } else if (Array.isArray(last.content)) {
              text = last.content
                .map((c: any) =>
                  typeof c === "string" ? c : c?.text ?? ""
                )
                .join("");
            }

            if (!text) continue;

            // avoid sending duplicate text
            const delta = text.slice(lastText.length);
            if (delta) {
              lastText = text;
              controller.enqueue(encoder.encode(delta));
            }
          }

          
          controller.close();
        } catch (e) {
          console.error("Stream error:", e);
        
          controller.error(e);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat API Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
