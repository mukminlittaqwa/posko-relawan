import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://wilayah.id/api/provinces.json");
    if (!res.ok) throw new Error("Gagal fetch provinsi");
    const data = await res.json();
    return NextResponse.json(data.data);
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memuat provinsi" },
      { status: 500 }
    );
  }
}
