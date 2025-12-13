import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("disaster");
    const poskos = await db
      .collection("poskos")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: poskos });
  } catch (error) {
    console.error("GET poskos error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data posko" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      partner = null,
      pic = null,
      lat,
      lng,
      disasterType = "banjir",
      poskoTypes = [],
      urgentNeeds = [],
      volunteersCount = 0,
      victimsCount = 0,
      medicalStaffCount = 0,
      contact = "",
      description = "",
      province = null,
      regency = null,
      district = null,
      village = null,
    } = body;

    if (!name || !lat || !lng) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama posko, latitude, dan longitude wajib diisi",
        },
        { status: 400 }
      );
    }

    const parsedLat = parseFloat(lat as string);
    const parsedLng = parseFloat(lng as string);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return NextResponse.json(
        { success: false, message: "Koordinat tidak valid" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("disaster");

    const result = await db.collection("poskos").insertOne({
      name: name.trim(),
      partner: partner?.trim() || null,
      pic: pic?.trim() || null,
      lat: parsedLat,
      lng: parsedLng,
      disasterType,
      poskoTypes,
      urgentNeeds,
      volunteersCount: Number(volunteersCount),
      victimsCount: Number(victimsCount),
      medicalStaffCount: Number(medicalStaffCount),
      contact: contact.trim(),
      description: description.trim(),
      province,
      regency,
      district,
      village,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Posko berhasil dilaporkan",
      data: {
        _id: result.insertedId,
        ...body,
        lat: parsedLat,
        lng: parsedLng,
      },
    });
  } catch (error) {
    console.error("POST poskos error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
