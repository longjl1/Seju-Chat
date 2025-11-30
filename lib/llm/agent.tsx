// lib/agent.ts

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import { ragQueryTool } from "@/lib/tools/ragQueryTool";

export function buildAgent() {
  const llm = new ChatGoogleGenerativeAI({
    // model: "gemini-2.5-flash-lite",
    model: "gemini-2.5-flash-preview-09-2025",
    apiKey: process.env.GOOGLE_API_KEY,
    maxOutputTokens: 2048,
  });

  const agent = createAgent({
    model: llm,
    tools: [ragQueryTool],
  });

  return agent;
}
