// lib/db/mongo.ts
import { MongoClient, Collection } from "mongodb";

const MONGODB_URI = process.env.MONGODB_ATLAS_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_ATLAS_DB_NAME || "seju_db";
const DOCS_COLLECTION =
  process.env.MONGODB_ATLAS_DOCS_COLLECTION_NAME || "docs";
const VECTORS_COLLECTION =
  process.env.MONGODB_ATLAS_COLLECTION_NAME || "vectors";

let client: MongoClient | null = null;

function isClientClosed(c: MongoClient | null) {
  // if client is null or closed
  return !c || (c as any).topology?.isDestroyed?.() || (c as any).topology?.s?.closed;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (isClientClosed(client)) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client!;
}

export async function getDocsCollection(): Promise<Collection> {
  const c = await getMongoClient();
  const db = c.db(MONGODB_DB_NAME);
  return db.collection(DOCS_COLLECTION);
}

export async function getVectorsCollection(): Promise<Collection> {
  const c = await getMongoClient();
  const db = c.db(MONGODB_DB_NAME);
  return db.collection(VECTORS_COLLECTION);
}
