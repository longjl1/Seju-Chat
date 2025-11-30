// lib/llm/agentStream.ts
import { buildAgent } from "@/lib/llm/agent";

export async function streamAgent(
  messages: { role: string; content: string }[]
) {
  const agent = buildAgent();

  // agent inputs
  const agentInputs = {
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  const stream = await agent.stream(agentInputs, {
    streamMode: "values", 
  });

  return stream;
}
