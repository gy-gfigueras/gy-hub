import { auth0 } from "@/app/lib/auth0";
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/me
 * Obtiene el perfil completo del usuario autenticado con datos de MongoDB
 */
export async function GET() {
  try {
    const session = await auth0.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session?.user.sub;

    if (!userId) {
      return NextResponse.json({ error: "No user session" }, { status: 401 });
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return NextResponse.json(
        { error: "Missing MongoDB URI" },
        { status: 500 }
      );
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();

      const db = client.db("GYAccounts");
      const db_books = client.db("GYBooks");
      const collection = db.collection("Metadata");
      const collection_books = db_books.collection("Metadata");

      const userDoc = await collection.findOne({ userId });

      if (!userDoc) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const profileId = userDoc?.profile?.id;
      const userBooksDoc = await collection_books.findOne({ profileId });

      return NextResponse.json({
        ...userDoc.profile,
        biography: userBooksDoc?.biography || "",
        userId,
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
