import { MongoClient } from "mongodb";
import "dotenv/config"; // 确保可以读 .env.local or .env

const uri = process.env.MONGODB_ATLAS_URI;  // 用你现在 env 里的变量名

async function main() {
  console.log("URI =", uri);
  const client = new MongoClient(uri);
  await client.connect();
  console.log("✅ connected to MongoDB Atlas");

  const db = client.db(process.env.MONGODB_ATLAS_DB_NAME || "seju_db");
  const col = db.collection("test");

  const result = await col.insertOne({ hello: "world", ts: new Date() });
  console.log("inserted id:", result.insertedId);

  await client.close();
  console.log("✅ closed");
}

main().catch((e) => console.error("❌ test error:", e));
