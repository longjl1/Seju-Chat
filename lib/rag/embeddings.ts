// lib/rag/embeddings.ts
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export function getEmbeddingModel() {
  return new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "models/text-embedding-004",
  });
}
