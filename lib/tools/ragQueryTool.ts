// lib/tools/ragQueryTool.ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { retrieveContext } from "@/lib/rag/retrieve";

export const ragQueryTool = tool(
  async ({ question }) => {
    console.log("[rag_query] called with question:", question);

    try {
      const context = await retrieveContext(question, 4);

      if (!context || context.length === 0) {
        return "向量库中没有检索到相关内容。";
      }

      return context
        .map((c) => {
          const src = c.metadata?.source;
          const page = c.metadata?.page;
          const prefix = src
            ? `[${src}${page != null ? ` p.${page}` : ""}] `
            : "";
          return prefix + c.text;
        }) .join("\n\n-----\n\n");
    } catch (err: any) {
      console.error("[rag_query] error:", err);
      return `检索向量库时发生错误：${err?.message || String(err)}`;
    }
  },
  {
    name: "rag_query",
    description:
      "你是一个智能助手，用户会向你提问各种问题。如果你觉得需要从文档中获取信息来回答用户的问题，请使用这个工具。输入是用户的问题，输出是从向量库中检索到的相关内容。请确保只在需要时调用这个工具。",
    schema: z.object({
      question: z.string().describe("用户的问题或查询"),
    }),
  }
);

