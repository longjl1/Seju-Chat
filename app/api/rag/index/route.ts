// app/api/rag/index/route.ts
import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { loadDocumentsFromFolder } from "@/lib/rag/files"; // 你的 DirectoryLoader
import { getVectorsCollection } from "@/lib/db/mongo";
import { getEmbeddingModel } from "@/lib/rag/embeddings";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";

export const runtime = "nodejs";

export async function POST() {
  try {
    console.log("rebuild vector store...");

    const rawDocs = await loadDocumentsFromFolder();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitDocuments(rawDocs);

    const collection = await getVectorsCollection();
    await collection.deleteMany({});
    const embeddings = getEmbeddingModel();

    // LangChain method to directly create vector store
    // { text: ..., embedding: [...], metadata: {...} }
    await MongoDBAtlasVectorSearch.fromDocuments(chunks, embeddings, {
      collection,
      indexName: process.env.MONGODB_VECTOR_INDEX_NAME || "rag_vector_index",
      textKey: "text",
      embeddingKey: "embedding",
    });

    console.log(
      `finished ：${chunks.length}`
    );

    return NextResponse.json({
      success: true,
      chunks: chunks.length,
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { success: false, error: "Rebuilding failed!" },
      { status: 500 }
    );
  }
}
