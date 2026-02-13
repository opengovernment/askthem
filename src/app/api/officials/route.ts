import { NextResponse } from "next/server";
import { getAllOfficials } from "@/lib/queries";

export async function GET() {
  const officials = await getAllOfficials();
  return NextResponse.json(officials);
}
