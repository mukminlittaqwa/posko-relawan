export const runtime = "nodejs";

import clientPromise from "@/lib/mongodb";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const poskos = await db
      .collection("poskos")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return Response.json({ success: true, data: poskos });
  } catch (error) {
    return Response.json({ success: false, error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      lat,
      lng,
      disasterType = "banjir",
      urgentNeeds = [],
      volunteersCount = 0,
      victimsCount = 0,
      contact = "",
      description = "",
    } = body;

    if (!name || !lat || !lng) {
      return Response.json(
        { success: false, message: "Nama dan koordinat wajib diisi" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("disaster");

    const result = await db.collection("poskos").insertOne({
      name,
      lat: parseFloat(lat as string),
      lng: parseFloat(lng as string),
      disasterType,
      urgentNeeds,
      volunteersCount: Number(volunteersCount),
      victims: Number(victimsCount),
      contact,
      description,
      createdAt: new Date(),
    });

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ success: false, error }, { status: 500 });
  }
}
