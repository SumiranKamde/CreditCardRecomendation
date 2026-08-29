import { NextResponse } from "next/server";
import { VERIFIED_CARDS } from "@/app/lib/catalogueData";

export async function GET() {
  return NextResponse.json({
    count: VERIFIED_CARDS.length,
    cards: VERIFIED_CARDS,
  });
}
