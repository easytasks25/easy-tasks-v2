import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Prüft: ENV vorhanden + DB erreichbar
    const now = await prisma.$queryRaw`select now()`;
    return NextResponse.json({ ok: true, now });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
