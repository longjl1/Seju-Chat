// import { NextResponse } from "next/server";
// import { getMongoCollection } from "@/lib/db/mongo";

// export const runtime = "nodejs";

// export async function GET() {
//   try {
//     const collection = await getMongoCollection();

//     
//     const insertResult = await collection.insertOne({
//       text: "hello mongo",
//       createdAt: new Date(),
//     });

//     
//     const doc = await collection.findOne({ _id: insertResult.insertedId });

//     return NextResponse.json({
//       ok: true,
//       insertedId: insertResult.insertedId,
//       doc,
//     });
//   } catch (err) {
//     console.error("DB test error:", err);
//     return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
//   }
// }
