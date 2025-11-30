// app/api/rag/search/route.ts
import { NextResponse } from "next/server";
import { retrieveContext } from "@/lib/rag/retrieve";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body.query as string | undefined;
    const k = (body.k as number | undefined) ?? 4;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, error: " lack of query? " },
        { status: 400 }
      );
    }

    const results = await retrieveContext(query, k);

    return NextResponse.json({
      success: true,
      query,
      k,
      results,
    });
  } catch (err) {
    console.error("[RAG] search error:", err);
    return NextResponse.json(
      { success: false, error: "indexing failed" },
      { status: 500 }
    );
  }
}
