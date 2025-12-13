import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const res = await fetch(`https://wilayah.id/api/districts/${code}.json`);
    if (!res.ok) throw new Error("Gagal fetch data");
    const json = await res.json();
    return NextResponse.json(json.data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}
