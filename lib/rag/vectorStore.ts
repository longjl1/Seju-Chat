// lib/rag/vectorStore.ts
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { getVectorsCollection } from "@/lib/db/mongo";
import { getEmbeddingModel } from "./embeddings";

const INDEX_NAME =
  process.env.MONGODB_VECTOR_INDEX_NAME || "rag_vector_index";

export async function getVectorStore() {
    
    const collection = await getVectorsCollection();
    const embeddings = getEmbeddingModel();

    const store = new MongoDBAtlasVectorSearch(embeddings, {
        collection,
        indexName: INDEX_NAME,
        textKey: "text",
        embeddingKey: "embedding",
    });

    return store;
}
