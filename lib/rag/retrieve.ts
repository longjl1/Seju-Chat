// lib/rag/retrieve.ts
import { getVectorStore } from "./vectorStore";

export type RetrievedChunk = {
  text: string;
  metadata?: Record<string, any>;
};

export async function retrieveContext(
  query: string,
  k: number = 4
): Promise<RetrievedChunk[]> {
  const store = await getVectorStore();

  // similarity search
  const docs = await store.similaritySearch(query, k);

  return docs.map((d) => ({
    text: d.pageContent,
    metadata: d.metadata,
  }));
}
